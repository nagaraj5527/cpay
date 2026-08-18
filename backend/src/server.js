import dns from 'dns';
import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/postgres.js';
import { initializeDatabase } from './config/dbInit.js';

try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

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

        // Test PostgreSQL Connection with retry for serverless DB cold-starts
        let connected = false;
        let retries = 5;
        while (retries > 0 && !connected) {
            try {
                await pool.query('SELECT NOW()');
                connected = true;
            } catch (err) {
                retries--;
                if (retries === 0) throw err;
                const errMsg = err.message || err.cause?.message || String(err);
                console.warn(`⚠️ PostgreSQL connection attempt failed (${errMsg}). Retrying in 3 seconds... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        // Run self-healing database initialization before starting server HTTP listener
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