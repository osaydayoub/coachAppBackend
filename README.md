
# CoachApp Backend

## Description

The CoachApp Backend is a Node.js application built using Express.js that serves as the backend for the CoachApp. It provides endpoints for managing users, clients, workouts, and meals. The server connects to a MongoDB database and includes middleware for error handling and authentication.

## Features

- **User Management**: Register and log in users.
- **Client Management**: Create, update, and retrieve client information, including daily tracking and payments.
- **Workout Management**: Add, retrieve, and delete workouts.
- **Meal Management**: Create and retrieve meals by type.

## File Structure

```
/server.js              # Main entry point of the application
/routes/                # Contains route files
    /clientRoutes.js    # Routes for managing clients
    /mealRoutes.js      # Routes for managing meals
    /userRoutes.js      # Routes for managing users
    /workoutRoutes.js   # Routes for managing workouts
/controllers/           # Contains controller files
    /clientController.js   # Controller functions for client routes
    /mealController.js     # Controller functions for meal routes
    /userController.js     # Controller functions for user routes
    /workoutController.js  # Controller functions for workout routes
/middlewares/           # Contains middleware files
    /authMiddleware.js  # Authentication middleware
    /errorMiddleware.js # Error handling middleware
/config/                # Contains configuration files
    /db.js              # Database connection configuration
/constants/             # Contains constants used across the app
/models/                # Contains MongoDB models
.gitignore              # Git ignore file
/package.json           # Project dependencies and scripts
/package-lock.json      # Lockfile for installed packages
```

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```bash
    cd coachAppBackend
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory with the following environment variables:
    ```env
    PORT=3000
    MONGO_URI=<your-mongodb-uri>
    ```

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. The server will be running on `http://localhost:3000`.

## API Endpoints

### User Routes

- **POST** `/api/v1/users`: Register a new user
- **POST** `/api/v1/users/login`: Log in an existing user

### Client Routes

- **GET** `/api/v1/coach/clients`: Retrieve all clients (protected)
- **GET** `/api/v1/coach/clients/:id`: Retrieve a single client by ID (protected)
- **POST** `/api/v1/coach/clients`: Create a new client
- **PUT** `/api/v1/coach/clients/assignPackage/:id`: Assign a package to a client (protected)
- **PUT** `/api/v1/coach/clients/dailyTracking/:id`: Add daily tracking to a client (protected)
- **GET** `/api/v1/coach/clients/dailyTracking/:id`: Get daily tracking of a client (protected)
- **PUT** `/api/v1/coach/clients/payment/:id`: Add a payment to a client

### Workout Routes

- **GET** `/api/v1/coach/workouts`: Retrieve all workouts (protected)
- **GET** `/api/v1/coach/workouts/:id`: Retrieve workouts by client ID (protected)
- **POST** `/api/v1/coach/workouts`: Add a new workout (protected)
- **DELETE** `/api/v1/coach/workouts/:id`: Delete a workout by ID (protected)

### Meal Routes

- **GET** `/api/v1/coach/meals/:type`: Retrieve all meals by type (protected)
- **POST** `/api/v1/coach/meals`: Create a new meal (protected)

## Middleware

- **Error Handling**: Catches and responds to errors in the application.
- **Authentication**: Protects routes that require authentication.

## Dependencies

The project uses the following dependencies, as listed in `package.json`:

- **express**: Web framework for Node.js
- **cors**: Middleware for enabling Cross-Origin Resource Sharing
- **dotenv**: Loads environment variables from a `.env` file
- **mongoose**: MongoDB object modeling tool
- **bcryptjs**: Library for hashing passwords
- **jsonwebtoken**: JSON Web Token implementation for authentication

## Scripts

The `package.json` includes the following scripts:

- **start**: Starts the server
    ```bash
    npm start
    ```
- **dev**: Runs the server with nodemon for development (if `nodemon` is installed)
    ```bash
    npm run dev
    ```



