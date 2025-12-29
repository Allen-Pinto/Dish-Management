import React from 'react';

const Header = ({ publishedCount, totalCount, isConnected }) => (
  <header className="header">
    <div className="header-content">
      <h1 className="header-title">Dish Manager</h1>
      <div className="header-stats">
        <span className="stat-item">
          {publishedCount} / {totalCount} Published
        </span>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    </div>
  </header>
);

export default Header;