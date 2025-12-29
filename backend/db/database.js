const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dish_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'dish_manager'}`);
    await connection.end();

    const dbConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dish_manager'
    });

    const schema = `
        CREATE TABLE IF NOT EXISTS dishes (
            dishId INT PRIMARY KEY AUTO_INCREMENT,
            dishName VARCHAR(255) NOT NULL,
            imageUrl VARCHAR(500),
            isPublished BOOLEAN DEFAULT FALSE
        )
    `;
    
    await dbConnection.query(schema);
    await dbConnection.end();
    
    console.log('Database initialized');
}

module.exports = { pool, initializeDatabase };