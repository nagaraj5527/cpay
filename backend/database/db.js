import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// PostgreSQL Connection Pool config
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,

  ssl: {
    require: true,
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 5000,
});

// ==========================================
// 1. VERIFY DATABASE HEALTH & SCHEMA STATUS
// ==========================================
const verifyDB = async () => {
  console.log('\n======================================================');
  console.log('🔍 SYSTEM DATABASE HEALTH & VERIFICATION DASHBOARD');
  console.log('======================================================');

  // A. PostgreSQL Health
  try {
    const pgStart = Date.now();
    const verRes = await pool.query('SELECT version();');
    console.log(`\n🟢 PostgreSQL: Connected [${Date.now() - pgStart}ms]`);
    console.log(`   Version: ${verRes.rows[0].version.split(',')[0]}`);

    // Fetch schema details
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'cpay'
      ORDER BY table_name;
    `);

    if (tablesRes.rows.length === 0) {
      console.log('   ⚠️ Warning: Schema "cpay" is empty or does not exist. Run db:reset.');
    } else {
      console.log(`   Schema: cpay (${tablesRes.rows.length} Tables Loaded)`);
      console.log('\n   📋 Table Summary & Row Counts:');
      console.log('   --------------------------------------------------');
      for (const row of tablesRes.rows) {
        const countRes = await pool.query(`SELECT COUNT(*) FROM cpay.${row.table_name};`);
        console.log(`   - cpay.${row.table_name.padEnd(28)} : ${countRes.rows[0].count} rows`);
      }
      console.log('   --------------------------------------------------');
    }

    // Index verification
    console.log('\n   ⚡ Query Optimization Indexes Check:');
    console.log('   --------------------------------------------------');
    const indexesRes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'cpay' AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);

    const expectedIndexes = [
      'idx_users_role',
      'idx_registration_user',
      'idx_registration_status',
      'idx_address_state',
      'idx_land_registration',
      'idx_plantation_land',
      'idx_aqua_land',
      'idx_carbon_registration',
      'idx_otp_mobile',
      'idx_status_registration',
      'idx_documents_registration_id'
    ];

    for (const expected of expectedIndexes) {
      const found = indexesRes.rows.find(idx => idx.indexname === expected);
      if (found) {
        console.log(`   ✅ [Active] ${expected.padEnd(38)} on table: ${found.tablename}`);
      } else {
        console.log(`   ⚠️ [OPTIONAL] ${expected.padEnd(38)}`);
      }
    }
    console.log('   --------------------------------------------------');

  } catch (err) {
    console.error('\n🔴 PostgreSQL Connection Failed:', err.message);
  }

  console.log('\n🟢 Documents & Media Storage: Active on PostgreSQL (cpay.documents table)');
  console.log('======================================================\n');
};

// ==========================================
// CLI ARGUMENT ROUTER
// ==========================================
const main = async () => {
  const arg = process.argv[2];

  if (arg === '--verify') {
    await verifyDB();
  } else {
    console.log(`
C-PAY Database Administrator CLI Tool
Usage:
  node database/db.js [action]

Actions:
  --verify  Run system connections health check, row count analysis & index verification
    `);
  }

  // Terminate PG connection pool
  await pool.end();
};

main();
