import mysql from 'mysql2/promise';

const API_STAGE = '/dev1';

export const handler = async (event) => {
    const httpMethod = event.requestContext.http.method;
    const rawPath = event.requestContext.http.path; // Log the raw path
    const path = rawPath.replace(API_STAGE, "");  // Normalize path

    console.log(`Received Request: ${httpMethod} ${rawPath}`);
    
    const schema = 'Team22DB';

    // CORS Headers
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'CORS preflight successful' }) };
    }

    try {
        const connection = await mysql.createConnection({
            host: 'host.com',
            user: 'user',
            password: 'password',
            database: 'database'
        });

        let response;

        // GET About Page Data
        if (httpMethod === 'GET' && path === "/about") {
            await connection.query(`USE ${schema}`);
            const [rows] = await connection.execute(`SELECT * FROM about_page`);
            console.log(' Retrieved About Page Data:', rows);

            response = { statusCode: 200, body: JSON.stringify(rows), headers: corsHeaders };
        } 
        
        // POST Update About Page Data
        else if (httpMethod === 'POST' && path === "/about") {
            console.log(" Received POST request:", event.body);

            try {
                const aboutSections = JSON.parse(event.body);

                // Ensure request has the required fields
                if (!Array.isArray(aboutSections) || aboutSections.length === 0) {
                    throw new Error("Invalid request format: Expected an array");
                }

                for (const section of aboutSections) {
                    if (!section.section_name || !section.content) {
                        throw new Error(`Missing required fields in section: ${JSON.stringify(section)}`);
                    }
                    
                    console.log(`Updating section: ${section.section_name}, New Content: ${section.content}`);
                    
                    const [result] = await connection.execute(
                        `UPDATE about_page SET content = ?, last_updated = NOW() WHERE section_name = ?`,
                        [section.content, section.section_name]
                    );

                    console.log(`Rows Affected for ${section.section_name}:`, result.affectedRows);
                }

                response = { 
                    statusCode: 200, 
                    body: JSON.stringify({ message: "About page updated successfully" }),
                    headers: corsHeaders
                };
            } catch (error) {
                console.error("Error processing POST request:", error);
                response = { 
                    statusCode: 400, 
                    body: JSON.stringify({ error: error.message }),
                    headers: corsHeaders
                };
            }
        } 
        
        // Invalid Request
        else {
            response = {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request' }),
                headers: corsHeaders
            };
        }

        await connection.end();
        return response;
    } catch (error) {
        console.error('Database Connection Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve data' }),
            headers: corsHeaders
        };
    }
};
