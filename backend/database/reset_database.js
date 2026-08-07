import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

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
  connectionTimeoutMillis: 10000,
});

async function resetDatabaseAndLocalStorage() {
  console.log('\n======================================================');
  console.log('🚨 STARTING COMPLETE DATABASE AND STORAGE CLEANUP');
  console.log('======================================================\n');

  try {
    // 1. Fetch all BASE TABLES in 'cpay' schema
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'cpay' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => `cpay."${r.table_name}"`);

    if (tableNames.length > 0) {
      console.log(`🧹 Truncating ${tableNames.length} tables in schema 'cpay'...`);
      const truncateQuery = `TRUNCATE ${tableNames.join(', ')} RESTART IDENTITY CASCADE;`;
      await pool.query(truncateQuery);
      console.log('✅ All tables successfully truncated.');
    } else {
      console.log('⚠️ No base tables found in schema "cpay".');
    }

    // 2. Re-seed master lookup data
    console.log('\n🌱 Re-seeding master lookup tables...');
    const seedFiles = [
      path.join(__dirname, 'seed.sql')
    ];

    for (const file of seedFiles) {
      if (fs.existsSync(file)) {
        console.log(`   📄 Executing ${path.basename(file)}...`);
        const sql = fs.readFileSync(file, 'utf8');
        await pool.query(sql);
      }
    }
    console.log('✅ Master seed data successfully restored.');

    // 3. Clear Local Disk Storage (Uploads directory)
    console.log('\n📁 Cleaning local file storage...');
    const uploadsDir = path.join(__dirname, '../src/uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedCount = 0;
      for (const file of files) {
        if (file !== '.gitkeep') {
          const filePath = path.join(uploadsDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            fs.unlinkSync(filePath);
            removedCount++;
          } else if (stat.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            removedCount++;
          }
        }
      }
      console.log(`✅ Cleared ${removedCount} items from backend uploads folder (${uploadsDir}).`);
    } else {
      console.log('ℹ️ Uploads directory does not exist, creating clean directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 4. Verify Final State
    console.log('\n======================================================');
    console.log('🔍 VERIFYING CLEAN DATABASE STATE');
    console.log('======================================================');
    
    const countRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'cpay' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n   📋 Updated Table Summary & Row Counts:');
    console.log('   --------------------------------------------------');
    for (const row of countRes.rows) {
      const cnt = await pool.query(`SELECT COUNT(*) FROM cpay."${row.table_name}";`);
      console.log(`   - cpay.${row.table_name.padEnd(30)} : ${cnt.rows[0].count} rows`);
    }
    console.log('   --------------------------------------------------');
    console.log('\n🎉 ALL DATA WIPED & SYSTEM RESTORED TO CLEAN STATE!');

  } catch (err) {
    console.error('\n🔴 Error resetting database and storage:', err);
  } finally {
    await pool.end();
  }
}

resetDatabaseAndLocalStorage();
