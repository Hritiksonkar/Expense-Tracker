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

// Trust reverse proxies (Render/Vercel/etc.)
// Needed for accurate protocol detection when behind a proxy.
app.set('trust proxy', 1);

const normalizeOrigin = (value) => {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';

    // If it's a full URL, normalize to its origin (protocol + host + port)
    try {
        const url = new URL(trimmed);
        return url.origin;
    } catch {
        // Otherwise, just remove trailing slashes
        return trimmed.replace(/\/+$/, '');
    }
};

const getAllowedOrigins = () => {
    // Support comma-separated allowlist for production deployments
    const raw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
    return String(raw)
        .split(',')
        .map((s) => normalizeOrigin(s))
        .filter(Boolean);
};

const isOriginAllowed = (origin, allowed) => {
    if (!origin) return true;

    // Exact match first
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowed.includes(normalizedOrigin)) return true;

    // Wildcard support for common hosting preview domains.
    // Examples:
    // - FRONTEND_URLS=*.vercel.app
    // - FRONTEND_URLS=https://*.vercel.app
    // - FRONTEND_URLS=*.onrender.com
    try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;
        const originProtocol = originUrl.protocol; // includes trailing ':'

        for (const entry of allowed) {
            if (!entry.includes('*')) continue;

            const trimmed = String(entry).trim();
            const parts = trimmed.split('://');
            const patternProtocol = parts.length === 2 ? `${parts[0]}:` : null;
            const patternHost = parts.length === 2 ? parts[1] : trimmed;

            // Only support leading wildcard patterns like *.vercel.app
            if (!patternHost.startsWith('*.')) continue;
            const suffix = patternHost.slice(1); // ".vercel.app"

            if (patternProtocol && patternProtocol !== originProtocol) continue;
            if (originHost.endsWith(suffix)) return true;
        }
    } catch {
        // Ignore
    }

    return false;
};

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
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser clients (no Origin header)
        if (!origin) return callback(null, true);

        // In development, allow local dev servers
        if (process.env.NODE_ENV !== 'production') {
            const allowedDev = ['http://localhost:3000', 'http://localhost:5173'];
            return callback(null, allowedDev.includes(origin));
        }

        const allowedOrigins = getAllowedOrigins();

        // If no allowlist is configured, fall back to reflecting the request origin.
        // This avoids accidental lockouts when FRONTEND_URL isn't set.
        if (allowedOrigins.length === 0) {
            return callback(null, true);
        }

        const allowed = isOriginAllowed(origin, allowedOrigins);
        if (!allowed) {
            console.warn('CORS blocked origin:', origin);
            console.warn('Allowed origins:', allowedOrigins);
        }
        return callback(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling
let mongoRetryDelayMs = 5000;

const connectDB = async () => {
    try {
        const rawMongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.DB;
        let mongoURI = rawMongoUri;
        if (!mongoURI) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('MONGODB_URI environment variable is required in production!');
            }
            mongoURI = 'mongodb://127.0.0.1:27017/expense-tracker';
        } else {
            // Render/CI env vars sometimes include quotes or trailing spaces
            mongoURI = String(mongoURI).trim();
            if ((mongoURI.startsWith('"') && mongoURI.endsWith('"')) || (mongoURI.startsWith("'") && mongoURI.endsWith("'"))) {
                mongoURI = mongoURI.slice(1, -1).trim();
            }

            // Fail fast if someone accidentally deployed an example/placeholder URI
            if (/<[^>]+>/.test(mongoURI)) {
                throw new Error(
                    'MONGODB_URI contains placeholders like <cluster_host>. ' +
                    'Copy the exact Atlas connection string (Connect → Drivers) and set it as MONGODB_URI in your hosting environment.'
                );
            }
        }

        // Log sanitized connection info (never log the full URI)
        try {
            const url = new URL(mongoURI);
            const dbName = (url.pathname || '').replace(/^\//, '') || '(none)';
            console.log(`MongoDB target: ${url.host} / ${dbName}`);
        } catch {
            // Ignore parse errors for non-standard URIs
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
        mongoRetryDelayMs = 5000;
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);

        // Do not crash-loop in production. Keep the server up (so CORS/health checks work)
        // and retry with exponential backoff.
        const delay = mongoRetryDelayMs;
        mongoRetryDelayMs = Math.min(mongoRetryDelayMs * 2, 60000);
        console.log(`Retrying MongoDB connection in ${Math.round(delay / 1000)}s...`);
        setTimeout(connectDB, delay);
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

// Root route for deployment health checks
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Expense Tracker Backend API',
        status: 'Running',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            expenses: '/api/v1/expenses',
            auth: '/api/v1/auth',
            budgets: '/api/v1/budgets'
        },
        documentation: 'API is running successfully'
    });
});

// Initialize connection
connectDB();

// Routes
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/budgets', budgetRoutes);

// API info route
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'Expense Tracker API v1',
        version: '1.0.0',
        endpoints: [
            'GET /api/v1/expenses/:userId - Get user expenses',
            'POST /api/v1/expenses - Create expense',
            'PUT /api/v1/expenses/:id - Update expense',
            'DELETE /api/v1/expenses/:id - Delete expense',
            'POST /api/v1/auth/login - User login',
            'POST /api/v1/auth/register - User registration',
            'GET /api/v1/budgets/:userId - Get user budgets',
            'POST /api/v1/budgets - Create budget'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler - Move this to the end
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /api',
            'POST /api/v1/auth/login',
            'POST /api/v1/auth/register',
            'GET /api/v1/expenses/:userId',
            'POST /api/v1/expenses',
            'GET /api/v1/budgets/:userId',
            'POST /api/v1/budgets'
        ]
    });
});

// Start server with port checking
const startServer = async () => {
    try {
        const port = process.env.PORT || 4444;

        // For production, just use the assigned port
        if (process.env.NODE_ENV === 'production') {
            const server = app.listen(port, '0.0.0.0', () => {
                console.log(`Server is running on port ${port}`);
                console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
                startCronJobs();
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

            return;
        }

        // For development, check for available port
        const availablePort = await findAvailablePort(parseInt(port));

        const server = app.listen(availablePort, () => {
            console.log(`Server is running on port ${availablePort}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${availablePort}/health`);
            startCronJobs();

            if (availablePort !== parseInt(port)) {
                console.log(`Note: Preferred port ${port} was not available, using ${availablePort} instead`);
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