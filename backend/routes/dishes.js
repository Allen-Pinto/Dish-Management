const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const realtimeManager = require('../utils/realtime');

router.get('/dishes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM dishes ORDER BY dishId');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({ error: 'Failed to fetch dishes' });
    }
});

router.put('/dishes/:id/toggle-publish', async (req, res) => {
    const dishId = parseInt(req.params.id);
    
    if (isNaN(dishId)) {
        return res.status(400).json({ error: 'Invalid dish ID' });
    }

    try {
        const connection = await pool.getConnection();
        
        await connection.beginTransaction();
        
        const [current] = await connection.query(
            'SELECT * FROM dishes WHERE dishId = ?',
            [dishId]
        );
        
        if (current.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Dish not found' });
        }
        
        const newStatus = !current[0].isPublished;
        
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
        
        const updatedDish = updated[0];
        
        realtimeManager.broadcastDishUpdate(updatedDish);
        
        res.json(updatedDish);
    } catch (error) {
        console.error('Error toggling publish status:', error);
        res.status(500).json({ error: 'Failed to toggle publish status' });
    }
});

router.post('/dishes/bulk-update', async (req, res) => {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates must be an array' });
    }
    
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const updatedDishes = [];
        
        for (const update of updates) {
            const [result] = await connection.query(
                'UPDATE dishes SET isPublished = ? WHERE dishId = ?',
                [update.isPublished, update.dishId]
            );
            
            if (result.affectedRows > 0) {
                const [dish] = await connection.query(
                    'SELECT * FROM dishes WHERE dishId = ?',
                    [update.dishId]
                );
                updatedDishes.push(dish[0]);
            }
        }
        
        await connection.commit();
        connection.release();
        
        realtimeManager.broadcastAllDishes(updatedDishes);
        
        res.json({ message: 'Bulk update successful', updatedDishes });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({ error: 'Failed to perform bulk update' });
    }
});

module.exports = router;