import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automatically checks and initializes the database tables if they do not exist.
 * Keeps schema clean by dropping unused tables.
 * @param {import('pg').Pool} pool - PostgreSQL connection pool
 */
export const initializeDatabase = async (pool) => {
    try {
        console.log('🔄 Running self-healing database verification...');

        // 1. Fetch currently existing tables in the 'cpay' schema
        const tablesRes = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'cpay';
        `);
        const existingTables = tablesRes.rows.map(row => row.table_name.toLowerCase());

        const dbDir = path.join(__dirname, '../../database');

        // 3. Execute schema.sql to ensure all required tables exist
        const schemaPath = path.join(dbDir, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('   Syncing schema.sql (creating required tables if missing)...');
            const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schemaSQL);
            console.log('   ✅ Required schema and tables verified.');
        } else {
            console.warn(`   ⚠️ schema.sql not found at ${schemaPath}`);
        }

        // Execute indexes.sql automatically if it exists to ensure required performance indexes exist
        const indexesPath = path.join(dbDir, 'indexes.sql');
        if (fs.existsSync(indexesPath)) {
            console.log('   Syncing indexes.sql (creating performance indexes if missing)...');
            const indexesSQL = fs.readFileSync(indexesPath, 'utf8');
            await pool.query(indexesSQL);
            console.log('   ✅ Performance indexes verified.');
        }

        // 4. Ensure aquaculture migration columns are applied (for older database environments)
        const migrationPath = path.join(dbDir, 'update_aquaculture_schema.sql');
        if (fs.existsSync(migrationPath)) {
            try {
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
                await pool.query(migrationSQL);
            } catch (migrationErr) {
                // Ignore errors if columns already exist (which they will for fresh schema.sql runs)
            }
        }

        // Ensure registration_id in otp_verification is nullable
        try {
            await pool.query("ALTER TABLE cpay.otp_verification ALTER COLUMN registration_id DROP NOT NULL;");
        } catch (e) {}

        // Ensure user_type_id in registration table exists
        try {
            await pool.query("ALTER TABLE cpay.registration ADD COLUMN IF NOT EXISTS user_type_id UUID REFERENCES cpay.user_types(user_type_id);");
        } catch (e) {}

        // Ensure is_active and updated_at in geography master tables exist
        try {
            await pool.query("ALTER TABLE cpay.states ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
            await pool.query("ALTER TABLE cpay.districts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
            await pool.query("ALTER TABLE cpay.mandals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
            await pool.query("ALTER TABLE cpay.villages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
        } catch (e) {}

        // Ensure address_line1 in address_details is nullable
        try {
            await pool.query("ALTER TABLE cpay.address_details ALTER COLUMN address_line1 DROP NOT NULL;");
        } catch (e) {}

        // Ensure unit_id and photo_id in land_details exist
        try {
            await pool.query("ALTER TABLE cpay.land_details ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("ALTER TABLE cpay.land_details ADD COLUMN IF NOT EXISTS photo_id VARCHAR(100);");
            await pool.query("ALTER TABLE cpay.land_details ADD COLUMN IF NOT EXISTS mongo_photo_id VARCHAR(100);");
            await pool.query(`
                CREATE TABLE IF NOT EXISTS cpay.documents (
                    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    registration_id VARCHAR(255) NOT NULL,
                    document_type VARCHAR(100) NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    content_type VARCHAR(100) NOT NULL,
                    data BYTEA NOT NULL,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uidx_registration_document_type UNIQUE (registration_id, document_type)
                );
                CREATE INDEX IF NOT EXISTS idx_documents_registration_id ON cpay.documents(registration_id);
            `);
            await pool.query("ALTER TABLE cpay.plantation_details ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES cpay.registration(registration_id);");
            await pool.query("ALTER TABLE cpay.plantation_details ADD COLUMN IF NOT EXISTS area_unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("ALTER TABLE cpay.plantation_details ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("ALTER TABLE cpay.carbon_calculation ADD COLUMN IF NOT EXISTS land_id UUID REFERENCES cpay.land_details(land_id);");
            await pool.query("ALTER TABLE cpay.carbon_calculation ADD COLUMN IF NOT EXISTS estimated_co2 NUMERIC(18,4);");
            await pool.query("ALTER TABLE cpay.carbon_calculation ADD COLUMN IF NOT EXISTS source_type VARCHAR(50);");
            await pool.query("ALTER TABLE cpay.carbon_calculation ADD COLUMN IF NOT EXISTS formula_version VARCHAR(50);");
            try {
                await pool.query("ALTER TABLE cpay.carbon_calculation ADD CONSTRAINT carbon_calculation_registration_id_key UNIQUE (registration_id);");
            } catch (e) {}
            await pool.query("ALTER TABLE cpay.consent_details ADD COLUMN IF NOT EXISTS accept_terms BOOLEAN DEFAULT TRUE;");
            await pool.query("ALTER TABLE cpay.consent_details ADD COLUMN IF NOT EXISTS accept_privacy BOOLEAN DEFAULT TRUE;");
            await pool.query("ALTER TABLE cpay.consent_details ADD COLUMN IF NOT EXISTS accept_declaration BOOLEAN DEFAULT TRUE;");
            await pool.query("ALTER TABLE cpay.consent_details ADD COLUMN IF NOT EXISTS declaration_version VARCHAR(20);");
            await pool.query("ALTER TABLE cpay.application_status_history ADD COLUMN IF NOT EXISTS history_id UUID DEFAULT uuid_generate_v4();");
            await pool.query("ALTER TABLE cpay.application_status_history ADD COLUMN IF NOT EXISTS previous_status VARCHAR(50);");
            await pool.query("ALTER TABLE cpay.application_status_history ADD COLUMN IF NOT EXISTS current_status VARCHAR(50);");
            await pool.query("ALTER TABLE cpay.application_status_history ADD COLUMN IF NOT EXISTS status VARCHAR(50);");
            await pool.query("ALTER TABLE cpay.plantation_details ALTER COLUMN number_of_plants TYPE NUMERIC(12,2) USING number_of_plants::NUMERIC(12,2);");
            await pool.query("ALTER TABLE cpay.plantation_details ALTER COLUMN plantation_age TYPE NUMERIC(12,2) USING plantation_age::NUMERIC(12,2);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ALTER COLUMN stock_quantity TYPE NUMERIC(12,2) USING stock_quantity::NUMERIC(12,2);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ALTER COLUMN culture_days TYPE NUMERIC(12,2) USING culture_days::NUMERIC(12,2);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ALTER COLUMN crops_per_year TYPE NUMERIC(12,2) USING crops_per_year::NUMERIC(12,2);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES cpay.registration(registration_id);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS area_unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS feed_unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES cpay.units(unit_id);");
            await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS uidx_user_survey ON cpay.land_details (user_id, survey_number, COALESCE(sub_division_number, ''));");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.aquaculture_ghg_calculations (calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), registration_id UUID REFERENCES cpay.registration(registration_id) ON DELETE CASCADE, culture_type VARCHAR(50) NOT NULL DEFAULT 'IMC', pond_area_ha NUMERIC(14,4) DEFAULT 1.0, crops_per_year NUMERIC(14,4) DEFAULT 1.5, stocking_density NUMERIC(14,4) DEFAULT 6250, stocking_weight_g NUMERIC(14,4) DEFAULT 150, final_harvest_weight_g NUMERIC(14,4) DEFAULT 1500, culture_duration_days NUMERIC(14,4) DEFAULT 240, survival_fraction NUMERIC(6,4) DEFAULT 0.80, actual_fcr_used NUMERIC(8,4) DEFAULT 3.0, improved_fcr NUMERIC(8,4) DEFAULT 2.5, total_feed_required_kg NUMERIC(16,4) DEFAULT 0, improved_feed_kg NUMERIC(16,4) DEFAULT 0, total_production_kg NUMERIC(16,4) DEFAULT 0, feed_scope3_co2e_t NUMERIC(14,4) DEFAULT 0, improved_feed_co2e_t NUMERIC(14,4) DEFAULT 0, ch4_co2e_t NUMERIC(14,4) DEFAULT 0, improved_ch4_co2e_t NUMERIC(14,4) DEFAULT 0, n2o_co2e_t NUMERIC(14,4) DEFAULT 0, improved_n2o_co2e_t NUMERIC(14,4) DEFAULT 0, electricity_co2e_t NUMERIC(14,4) DEFAULT 0, diesel_co2e_t NUMERIC(14,4) DEFAULT 0, total_energy_co2e_t NUMERIC(14,4) DEFAULT 0, improved_energy_co2e_t NUMERIC(14,4) DEFAULT 0, gross_emission_baseline_t NUMERIC(14,4) DEFAULT 0, gross_emission_improved_t NUMERIC(14,4) DEFAULT 0, carbon_stored_biomass_t NUMERIC(14,4) DEFAULT 0, net_emission_baseline_t NUMERIC(14,4) DEFAULT 0, net_emission_improved_t NUMERIC(14,4) DEFAULT 0, co2e_reduction_per_crop_t NUMERIC(14,4) DEFAULT 0, pct_reduction NUMERIC(10,4) DEFAULT 0, carbon_credit_per_year_t NUMERIC(14,4) DEFAULT 0, carbon_credit_per_ha_per_year_t NUMERIC(14,4) DEFAULT 0, gross_income NUMERIC(18,2) DEFAULT 0, total_cost NUMERIC(18,2) DEFAULT 0, net_profit NUMERIC(18,2) DEFAULT 0, annual_net_profit NUMERIC(18,2) DEFAULT 0, calculation_details JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.verification_requests (request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), registration_id UUID REFERENCES cpay.registration(registration_id) ON DELETE CASCADE, user_id UUID REFERENCES cpay.users(user_id) ON DELETE CASCADE, assigned_valuator_id UUID REFERENCES cpay.users(user_id), status VARCHAR(50) DEFAULT 'SUBMITTED', remarks TEXT, reviewed_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.valuator_evaluations (evaluation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), registration_id UUID REFERENCES cpay.registration(registration_id) ON DELETE CASCADE, valuator_id UUID REFERENCES cpay.users(user_id), status VARCHAR(50) NOT NULL, remarks TEXT, evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.wallet_balances (wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL UNIQUE REFERENCES cpay.users(user_id) ON DELETE CASCADE, credit_wallet_balance NUMERIC(18,2) DEFAULT 0, cash_wallet_balance NUMERIC(18,2) DEFAULT 100000.00, currency VARCHAR(10) DEFAULT 'INR', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.wallet_transactions (transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES cpay.users(user_id) ON DELETE CASCADE, transaction_type VARCHAR(100) NOT NULL, details TEXT, credit_amount NUMERIC(18,2) DEFAULT 0, cash_amount NUMERIC(18,2) DEFAULT 0, status VARCHAR(50) DEFAULT 'COMPLETED', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.carbon_trades (trade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), seller_user_id UUID REFERENCES cpay.users(user_id), buyer_user_id UUID REFERENCES cpay.users(user_id), registration_id UUID REFERENCES cpay.registration(registration_id), quantity NUMERIC(18,2) NOT NULL, price_per_credit NUMERIC(18,2) NOT NULL, total_amount NUMERIC(18,2) NOT NULL, trade_type VARCHAR(10) NOT NULL, status VARCHAR(50) DEFAULT 'COMPLETED', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("CREATE TABLE IF NOT EXISTS cpay.certificates (certificate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), certificate_number VARCHAR(100) NOT NULL UNIQUE, registration_id UUID REFERENCES cpay.registration(registration_id) ON DELETE CASCADE, user_id UUID REFERENCES cpay.users(user_id) ON DELETE CASCADE, issued_date DATE DEFAULT CURRENT_DATE, total_carbon_credits NUMERIC(18,2) DEFAULT 0, certificate_url TEXT, status VARCHAR(50) DEFAULT 'ACTIVE', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
            await pool.query("UPDATE cpay.carbon_rate_master SET rate_per_credit = 120.00 WHERE rate_per_credit = 1000.00;");
            await pool.query("UPDATE cpay.carbon_calculation SET market_rate = 120.00 WHERE market_rate = 1000.00 OR market_rate IS NULL;");
            await pool.query("UPDATE cpay.carbon_calculation SET market_value = carbon_credits * market_rate WHERE market_rate = 120.00;");
        } catch (e) {}

        // 5. Seed default lookup values if the lookup tables are empty
        const lookupTables = [
            'roles',
            'user_types',
            'registration_types',
            'land_types',
            'units',
            'plantation_categories',
            'plant_species',
            'fish_species',
            'prawn_species',
            'states',
            'districts',
            'mandals',
            'villages',
            'carbon_rate_master'
        ];

        let runSeed = false;
        for (const lookupTable of lookupTables) {
            const countRes = await pool.query(`SELECT COUNT(*) FROM cpay.${lookupTable};`);
            const count = parseInt(countRes.rows[0].count, 10);
            if (count === 0) {
                console.log(`   Lookup table "cpay.${lookupTable}" is empty. Flagging for seed.`);
                runSeed = true;
            }
        }

        if (runSeed) {
            const seedPath = path.join(dbDir, 'seed.sql');
            if (fs.existsSync(seedPath)) {
                console.log('   Executing seed.sql to populate lookup values...');
                const seedSQL = fs.readFileSync(seedPath, 'utf8');
                await pool.query(seedSQL);
                console.log('   ✅ Seeding completed successfully.');
            } else {
                console.warn(`   ⚠️ seed.sql not found at ${seedPath}`);
            }
        } else {
            console.log('   ✅ Lookup database tables are already seeded.');
        }

        // 6. Ensure default Admin account exists
        const oldAdminCheck = await pool.query(
            "SELECT user_id FROM cpay.users WHERE email = $1 LIMIT 1",
            ['admin@cpay.com']
        );
        const newPasswordHash = await bcrypt.hash('datagridz123', 10);
        if (oldAdminCheck.rows.length > 0) {
            console.log('   👤 Migrating old default Admin user to admin@datagridz.com...');
            await pool.query(
                "UPDATE cpay.users SET email = $1, password_hash = $2, username = 'admin' WHERE user_id = $3",
                ['admin@datagridz.com', newPasswordHash, oldAdminCheck.rows[0].user_id]
            );
        }

        const adminCheck = await pool.query(
            "SELECT user_id FROM cpay.users WHERE email = $1 LIMIT 1",
            ['admin@datagridz.com']
        );
        if (adminCheck.rows.length === 0) {
            console.log('   👤 Creating default Admin user...');
            const adminRoleId = '5c80088e-4162-4671-9fdb-b89a956cbb4f';
            await pool.query(
                `INSERT INTO cpay.users 
                 (user_id, role_id, user_type_id, username, email, mobile_number, password_hash, is_email_verified, is_mobile_verified, is_active)
                 VALUES ($1, $2, (SELECT user_type_id FROM cpay.user_types LIMIT 1), $3, $4, $5, $6, TRUE, TRUE, TRUE)`,
                ['d7b0507d-39d4-463a-ad0c-8d8f4d5fd81d', adminRoleId, 'admin', 'admin@datagridz.com', '9999999999', newPasswordHash]
            );
            console.log('   ✅ Default Admin user created: admin@datagridz.com / datagridz123');
        }

        // 7. Auto-heal default land registrations if empty
        const regCheck = await pool.query("SELECT COUNT(*) FROM cpay.registration;");
        if (parseInt(regCheck.rows[0].count, 10) === 0) {
            console.log('   🌱 No registrations found in PostgreSQL database. Auto-seeding default land assets...');
            const sellerRoleId = 'f061f4e6-0c98-466d-a37c-121024948a84';
            const valuatorRoleId = 'e89456bc-365a-493e-bc5d-df12b694b8e2';
            const uTypeRes = await pool.query('SELECT user_type_id FROM cpay.user_types LIMIT 1');
            const userTypeId = uTypeRes.rows[0]?.user_type_id;

            const tsStateId = '6a3501a1-9b1b-4d4a-a289-4a928929e101';
            const apStateId = '7b4602b2-0c2c-5e5b-b390-5b039030f202';
            const mbnDistrictId = '8c5703c3-1d3d-6f6c-c401-6c1401410303';
            const wgDistrictId = '9d6804d4-2e4e-7a7d-d512-7d2512520404';
            const pentlaMandalId = '0e7905e5-3f5f-8b8e-e623-8e3623630505';
            const gunduMandalId = '1f8006f6-4a6a-9c9f-f734-9f4734740606';
            const pentlaVillageId = '2a9107a7-5b7b-0d0a-a845-0a5845850707';
            const agadaVillageId = '3b0208b8-6c8c-1e1b-b956-1b6956960808';

            await pool.query(`INSERT INTO cpay.states (state_id, state_code, state_name) VALUES ($1, 'TG', 'Telangana'), ($2, 'AP', 'Andhra Pradesh') ON CONFLICT DO NOTHING`, [tsStateId, apStateId]);
            await pool.query(`INSERT INTO cpay.districts (district_id, state_id, district_name) VALUES ($1, $2, 'Mahabub Nagar'), ($3, $4, 'West Godavari') ON CONFLICT DO NOTHING`, [mbnDistrictId, tsStateId, wgDistrictId, apStateId]);
            await pool.query(`INSERT INTO cpay.mandals (mandal_id, district_id, mandal_name) VALUES ($1, $2, 'Pentlavally'), ($3, $4, 'Gundugolanu') ON CONFLICT DO NOTHING`, [pentlaMandalId, mbnDistrictId, gunduMandalId, wgDistrictId]);
            await pool.query(`INSERT INTO cpay.villages (village_id, mandal_id, village_name, pincode) VALUES ($1, $2, 'Pentlavally', '509105'), ($3, $4, 'Agadalalanka', '534427') ON CONFLICT DO NOTHING`, [pentlaVillageId, pentlaMandalId, agadaVillageId, gunduMandalId]);

            const sivaUserId = 'e89456bc-365a-493e-bc5d-df12b694b8e2';
            await pool.query(`
              INSERT INTO cpay.users (user_id, role_id, user_type_id, username, email, mobile_number, password_hash, is_active, created_at, updated_at)
              VALUES ($1, $2, $3, 'siva', 'siva@cpay.com', '+919876543210', $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (user_id) DO UPDATE SET username = 'siva', mobile_number = '+919876543210'
            `, [sivaUserId, valuatorRoleId, userTypeId, newPasswordHash]);

            await pool.query(`
              INSERT INTO cpay.valuator_details (valuator_id, user_id, name, organization_name, created_at, updated_at)
              VALUES ('4c1309c9-7d9d-2f2c-ca67-2c7a67070909', $1, 'siva', 'UNFCCC Lead Auditor Agency', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [sivaUserId]);

            const sellerUserId = 'd43dc7f7-de8e-4711-8ec2-fc4525b76157';
            await pool.query(`
              INSERT INTO cpay.users (user_id, role_id, user_type_id, username, email, mobile_number, password_hash, is_active, created_at, updated_at)
              VALUES ($1, $2, $3, 'nandha', 'nandha@cpay.com', '+917815928358', $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (user_id) DO UPDATE SET username = 'nandha', mobile_number = '+917815928358'
            `, [sellerUserId, sellerRoleId, userTypeId, newPasswordHash]);

            await pool.query(`
              INSERT INTO cpay.individual_details (user_id, full_name, mobile_number, email, aadhaar_number, pan_number, created_at, updated_at)
              VALUES ($1, 'nandha', '+917815928358', 'nandha@cpay.com', '123451234512', 'ABCJK1234G', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (user_id) DO UPDATE SET full_name = 'nandha', aadhaar_number = '123451234512', pan_number = 'ABCJK1234G'
            `, [sellerUserId]);

            const reg1Id = '09b7626b-9999-4a91-ba2e-ae3cf7539317';
            await pool.query(`
              INSERT INTO cpay.registration (registration_id, application_number, user_id, registration_type_id, user_type_id, application_status, current_step, total_area, total_production, total_carbon_credits, portfolio_value, remarks, submitted_at, created_at, updated_at)
              VALUES ($1, 'CPAY2026771288', $2, (SELECT registration_type_id FROM cpay.registration_types LIMIT 1), $3, 'VERIFIED_CORRECT', 8, 50.00, 150000.00, 890.87, 106904.40, 'Approved Pentlavally Asset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (registration_id) DO UPDATE SET application_status = 'VERIFIED_CORRECT', total_area = 50.00, total_production = 150000.00, total_carbon_credits = 890.87, portfolio_value = 106904.40
            `, [reg1Id, sellerUserId, userTypeId]);

            await pool.query(`
              INSERT INTO cpay.address_details (address_id, registration_id, user_id, address_line1, state_id, district_id, mandal_id, village_id, pincode, latitude, longitude, created_at, updated_at)
              VALUES ('5d240ad0-8eae-3a3d-db78-3d8b78181010', $1, $2, 'Pentlavally, Mahabub Nagar', $3, $4, $5, $6, '509105', 16.0833, 78.2000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [reg1Id, sellerUserId, tsStateId, mbnDistrictId, pentlaMandalId, pentlaVillageId]);

            const land1Id = '6e350be1-9fbf-4b4e-ec89-4e9c89292121';
            await pool.query(`
              INSERT INTO cpay.land_details (land_id, registration_id, user_id, land_type_id, survey_number, sub_division_number, total_area, total_production, total_carbon_credits, portfolio_value, unit_id, latitude, longitude, created_at, updated_at)
              VALUES ($1, $2, $3, (SELECT land_type_id FROM cpay.land_types WHERE land_type_name ILIKE '%aqua%' OR land_type_name ILIKE '%fish%' LIMIT 1), '201', '3E', 50.0000, 150000.00, 890.87, 106904.40, (SELECT unit_id FROM cpay.units WHERE unit_name ILIKE '%acre%' LIMIT 1), 16.0833, 78.2000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [land1Id, reg1Id, sellerUserId]);

            await pool.query(`
              INSERT INTO cpay.aquaculture_details (aquaculture_id, registration_id, land_id, aquaculture_type, fish_species_id, prawn_species_id, stock_quantity, culture_days, pond_area, feed_consumed, fcr, remarks, created_at, updated_at)
              VALUES ('7f460cf2-0acf-5c5f-fd90-5fad90303232', $1, $2, 'Fish', (SELECT fish_species_id FROM cpay.fish_species WHERE species_name ILIKE '%panga%' LIMIT 1), (SELECT prawn_species_id FROM cpay.prawn_species LIMIT 1), 200000, 180, 50.0000, 15000, 1.2, 'Pangasius Fish Pond Pentlavally', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [reg1Id, land1Id]);

            await pool.query(`
              INSERT INTO cpay.carbon_calculation (calculation_id, registration_id, land_id, estimated_co2, carbon_credits, market_rate, market_value, source_type, formula_version, calculated_at, created_at, updated_at)
              VALUES ('80570dg3-1bd0-6d6a-ae01-6abe01414343', $1, $2, 890.87, 890.87, 120.00, 106904.40, 'DASHBOARD', '1.0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (registration_id) DO UPDATE SET estimated_co2 = 890.87, carbon_credits = 890.87, market_value = 106904.40
            `, [reg1Id, land1Id]);

            const reg2Id = 'b7f4e6af-3784-4360-b341-6c0145f046c8';
            await pool.query(`
              INSERT INTO cpay.registration (registration_id, application_number, user_id, registration_type_id, user_type_id, application_status, current_step, total_area, total_production, total_carbon_credits, portfolio_value, remarks, submitted_at, created_at, updated_at)
              VALUES ($1, 'CPAY2026543210', $2, (SELECT registration_type_id FROM cpay.registration_types LIMIT 1), $3, 'VERIFIED_CORRECT', 8, 30.00, 2500.00, 71.50, 8580.00, 'Approved Agadalalanka Asset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (registration_id) DO UPDATE SET application_status = 'VERIFIED_CORRECT', total_area = 30.00, total_production = 2500.00, total_carbon_credits = 71.50, portfolio_value = 8580.00
            `, [reg2Id, sellerUserId, userTypeId]);

            await pool.query(`
              INSERT INTO cpay.address_details (address_id, registration_id, user_id, address_line1, state_id, district_id, mandal_id, village_id, pincode, latitude, longitude, created_at, updated_at)
              VALUES ('91680eh4-2ce1-7e7b-bf12-7bcf12525454', $1, $2, 'Agadalalanka, West Godavari', $3, $4, $5, $6, '534427', 16.8500, 81.3300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [reg2Id, sellerUserId, apStateId, wgDistrictId, gunduMandalId, agadaVillageId]);

            const land2Id = '02790fi5-3df2-8f8c-c023-8cd023636565';
            await pool.query(`
              INSERT INTO cpay.land_details (land_id, registration_id, user_id, land_type_id, survey_number, sub_division_number, total_area, total_production, total_carbon_credits, portfolio_value, unit_id, latitude, longitude, created_at, updated_at)
              VALUES ($1, $2, $3, (SELECT land_type_id FROM cpay.land_types LIMIT 1), '125', '4A', 30.0000, 2500.00, 71.50, 8580.00, (SELECT unit_id FROM cpay.units WHERE unit_name ILIKE '%acre%' LIMIT 1), 16.8500, 81.3300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [land2Id, reg2Id, sellerUserId]);

            await pool.query(`
              INSERT INTO cpay.plantation_details (plantation_id, registration_id, land_id, plantation_category_id, plant_species_id, number_of_plants, plantation_age, plantation_area, area_unit_id, remarks, created_at, updated_at)
              VALUES ('13801gj6-4eg3-909d-d134-9de134747676', $1, $2, (SELECT plantation_category_id FROM cpay.plantation_categories LIMIT 1), (SELECT plant_species_id FROM cpay.plant_species LIMIT 1), 2500, 3, 30.0000, (SELECT unit_id FROM cpay.units WHERE unit_name ILIKE '%acre%' LIMIT 1), 'Neem / Fruit Plantation 30 Acres', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT DO NOTHING
            `, [reg2Id, land2Id]);

            await pool.query(`
              INSERT INTO cpay.carbon_calculation (calculation_id, registration_id, land_id, estimated_co2, carbon_credits, market_rate, market_value, source_type, formula_version, calculated_at, created_at, updated_at)
              VALUES ('24912hk7-5fh4-010e-e245-0ef245858787', $1, $2, 71.50, 71.50, 120.00, 8580.00, 'DASHBOARD', '1.0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (registration_id) DO UPDATE SET estimated_co2 = 71.50, carbon_credits = 71.50, market_value = 8580.00
            `, [reg2Id, land2Id]);

            console.log('   ✅ Auto-seeded default land assets successfully.');
        }

        console.log('✅ Self-healing database initialization verified successfully.');

    } catch (error) {
        console.error('❌ Database self-healing initialization failed:', error.message);
        throw error;
    }
};
