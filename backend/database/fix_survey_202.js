import pool from '../src/config/postgres.js';

async function fixSurvey202() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const regRes = await client.query(`
      SELECT r.registration_id, r.user_id, ld.land_id 
      FROM cpay.registration r 
      JOIN cpay.land_details ld ON r.registration_id = ld.registration_id 
      WHERE ld.survey_number ILIKE '%202%' OR r.application_number ILIKE '%202%' 
    `);

    console.log(`Found ${regRes.rows.length} registrations for survey 202`);

    // Resolve units
    const unitRes = await client.query("SELECT unit_id FROM cpay.units WHERE unit_name ILIKE '%hectare%' LIMIT 1");
    const hectareUnitId = unitRes.rows.length > 0 ? unitRes.rows[0].unit_id : (await client.query("SELECT unit_id FROM cpay.units LIMIT 1")).rows[0].unit_id;

    const feedUnitRes = await client.query("SELECT unit_id FROM cpay.units WHERE unit_name ILIKE '%kilo%' OR unit_name ILIKE '%kg%' LIMIT 1");
    const kgUnitId = feedUnitRes.rows.length > 0 ? feedUnitRes.rows[0].unit_id : hectareUnitId;

    const pondsToCreate = [
      { name: 'Pond 1', species: 'IMC', area: 10.0, stock: 62500, fcr: 1.2, cultureDays: 240, prod: 75000, credits: 228.57 },
      { name: 'Pond 2', species: 'Roopchand', area: 5.0, stock: 50000, fcr: 1.2, cultureDays: 210, prod: 37500, credits: 114.28 },
      { name: 'Pond 3', species: 'Pangasius', area: 10.0, stock: 200000, fcr: 1.2, cultureDays: 180, prod: 170000, credits: 385.71 },
      { name: 'Pond 4', species: 'Tilapia', area: 5.0, stock: 75000, fcr: 1.2, cultureDays: 150, prod: 66000, credits: 185.71 }
    ];

    for (const reg of regRes.rows) {
      const { registration_id, user_id, land_id } = reg;
      console.log('Fixing registration:', registration_id, 'land:', land_id);

      // Create or get aquaculture_survey
      let surveyId;
      const survRes = await client.query(
        'SELECT survey_id FROM cpay.aquaculture_surveys WHERE registration_id = $1 LIMIT 1', 
        [registration_id]
      );

      if (survRes.rows.length > 0) {
        surveyId = survRes.rows[0].survey_id;
        await client.query(
          'UPDATE cpay.aquaculture_surveys SET total_water_area = 30.0, total_ponds = 4, updated_at = CURRENT_TIMESTAMP WHERE survey_id = $1',
          [surveyId]
        );
      } else {
        const insSurv = await client.query(
          `INSERT INTO cpay.aquaculture_surveys 
           (registration_id, asset_id, culture_type, total_water_area, total_ponds, created_at, updated_at) 
           VALUES ($1, $2, 'FISH', 30.0, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
           RETURNING survey_id`, 
          [registration_id, land_id]
        );
        surveyId = insSurv.rows[0].survey_id;
      }

      // Clear old entries
      await client.query('DELETE FROM cpay.aquaculture_details WHERE registration_id = $1 OR land_id = $2', [registration_id, land_id]);
      await client.query('DELETE FROM cpay.ponds WHERE survey_id = $1 OR land_id = $2', [surveyId, land_id]);

      let totalProd = 0;
      let totalCred = 0;

      for (let i = 0; i < pondsToCreate.length; i++) {
        const p = pondsToCreate[i];
        let fishSpeciesId = null;
        let nameMatch = 'IMC';
        if (p.species.toLowerCase().includes('panga')) nameMatch = 'PANGASIUS';
        else if (p.species.toLowerCase().includes('roop')) nameMatch = 'ROOPCHAND';
        else if (p.species.toLowerCase().includes('tilapia')) nameMatch = 'TILAPIA';

        const fRes = await client.query('SELECT fish_species_id FROM cpay.fish_species WHERE species_name = $1 LIMIT 1', [nameMatch]);
        if (fRes.rows.length > 0) fishSpeciesId = fRes.rows[0].fish_species_id;

        // Insert aquaculture_details
        await client.query(
          `INSERT INTO cpay.aquaculture_details 
           (registration_id, land_id, aquaculture_type, fish_species_id, stock_quantity, culture_days, pond_area, area_unit_id, feed_consumed, feed_unit_id, fcr, remarks, created_at, updated_at) 
           VALUES ($1, $2, 'FISH', $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [registration_id, land_id, fishSpeciesId, p.stock, p.cultureDays, p.area, hectareUnitId, p.stock * p.fcr, kgUnitId, p.fcr, `Survey Pond: ${p.name} | Species: ${p.species}`]
        );

        // Insert cpay.ponds
        const pIns = await client.query(
          `INSERT INTO cpay.ponds 
           (survey_id, land_id, pond_number, pond_name, species, pond_area, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
           RETURNING pond_id`,
          [surveyId, land_id, i + 1, p.name, p.species, p.area]
        );
        const pondId = pIns.rows[0].pond_id;

        const pVal = Math.round(p.credits * 120);

        // Insert cpay.pond_carbon_calculation
        await client.query('DELETE FROM cpay.pond_carbon_calculation WHERE pond_id = $1', [pondId]);
        await client.query(
          `INSERT INTO cpay.pond_carbon_calculation 
           (pond_id, co2_reduction, carbon_credit, portfolio_value, calculated_at) 
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [pondId, p.credits, p.credits, pVal]
        );

        // Insert cpay.pond_production
        await client.query('DELETE FROM cpay.pond_production WHERE pond_id = $1', [pondId]);
        await client.query(
          `INSERT INTO cpay.pond_production 
           (pond_id, production) 
           VALUES ($1, $2)`,
          [pondId, p.prod]
        );

        totalProd += p.prod;
        totalCred += p.credits;
      }

      const portfolioVal = Math.round(totalCred * 120);

      await client.query('UPDATE cpay.land_details SET total_area = 30.0, total_production = $1, total_carbon_credits = $2, portfolio_value = $3 WHERE land_id = $4', [totalProd, totalCred, portfolioVal, land_id]);
      await client.query('UPDATE cpay.registration SET total_area = 30.0, total_production = $1, total_carbon_credits = $2, portfolio_value = $3 WHERE registration_id = $4', [totalProd, totalCred, portfolioVal, registration_id]);
    }

    await client.query('COMMIT');
    console.log('🎉 SUCCESS: Created 4 ponds for all Survey 202 registrations in PostgreSQL!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing survey 202:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixSurvey202();
