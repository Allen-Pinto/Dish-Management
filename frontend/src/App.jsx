import React, { useState, useEffect, useCallback } from 'react';
import { fetchDishes, toggleDishStatus } from './services/api';
import websocketService from './services/websocket';
import Header from './components/Header';
import DishList from './components/DishList';
import './styles/App.css';

const DishManagerApp = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingDishId, setTogglingDishId] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const updateDishInState = useCallback((updatedDish) => {
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.dishId === updatedDish.dishId 
          ? { ...dish, isPublished: updatedDish.isPublished }
          : dish
      )
    );
  }, []);

  const handleWebSocketUpdate = useCallback((updatedDish) => {
    console.log('Real-time update received:', updatedDish);
    updateDishInState(updatedDish);
  }, [updateDishInState]);

  const handleToggleDish = async (dishId) => {
    setTogglingDishId(dishId);
    try {
      const updatedDish = await toggleDishStatus(dishId);
      updateDishInState(updatedDish);
    } catch (err) {
      console.error('Toggle error:', err);
      setError('Failed to update dish status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setTogglingDishId(null);
    }
  };

  useEffect(() => {
    const loadDishes = async () => {
      try {
        setLoading(true);
        const data = await fetchDishes();
        setDishes(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load dishes. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    loadDishes();
  }, []);

  useEffect(() => {
    // Set up WebSocket callbacks
    websocketService.onDishUpdated(handleWebSocketUpdate);
    websocketService.onConnected(() => {
      console.log('WebSocket connected');
      setIsWebSocketConnected(true);
    });
    websocketService.onDisconnected(() => {
      console.log('WebSocket disconnected');
      setIsWebSocketConnected(false);
    });

    // Connect WebSocket
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [handleWebSocketUpdate]);

  const publishedCount = dishes.filter(d => d.isPublished).length;

  return (
    <div className="app">
      <Header 
        publishedCount={publishedCount}
        totalCount={dishes.length}
        isConnected={isWebSocketConnected}
      />

      <main className="main-content">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dishes...</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="empty-state">
            <p>No dishes found. Please check your backend connection.</p>
          </div>
        ) : (
          <DishList 
            dishes={dishes}
            onToggle={handleToggleDish}
            togglingDishId={togglingDishId}
          />
        )}
      </main>
    </div>
  );
};

export default DishManagerApp;