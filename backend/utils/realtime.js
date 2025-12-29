const WebSocket = require('ws');

class RealtimeManager {
    constructor() {
        this.clients = new Set();
        this.wss = null;
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ server });
        
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
        
        console.log('WebSocket server initialized');
    }

    broadcastDishUpdate(dish) {
        const message = JSON.stringify({
            type: 'DISH_UPDATED',
            data: dish
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    broadcastAllDishes(dishes) {
        const message = JSON.stringify({
            type: 'ALL_DISHES',
            data: dishes
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

module.exports = new RealtimeManager();