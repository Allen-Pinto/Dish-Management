import React from 'react';

const DishCard = ({ dish, onToggle, isToggling }) => {
  const { dishId, dishName, imageUrl, isPublished } = dish;
  const statusText = isPublished ? 'Published' : 'Unpublished';
  const buttonText = isPublished ? 'Unpublish' : 'Publish';

  return (
    <div className={`dish-card ${isPublished ? 'published' : 'unpublished'}`}>
      <div className="dish-image-container">
        <img 
          src={imageUrl} 
          alt={dishName}
          className="dish-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>
      
      <div className="dish-content">
        <h3 className="dish-name">{dishName}</h3>
        
        <div className="dish-footer">
          <span className={`status-badge ${isPublished ? 'status-published' : 'status-unpublished'}`}>
            <span className="status-dot"></span>
            {statusText}
          </span>
          
          <button 
            className={`toggle-btn ${isPublished ? 'btn-unpublish' : 'btn-publish'}`}
            onClick={() => onToggle(dishId)}
            disabled={isToggling}
          >
            {isToggling ? 'Processing...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;