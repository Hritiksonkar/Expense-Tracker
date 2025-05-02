const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expenseRoutes = require('./routes/expense');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with retry logic
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/expense-tracker', {
            serverSelectionTimeoutMS: 5000,
            family: 4, // Force IPv4
            maxPoolSize: 10, // Recommended for better performance
            heartbeatFrequencyMS: 2000 // Detect changes in replica set
        });
        console.log('Connected to MongoDB');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Initialize connection
connectDB();

// Routes
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/budgets', budgetRoutes);

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});