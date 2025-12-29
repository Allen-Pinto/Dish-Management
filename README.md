# Dish Manager - Full Stack Application

## Overview

Dish Manager is a full-stack web application built to manage and display dish information with real-time updates. The application provides a dashboard for administrators to view, manage, and toggle the publication status of dishes in real-time.

## Features

### Core Features
- **Database Management**: SQL-based database storing dish information including name, image URL, and publication status
- **RESTful API**: Complete backend API with endpoints for fetching dishes and toggling publication status
- **React Dashboard**: Modern, responsive frontend interface built with React.js
- **Real-Time Updates**: Live synchronization between frontend and backend using WebSocket technology

### Technical Features
- **Dark/Light Mode**: User-friendly theme switching with persistent preferences
- **Real-Time Status Updates**: Immediate reflection of database changes across all connected clients
- **Responsive Design**: Fully functional across desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error management and user feedback
- **Loading States**: Skeleton loaders and visual feedback during data operations

## Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **MySQL** database management system
- **WebSocket** for real-time communication
- **CORS** enabled for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **CSS3** with custom properties for theme management
- **WebSocket Client** for real-time updates
- **Fetch API** for HTTP requests

## Project Structure

```
dish_manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── dishController.js
│   │   ├── routes/
│   │   │   └── dishRoutes.js
│   │   ├── services/
│   │   │   └── websocket.js
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DishList.jsx
│   │   │   ├── DishCard.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Database Schema

### Dishes Table
```sql
CREATE TABLE dishes (
    dishId INT AUTO_INCREMENT PRIMARY KEY,
    dishName VARCHAR(255) NOT NULL,
    imageUrl TEXT NOT NULL,
    isPublished BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Data
The database comes pre-populated with 12 sample dishes including:
- Pizza Margherita
- Caesar Salad
- Spaghetti Carbonara
- Beef Burger
- Chicken Tikka Masala
- Sushi Platter
- French Toast
- Grilled Salmon
- Vegetable Stir Fry
- Chocolate Cake
- Mango Lassi
- Shrimp Tacos

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### GET /dishes
Retrieves all dishes from the database.

**Response:**
```json
[
  {
    "dishId": 1,
    "dishName": "Pizza Margherita",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "isPublished": true
  }
]
```

#### POST /dishes/:dishId/toggle
Toggles the publication status of a specific dish.

**Response:**
```json
{
  "success": true,
  "message": "Dish status updated successfully",
  "dish": {
    "dishId": 1,
    "dishName": "Pizza Margherita",
    "isPublished": false
  }
}
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the database:
   - Create a MySQL database named `dish_manager`
   - Update database credentials in `backend/src/config/database.js`

4. Run database migrations:
```bash
mysql -u username -p dish_manager < database/schema.sql
```

5. Start the backend server:
```bash
npm start
```
The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (if needed):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

## Running the Complete Application

1. Start the MySQL service:
```bash
sudo service mysql start
```

2. In one terminal, start the backend:
```bash
cd backend && npm start
```

3. In another terminal, start the frontend:
```bash
cd frontend && npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Real-Time Feature

The application implements real-time updates using WebSocket technology. When any change is made to a dish's publication status (either through the dashboard or directly in the database), all connected clients automatically receive the update within seconds.

### How It Works
1. The frontend establishes a WebSocket connection to the backend on application load
2. When a dish status changes, the backend broadcasts the update to all connected clients
3. The frontend updates the UI in real-time without requiring a page refresh

## Testing

### Backend Tests
Run the backend test suite:
```bash
cd backend
npm test
```

### Frontend Tests
Run the frontend test suite:
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Build the production bundle:
```bash
npm run build
```

2. Set environment variables for production:
```bash
export NODE_ENV=production
export DB_HOST=your_production_db_host
export DB_USER=your_production_db_user
export DB_PASSWORD=your_production_db_password
export DB_NAME=your_production_db_name
```

3. Start the production server:
```bash
npm start
```

### Frontend Deployment
1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, AWS S3, etc.)

## Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexing on frequently accessed columns
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Implemented caching for frequently accessed data
- **Lazy Loading**: Images are loaded only when they come into viewport
- **Code Splitting**: React components are split for faster initial load

## Security Considerations

- **SQL Injection Prevention**: Parameterized queries and input validation
- **CORS Configuration**: Restrictive CORS policy for production
- **Input Sanitization**: All user inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored in environment variables

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL service is running
   - Check database credentials in configuration
   - Ensure database `dish_manager` exists

2. **WebSocket Connection Failed**
   - Verify backend is running on port 5000
   - Check firewall settings
   - Ensure WebSocket server is properly configured

3. **Frontend Not Connecting to Backend**
   - Verify CORS configuration
   - Check API base URL in frontend configuration
   - Ensure both servers are running

### Logs
- Backend logs are available in `backend/logs/app.log`
- Frontend errors are logged to browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is developed for educational and demonstration purposes.

## Acknowledgments

- Unsplash for providing high-quality food images
- The React and Node.js communities for excellent documentation
- All open-source libraries used in this project

## Contact

For questions or support regarding this application, please refer to the project documentation or create an issue in the repository.
