import type { Handler } from 'aws-lambda';
import mysql from 'mysql2/promise';

export const handler: Handler = async (event, context) => {
    const connection = await mysql.createConnection({
        host: 'cpsc4910-team22-db2.cobd8enwsupz.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'ThereWasATeamHere!',
        database: 'Team22DB'
    });

    // Log the result of the query to understand its structure
    const result = await connection.execute('SELECT * FROM about_page');
    console.log('Result:', result);

    await connection.end();

    return result;
};