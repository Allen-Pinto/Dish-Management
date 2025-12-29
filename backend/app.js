const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

let db;

const sampleDishes = [
  ['Pizza Margherita', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 1],
  ['Caesar Salad', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', 0],
  ['Spaghetti Carbonara', 'https://images.unsplash.com/photo-1598866594230-a7c12756260f', 1],
  ['Beef Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1],
  ['Chicken Tikka Masala', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 0],
  ['Sushi Platter', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', 1],
  ['French Toast', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929', 0],
  ['Grilled Salmon', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 1],
  ['Vegetable Stir Fry', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 0],
  ['Chocolate Cake', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 1],
  ['Mango Lassi', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4', 1],
  ['Shrimp Tacos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 0]
];

async function setupDatabase() {
  try {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/dish_manager.db' 
      : './dish_manager.db';
    
    console.log(`Opening database at: ${dbPath}`);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS dishes (
        dishId INTEGER PRIMARY KEY AUTOINCREMENT,
        dishName TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        isPublished INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if dishes exist
    const count = await db.get('SELECT COUNT(*) as count FROM dishes');
    
    if (count.count === 0) {
      console.log('Inserting sample dishes...');
      const stmt = await db.prepare('INSERT INTO dishes (dishName, imageUrl, isPublished) VALUES (?, ?, ?)');
      
      for (const dish of sampleDishes) {
        await stmt.run(dish[0], dish[1], dish[2]);
      }
      
      await stmt.finalize();
      console.log(`Inserted ${sampleDishes.length} sample dishes`);
    } else {
      console.log(`Database already has ${count.count} dishes`);
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

// API Routes

// Get all dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await db.all('SELECT * FROM dishes ORDER BY dishId');
    
    const formattedDishes = dishes.map(dish => ({
      ...dish,
      isPublished: Boolean(dish.isPublished)
    }));
    
    res.json(formattedDishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

app.post('/api/dishes/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const dish = await db.get('SELECT * FROM dishes WHERE dishId = ?', [id]);
    
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    const newStatus = dish.isPublished === 1 ? 0 : 1;
    
    await db.run('UPDATE dishes SET isPublished = ? WHERE dishId = ?', [newStatus, id]);
    
    const updatedDish = await db.get('SELECT * FROM dishes WHERE dishId = ?', [id]);
    
    // Format response
    const response = {
      ...updatedDish,
      isPublished: Boolean(updatedDish.isPublished)
    };
    
    // Broadcast update 
    io.emit('dish-updated', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error toggling dish status:', error);
    res.status(500).json({ error: 'Failed to toggle dish status' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Dish Management API',
    database: db ? 'Connected' : 'Disconnected'
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
async function startServer() {
  try {
    await setupDatabase();
    
    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server ready`);
      console.log(`Database: ${process.env.NODE_ENV === 'production' ? 'Production (SQLite)' : 'Development (SQLite)'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start 
if (require.main === module) {
  startServer();
}

module.exports = { app, server, setupDatabase };