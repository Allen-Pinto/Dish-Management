require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3001;

// WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

// Database pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Setup database on startup
async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.end();

    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    await db.query(`
        CREATE TABLE IF NOT EXISTS dishes (
            dishId INT PRIMARY KEY AUTO_INCREMENT,
            dishName VARCHAR(255) NOT NULL,
            imageUrl VARCHAR(500),
            isPublished BOOLEAN DEFAULT FALSE
        )
    `);

    const [rows] = await db.query('SELECT COUNT(*) as count FROM dishes');
    if (rows[0].count === 0) {
        const dishes = [
            ['Pizza Margherita', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', true],
            ['Caesar Salad', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', false],
            ['Spaghetti Carbonara', 'https://images.unsplash.com/photo-1598866594230-a7c12756260f', true],
            ['Beef Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true],
            ['Chicken Tikka Masala', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', false],
            ['Sushi Platter', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', true],
            ['French Toast', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929', false],
            ['Grilled Salmon', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', true],
            ['Vegetable Stir Fry', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', false],
            ['Chocolate Cake', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', true]
        ];

        for (const dish of dishes) {
            await db.query('INSERT INTO dishes (dishName, imageUrl, isPublished) VALUES (?, ?, ?)', dish);
        }
    }

    await db.end();
    console.log('Database setup complete');
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// 1. Get all dishes
app.get('/api/dishes', async (req, res) => {
    try {
        const [dishes] = await pool.query('SELECT * FROM dishes ORDER BY dishId');
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Toggle dish published status
app.put('/api/dishes/:id/toggle-publish', async (req, res) => {
    const dishId = parseInt(req.params.id);
    
    if (isNaN(dishId)) {
        return res.status(400).json({ error: 'Invalid dish ID' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const [dish] = await connection.query('SELECT * FROM dishes WHERE dishId = ?', [dishId]);
        
        if (dish.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Dish not found' });
        }

        const newStatus = !dish[0].isPublished;
        
        await connection.query(
            'UPDATE dishes SET isPublished = ? WHERE dishId = ?',
            [newStatus, dishId]
        );

        const [updated] = await connection.query(
            'SELECT * FROM dishes WHERE dishId = ?',
            [dishId]
        );

        await connection.commit();
        connection.release();

        // Send real-time update
        const message = JSON.stringify({
            type: 'dish_updated',
            data: updated[0]
        });

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
async function startServer() {
    try {
        await setupDatabase();
        
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`WebSocket available on ws://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();