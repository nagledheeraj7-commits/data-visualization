/**
 * Main Server File
 * Express server setup and configuration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configuration
import serverConfig from './config/server.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import salesRoutes from './routes/salesRoutes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configuration
app.use(cors(serverConfig.cors));

// Rate limiting
const limiter = rateLimit(serverConfig.rateLimit);
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files serving
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/data', express.static(path.join(__dirname, '../backend/data')));

// API routes
app.use('/api/sales', salesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Sales Dashboard API',
        version: '1.0.0',
        description: 'RESTful API for sales data visualization dashboard',
        endpoints: {
            sales: {
                'GET /api/sales': 'Get all sales records',
                'GET /api/sales/statistics': 'Get sales statistics',
                'GET /api/sales/export': 'Export sales data as CSV',
                'GET /api/sales/:id': 'Get sales record by ID',
                'POST /api/sales': 'Create new sales record',
                'PUT /api/sales/:id': 'Update sales record',
                'DELETE /api/sales/:id': 'Delete sales record'
            }
        },
        documentation: '/api/docs'
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = serverConfig.port;
const HOST = serverConfig.host;

const server = app.listen(PORT, HOST, () => {
    console.log(`
🚀 Sales Dashboard API Server Started!
📍 Server: ${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 API Documentation: http://${HOST}:${PORT}/api
🏠 Frontend: http://${HOST}:${PORT}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection:', err);
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

export default app;
