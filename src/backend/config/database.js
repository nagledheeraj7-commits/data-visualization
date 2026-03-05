/**
 * Database Configuration
 * Handles database connection and configuration
 */

const config = {
    development: {
        database: 'sqlite',
        storage: './data/sales.db',
        logging: true,
        synchronize: false
    },
    production: {
        database: 'postgresql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sales_dashboard',
        logging: false,
        synchronize: false
    },
    test: {
        database: 'sqlite',
        storage: ':memory:',
        logging: false,
        synchronize: true
    }
};

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

export { dbConfig, environment };

export default dbConfig;
