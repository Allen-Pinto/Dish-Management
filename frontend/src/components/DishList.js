import React from 'react';
import DishCard from './DishCard';

const DishList = ({ dishes, onToggle, togglingDishId }) => {
  if (dishes.length === 0) {
    return (
      <div className="empty-state">
        <p>No dishes available</p>
      </div>
    );
  }

  return (
    <div className="dish-grid">
      {dishes.map(dish => (
        <DishCard 
          key={dish.dishId} 
          dish={dish}
          onToggle={onToggle}
          isToggling={togglingDishId === dish.dishId}
        />
      ))}
    </div>
  );
};

export default DishList;