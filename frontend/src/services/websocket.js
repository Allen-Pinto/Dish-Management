class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onDishUpdated: null,
      onConnected: null,
      onDisconnected: null
    };
  }

  connect() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const wsUrl = backendUrl.replace('http', 'ws');
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      if (this.callbacks.onConnected) {
        this.callbacks.onConnected();
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'dish-updated' && this.callbacks.onDishUpdated) {
        this.callbacks.onDishUpdated(data.dish);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.callbacks.onDisconnected) {
        this.callbacks.onDisconnected();
      }
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connect();
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onDishUpdated(callback) {
    this.callbacks.onDishUpdated = callback;
  }

  onConnected(callback) {
    this.callbacks.onConnected = callback;
  }

  onDisconnected(callback) {
    this.callbacks.onDisconnected = callback;
  }
}

export default new WebSocketService();