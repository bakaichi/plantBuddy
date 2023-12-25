// runs a server using express in order to fetch data from singlestore DB.

import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());

// access single store db
const dbConfig = {
host : process.env.DB_HOST,
user : process.env.DB_USER,
password : process.env.DB_PASSWORD,
database : process.env.DB_DATABASE
}

// sql request for data from a table
app.get('/api/latest-reading', async (req, res) => {
    try{
        const connection = await mysql.createConnection(dbConfig);
        const query = `
        SELECT id, temp, humidity, moisture, timestamp, reading_time, aiComment
        FROM plant_readings
        ORDER BY reading_time DESC
        LIMIT 1`;
        const [rows] = await connection.execute(query);
        connection.end();

        res.json(rows[0]);        
    } catch (error) {
        console.error('Failed to fetch latest reading:', error);
        res.status(500).send('server error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});