import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/postgres.js';
import { initializeDatabase } from './config/dbInit.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ CRITICAL CONFIGURATION ERROR: Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('Please configure them in your .env file. Exiting process...');
    process.exit(1);
}

const startServer = async () => {

    try {

        // Test PostgreSQL Connection
        await pool.query('SELECT NOW()');

        console.log('✅ PostgreSQL Connected Successfully');

        // Automatically initialize database tables if they do not exist
        await initializeDatabase(pool);

        app.listen(PORT, () => {

            console.log(`🚀 C-PAY Server Running on http://localhost:${PORT}`);

        });

    } catch (error) {

        console.error('❌ Server Startup Failed');
        console.error(error);

    }

};

startServer();