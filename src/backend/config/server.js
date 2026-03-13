/**
 * Server Configuration
 * Handles server and API configuration
 */

const config = {
    development: {
        port: process.env.PORT || 3001,
        host: 'localhost',
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:8080'],
            credentials: true
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },
    production: {
        port: process.env.PORT || 3001,
        host: '0.0.0.0',
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
            credentials: true
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000 // limit each IP to 1000 requests per windowMs
        }
    },
    test: {
        port: 3002,
        host: 'localhost',
        cors: {
            origin: '*',
            credentials: false
        }
    }
};

const environment = process.env.NODE_ENV || 'development';
const serverConfig = config[environment];

export { serverConfig, environment };

export default serverConfig;
