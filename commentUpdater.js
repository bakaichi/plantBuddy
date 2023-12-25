import mysql from 'mysql2/promise';
import { generateComment } from './ai.js';
import 'dotenv/config';

async function updateComments() {
    // establish connection with credentials
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    // Fetch unread sensor readings from sql file in single store DB
    const [readings] = await connection.execute('SELECT * FROM plant_readings WHERE aiComment IS NULL');

    for (const reading of readings) {
        const aiComment = await generateComment(reading.temp, reading.humidity, reading.moisture);
        await connection.execute('UPDATE plant_readings SET aiComment = ? WHERE id = ?', [aiComment, reading.id]);
    }

    await connection.end();
}

// Schedule this function to run periodically
updateComments().catch(console.error);
