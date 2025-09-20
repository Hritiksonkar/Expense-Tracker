const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const net = require('net');

// Load environment variables first
dotenv.config();

const expenseRoutes = require('./routes/expense');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');
const { startCronJobs } = require('./services/CronService');

const app = express();

// Function to check if port is available
const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });
        server.on('error', () => {
            resolve(false);
        });
    });
};

// Function to find available port
const findAvailablePort = async (startPort) => {
    let port = startPort;
    while (port < startPort + 10) { // Try 10 ports
        if (await isPortAvailable(port)) {
            return port;
        }
        port++;
    }
    throw new Error(`No available port found between ${startPort} and ${startPort + 9}`);
};

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Add Vite dev server port
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling
const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGODB_URI || process.env.DB;
        if (!mongoURI) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MONGODB_URI environment variable is required in production!');
            }
            mongoURI = 'mongodb://127.0.0.1:27017/expense-tracker';
        }

        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            family: 4,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            console.error('Failed to connect to MongoDB in production. Exiting...');
            process.exit(1);
        }
    }
};

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Initialize connection
connectDB();

// Routes
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/budgets', budgetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server with port checking
const startServer = async () => {
    try {
        const preferredPort = parseInt(process.env.PORT) || 4444;
        const availablePort = await findAvailablePort(preferredPort);

        const server = app.listen(availablePort, () => {
            console.log(`Server is running on port ${availablePort}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${availablePort}/health`);

            // Start background services
            startCronJobs();

            if (availablePort !== preferredPort) {
                console.log(`Note: Preferred port ${preferredPort} was not available, using ${availablePort} instead`);
            }
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            server.close(() => {
                process.exit(1);
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received');
            server.close(() => {
                mongoose.connection.close();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received');
            server.close(() => {
                mongoose.connection.close();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();