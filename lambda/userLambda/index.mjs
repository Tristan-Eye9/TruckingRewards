import mysql from 'mysql2/promise';

//Note that the handler assumes the root path is associated with 
//https://API.com/dev1/user
const API_STAGE = '/dev1';

export const handler = async (event) => {
    // Extract method and path from requestContext

    const httpMethod = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    const pathParts = path.split("/");
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const schema = 'Team22DB';


    //FUNCTIONS
    //UserExists function returns if a user exists
    //input: User email and the DB connection
    const userExists = async (email, connection) => {
        const [result] = await connection.execute(`
            SELECT * FROM users
            WHERE email = ?`,
            [email]
        );
        return result.length > 0;
    };

    // Log the method and path for debugging
    console.log(`Received request with method: ${httpMethod}, path: ${path}`);

    try {
        const connection = await mysql.createConnection({
            host: 'host.com',
            user: 'user',
            password: 'password',
            database: 'database'
        });

        let response;

        // GET: Fetch all sponsor companies
        if (httpMethod === 'GET' && path === `${API_STAGE}/companies`) {
            await connection.query(`USE ${schema}`);
            const [rows] = await connection.execute(`SELECT * FROM sponsor_companies`);
            console.log('Query Result:', rows);

            response = {
                statusCode: 200,
                body: JSON.stringify(rows),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            };
        }

        // POST: Add a new sponsor company
        else if (httpMethod === 'POST' && path === `${API_STAGE}/companies`) {
            const requestBody = JSON.parse(event.body);
            const { company_name } = requestBody;

            if (!company_name) {
                response = {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Company name is required' }),
                };
            } else {
                await connection.execute(
                    `INSERT INTO sponsor_companies (company_name) VALUES (?)`,
                    [company_name]
                );

                response = {
                    statusCode: 201,
                    body: JSON.stringify({ message: "Sponsor company added successfully" }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                };
            }
        }

        // Invalid request
        else {
            response = {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request' }),
            };
        }

        // --- POST /application ---
        if (httpMethod === "POST" && path === `${API_STAGE}/application`) {
            const body = JSON.parse(event.body || '{}');
            const { driverEmail, sponsorCompanyID, fullName } = body;

            if (!driverEmail || !sponsorCompanyID || !fullName) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing required fields" }),
                };
            }

            const insertQuery = `
              INSERT INTO application (driverEmail, sponsorCompanyID, fullName, status, submitted_at)
              VALUES (?, ?, ?, 'submitted', NOW())
            `;

            await connection.execute(insertQuery, [driverEmail, sponsorCompanyID, fullName]);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Application submitted successfully." }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }



        // --- GET /application/driver?email=driver@example.com ---
        else if (httpMethod === 'GET' && path === `${API_STAGE}/application/driver`) {
            const email = event.queryStringParameters?.email;

            if (!email) {
                response = {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing email query param' }),
                };
            } else {
                const [rows] = await connection.execute(
                    `
            SELECT a.*, s.company_name AS sponsor_name
            FROM application a
            JOIN sponsor_companies s ON a.sponsorCompanyID = s.id
            WHERE a.driverEmail = ?
            ORDER BY a.submitted_at DESC
            `,
                    [email]
                );

                response = {
                    statusCode: 200,
                    body: JSON.stringify(rows),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                };
            }
        }


        // --- GET /application/sponsor?sponsorCompanyID=1 ---
        else if (httpMethod === 'GET' && path === `${API_STAGE}/application/sponsor`) {
            const sponsorCompanyID = event.queryStringParameters?.sponsorCompanyID;

            if (!sponsorCompanyID) {
                response = {
                    statusCode: 400,
                    body: JSON.stringify([]), // Return empty array if no ID
                };
            } else {
                const [rows] = await connection.execute(
                    `SELECT appID, driverEmail, fullName, status, submitted_at
                     FROM application
                     WHERE sponsorCompanyID = ? AND status IN ('submitted', 'pending')
                     ORDER BY submitted_at DESC`,
                    [sponsorCompanyID]
                );

                response = {
                    statusCode: 200,
                    body: JSON.stringify(rows),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                };
            }
        }

        // --- PATCH /application/status ---
        else if (httpMethod === 'PATCH' && path === `${API_STAGE}/application/status`) {
            const { appID, newStatus } = JSON.parse(event.body || '{}');

            if (appID == undefined || !newStatus) {
                response = {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields (appID, newStatus)' }),
                };
            } else {
                try {
                    // 1. Fetch the application
                    const [rows] = await connection.execute(
                        `SELECT driverEmail, sponsorCompanyID FROM application WHERE appID = ?`,
                        [appID]
                    );

                    if (!rows || rows.length === 0) {
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ error: 'Application not found' }),
                        };
                    } else {
                        const { driverEmail, sponsorCompanyID } = rows[0];

                        // 2. Update the status
                        await connection.execute(
                            `UPDATE application SET status = ? WHERE appID = ?`,
                            [newStatus, appID]
                        );

                        // 3. If status is accepted, add connection and initial points
                        if (newStatus === 'accepted') {
                            // Avoid duplicate connection
                            const [existing] = await connection.execute(
                                `SELECT * FROM driver_sponsors WHERE driverEmail = ? AND sponsorCompanyID = ?`,
                                [driverEmail, sponsorCompanyID]
                            );

                            if (existing.length === 0) {
                                await connection.execute(
                                    `INSERT INTO driver_sponsors (driverEmail, sponsorCompanyID, connected_at) VALUES (?, ?, NOW())`,
                                    [driverEmail, sponsorCompanyID]
                                );
                            }

                            // Correctly insert sponsorCompanyID as integer, not company name
                            await connection.execute(
                                `INSERT INTO points (email, points, description, sponsorCompanyID, created_at)
                                 VALUES (?, 0, 'Initial connection', ?, NOW())`,
                                [driverEmail, sponsorCompanyID]
                            );
                        }

                        // No insert for 'rejected'

                        response = {
                            statusCode: 200,
                            body: JSON.stringify({ message: 'Status updated successfully' }),
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        };
                    }
                } catch (err) {
                    console.error('Error updating application status:', err);
                    response = {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Internal server error' }),
                    };
                }
            }
        }



        //GET handler for user points
        if (httpMethod === 'GET') {

            // --- GET /drivers?sponsorCompanyName=CompanyName ---
            if (path === `${API_STAGE}/drivers`) {
                const sponsorCompanyName = event.queryStringParameters?.sponsorCompanyName;

                if (!sponsorCompanyName) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing sponsorCompanyName query parameter' }),
                    };
                } else {
                    await connection.query(`USE ${schema}`);

                    const [companyRows] = await connection.execute(
                        `SELECT id FROM sponsor_companies WHERE company_name = ?`,
                        [sponsorCompanyName]
                    );

                    if (!companyRows || companyRows.length === 0) {
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ error: 'Sponsor company not found' }),
                        };
                    } else {
                        const sponsorCompanyID = companyRows[0].id;

                        const [driverRows] = await connection.execute(
                        `SELECT d.driverEmail, d.sponsorCompanyID
                        FROM driver_sponsors d
                        JOIN users u ON d.driverEmail = u.email
                        WHERE d.sponsorCompanyID = ?`,
                        [sponsorCompanyID]
                        );

                        response = {
                            statusCode: 200,
                            body: JSON.stringify(driverRows),
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        };
                    }
                }

                return response;
            }

            // --- GET /user/points/history?email=driver@example.com ---
            else if (httpMethod === 'GET' && path === `${API_STAGE}/user/points/history`) {
                const email = event.queryStringParameters?.email;

                if (!email) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing required query parameter: email' }),
                    };
                } else {
                    await connection.query(`USE ${schema}`);

                    const [rows] = await connection.execute(`
                    SELECT p.points, p.description, p.created_at, s.company_name AS sponsorCompanyName
                    FROM points p
                    JOIN sponsor_companies s ON p.sponsorCompanyID = s.id
                    WHERE p.email = ?
                    ORDER BY p.created_at DESC
                    `, [email]
                    );

                    response = {
                        statusCode: 200,
                        body: JSON.stringify(rows),
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    };
                }
            }


            // GET /user/points - Get total points for a driver from a specific sponsor
            else if (path === `${API_STAGE}/user/points`) {

                // Extract email and organization from the query string parameters
                const email = event.queryStringParameters?.email;
                const sponsorCompanyID = event.queryStringParameters?.sponsorCompanyID;
                console.log(`Query string params: email=${email}, sponsorCompanyID=${sponsorCompanyID}`);

                // Both email and organization are required now
                if (!email || !sponsorCompanyID) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing required query parameters: email and organization' }),
                    };
                } else {
                    await connection.query(`USE ${schema}`);
                    console.log(`Using schema: ${schema}`);

                    // Check if the user exists (using the email)
                    const exists = await userExists(email, connection);

                    if (!exists) {
                        console.log(`User email not found: ${email}`);
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ error: `User ${email} not found` }),
                        };
                    } else {
                        console.log(`User exists: ${email}`);
                        // Query to sum points for the specific email and organization
                        const [rows] = await connection.execute(`
                            SELECT SUM(points) AS totalPoints
                            FROM points
                            WHERE email = ? AND sponsorCompanyID = ?
                        `, [email, sponsorCompanyID]);
                        const totalPoints = rows[0].totalPoints || 0;

                        response = {
                            statusCode: 200,
                            body: JSON.stringify({ email, sponsorCompanyID, totalPoints }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };
                    }
                }
            }        

            //GET user/{email} get user based on their email
            else if (path.startsWith(`${API_STAGE}/user`) && pathParts.length === 4) {
                const email = pathParts[pathParts.length - 1];

                //Set schema to our own DB schema
                await connection.query(`USE ${schema}`);

                const [rows] = await connection.execute(`
                    SELECT * 
                    FROM users
                    WHERE LOWER(email) = LOWER(?)`,
                    [email]
                );
                console.log('Query Result:', rows);

                if (rows.length === 0) {
                    console.log('No user found for email:', email);
                    response = {
                        statusCode: 404,
                        body: JSON.stringify(
                            { error: `User ${email} not found` }
                        ),
                    };
                }

                else {
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(rows),
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    };
                }
            }
        }

        else if (httpMethod === 'POST') {

            //POST /user/relation
            if (path === `${API_STAGE}/user/relation`) {
                const requestBody = JSON.parse(event.body);
                const { email1, email2, relationType } = requestBody;

                if (!email1 || !email2 || !relationType) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing required fields: email1, email2, relationType' }),
                    }
                }

                else {

                    await connection.query(`USE ${schema}`);

                    if (relationType === 'sponsor-driver') {
                        try {
                            const [result] = await connection.execute(
                                `
                                INSERT INTO user_Relationships (email_1, email_2, relationship_type)
                                SELECT s.email, d.email, ?
                                FROM users s, users d
                                WHERE s.email = ? AND s.userType = 'sponsor'
                                AND d.email = ? AND d.userType = 'driver'
                                `,
                                [relationType, email1, email2]
                            );

                            // Check if rows were inserted
                            if (result.affectedRows === 0) {
                                response = {
                                    statusCode: 400,
                                    body: JSON.stringify({ error: 'No users matched the query; relationship not created' }),
                                };
                            } else {
                                response = {
                                    statusCode: 201,
                                    body: JSON.stringify({ message: 'Relationship created successfully' }),
                                };
                            }
                        } catch (err) {
                            response = {
                                statusCode: 500,
                                body: JSON.stringify({ error: 'Input fields incorrect or SQL error' }),
                            };
                        }
                    }
                }
            }

            //POST /user/points
            if (path === `${API_STAGE}/user/points`) {
                const requestBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
                const { email, points, sponsorCompanyID, description } = requestBody;

                if (!email || points === undefined || !description || !sponsorCompanyID) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({
                            error: 'Missing required fields: email, points, description, or sponsorCompanyID'
                        }),
                    };
                } else {
                    await connection.query(`USE ${schema}`);

                    // Check if user exists
                    const exists = await userExists(email, connection);

                    if (!exists) {
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ error: 'User not found' }),
                        };
                    } else {
                        // Insert new points record
                        await connection.execute(
                        `
                        INSERT INTO points (email, points, description, sponsorCompanyID)
                        VALUES (?, ?, ?, ?)
                        `,
                        [email, points, description, sponsorCompanyID]
                        );

                        response = {
                            statusCode: 200,
                            body: JSON.stringify({ message: 'Points created successfully' }),
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        };
                    }
                }
            }



            //POST /user
            else if (path === `${API_STAGE}/user`) {

                const requestBody = JSON.parse(event.body);
                const { email, userType } = requestBody;

                if (!email || !userType) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing required fields: username and email' }),
                    }
                }

                else {

                    await connection.query(`USE ${schema}`);

                    // Check if user already exists
                    const [existingUser] = await connection.execute(`
                        SELECT * FROM users WHERE email = ?`,
                        [email]
                    );

                    if (existingUser.length > 0) {
                        response = {
                            statusCode: 409,
                            body: JSON.stringify({ error: 'User already exists' }),
                        };
                    }

                    else {
                        await connection.query(`use ${schema}`);
                        const result = await connection.execute(`
                        INSERT INTO users (email, userType)
                        VALUES (?, ?)`,
                            [email, userType]
                        );

                        response = {
                            statusCode: 201,
                            body: JSON.stringify({
                                message: `${email} created successfully`,
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };
                    }
                }
            }
        }

        else if (httpMethod === 'PATCH') {
            if (path === `${API_STAGE}/user`) {
                const requestBody = JSON.parse(event.body);
                const { email, userType } = requestBody;

                if (!email || !userType) {
                    response = {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Missing required fields: email and userType' }),
                    };
                }

                else {
                    await connection.query(`USE ${schema}`);
                    const [result] = await connection.execute(`
                        UPDATE users
                        SET userType = ?
                        WHERE email = ?`,
                        [userType, email]
                    );

                    if (result.affectedRows === 0) {
                        response = {
                            statusCode: 404,
                            body: JSON.stringify({ error: 'User not found' }),
                        };
                    } else {
                        response = {
                            statusCode: 200,
                            body: JSON.stringify({ message: 'User updated successfully' }),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };
                    }
                }
            }

            else if (path === `${API_STAGE}/user/points`) {
                //TODO - Write PATCH /user/points
            }

        }

        else if (httpMethod === 'DELETE') {
            if (path.startsWith(`${API_STAGE}/user`) && pathParts.length === 4) {
                const email = pathParts[pathParts.length - 1];
                await connection.query(`USE ${schema}`);
                const [result] = await connection.execute(`
                    DELETE FROM users
                    WHERE email = ?`,
                    [email]
                );
                if (result.affectedRows === 0) {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'User not found' }),
                    };
                } else {
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({ message: 'User deleted successfully' }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    };
                }
            }
        }


        else {
            console.log(`Method is: ${httpMethod}, Path correct: ${path.startsWith(`${API_STAGE}/user`)}, Path length: ${pathParts.length}`);
            response = {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request' }),
            };
        }

        await connection.end();
        return response;

    } catch (error) {
        console.error('Database Connection Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve data' }),
        };
    }
};
