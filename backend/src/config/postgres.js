import dns from 'dns';
import pkg from 'pg';
import dotenv from 'dotenv';

try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,

    // Required for Neon
    ssl: {
        require: true,
        rejectUnauthorized: false
    },

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    keepAlive: true
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL Connected Successfully');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Error:', err);
});

export const query = (text, params) => pool.query(text, params);

export default pool;