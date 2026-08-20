-- ====================================================
-- C-PAY Database Migration v2: 60 Aquaculture & v3.4 IMC MRV Specification Columns
-- ====================================================

-- Module 1.1: Stocking & Growth Parameters
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS stocking_weight_g NUMERIC(10,2) DEFAULT 150;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS partial_harvest_weight_g NUMERIC(10,2);
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS final_harvest_weight_g NUMERIC(10,2) DEFAULT 1500;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS culture_duration_days INTEGER DEFAULT 240;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS survival_fraction NUMERIC(5,2) DEFAULT 0.80;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS aeration_required BOOLEAN DEFAULT FALSE;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS average_fcr NUMERIC(6,2) DEFAULT 3.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS improved_fcr_target NUMERIC(6,2) DEFAULT 2.5;

-- Module 2.1: Farm & Crop Inputs
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS water_depth_m NUMERIC(6,2) DEFAULT 1.5;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS gwp_framework VARCHAR(20) DEFAULT 'AR5';
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS farm_reported_fcr NUMERIC(6,2);

-- Module 3.1 & 4.1: Growth Model & Harvest Event Options
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS growth_curve_type VARCHAR(50) DEFAULT 'Exponential';
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS mortality_feed_factor NUMERIC(5,2) DEFAULT 0.50;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS event_day INTEGER;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS event_count_per_kg NUMERIC(10,2);
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS event_pct_harvested NUMERIC(5,2);

-- Module 6.1: Soil, Fertilizer & Gas Measurement Inputs
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS anaerobic_adjustment_factor NUMERIC(5,2) DEFAULT 1.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS sediment_burial_fraction NUMERIC(5,2) DEFAULT 0.20;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS ch4_oxidation_fraction NUMERIC(5,2) DEFAULT 0.25;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS n2o_ef_preset VARCHAR(20) DEFAULT '0.71%';
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS n2o_ef_custom NUMERIC(8,4);
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS measured_ch4_kg NUMERIC(12,4);
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS measured_n2o_kg NUMERIC(12,4);
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS lime_applied_kg NUMERIC(12,2) DEFAULT 200;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS lime_ef NUMERIC(6,2) DEFAULT 0.12;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS fertilizer_n_kg NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS fertilizer_n2o_ef NUMERIC(8,4) DEFAULT 0.01;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS idle_days INTEGER DEFAULT 20;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS idle_ef_kgco2e_per_ha_day NUMERIC(6,2) DEFAULT 2.0;

-- Module 7.1: Energy Engine Inputs
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS paddlewheel_hp NUMERIC(6,2) DEFAULT 2;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS paddlewheel_units INTEGER DEFAULT 4;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS paddlewheel_hours NUMERIC(6,2) DEFAULT 8;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS blower_kw NUMERIC(6,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS blower_hours NUMERIC(6,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS diesel_l NUMERIC(12,2) DEFAULT 500;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS generator_diesel_l NUMERIC(12,2) DEFAULT 200;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS grid_kwh NUMERIC(12,2) DEFAULT 500;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS solar_offset_kwh NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS diesel_ef NUMERIC(6,2) DEFAULT 3.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS grid_ef NUMERIC(8,4) DEFAULT 0.710;

-- Module 8.1: Economics Inputs
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS feed_price NUMERIC(10,2) DEFAULT 45;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS electricity_tariff NUMERIC(8,2) DEFAULT 7.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS diesel_price NUMERIC(8,2) DEFAULT 92;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS labour_cost NUMERIC(12,2) DEFAULT 60000;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS probiotics_cost NUMERIC(12,2) DEFAULT 25000;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS seed_price NUMERIC(8,2) DEFAULT 3.5;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS other_costs NUMERIC(12,2) DEFAULT 20000;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2) DEFAULT 130;

-- Module 9.1 & 10.1: Interventions & Biomass Carbon
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS interventions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS biomass_carbon_pct NUMERIC(5,2) DEFAULT 0.08;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS edible_yield_fraction NUMERIC(5,2) DEFAULT 0.65;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS pdf_attachments JSONB DEFAULT '[]'::jsonb;

-- v3.4 IMC Field-Data Methodology Specification Columns
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS pre_stocking_soc NUMERIC(6,2) DEFAULT 1.20;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS post_harvest_soc NUMERIC(6,2) DEFAULT 1.45;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS total_soil_nitrogen NUMERIC(6,2) DEFAULT 0.15;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS soil_cn_ratio NUMERIC(6,2) DEFAULT 12.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS bulk_density NUMERIC(6,2) DEFAULT 1.25;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS sampling_depth NUMERIC(6,2) DEFAULT 0.15;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS q_dob NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS q_gnc NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS q_sbm NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS q_ddgs NUMERIC(12,2) DEFAULT 0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS punch_bag_feeding BOOLEAN DEFAULT FALSE;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS pre_dawn_do NUMERIC(5,2) DEFAULT 4.5;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS h2s_detected BOOLEAN DEFAULT FALSE;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS cyanobacteria_avg NUMERIC(5,2) DEFAULT 15.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS water_ph NUMERIC(4,2) DEFAULT 7.5;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS tan_mg_l NUMERIC(6,2) DEFAULT 0.5;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS secchi_depth_cm NUMERIC(6,2) DEFAULT 35;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS diatoms_pct NUMERIC(5,2) DEFAULT 40.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS green_algae_pct NUMERIC(5,2) DEFAULT 35.0;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS zooplankton_score INTEGER DEFAULT 2;
ALTER TABLE cpay.aquaculture_details ADD COLUMN IF NOT EXISTS mrv_status VARCHAR(20) DEFAULT 'PASS';

-- Ponds & Land Details enhancements for PDF & JSON details losslessness
ALTER TABLE cpay.land_details ADD COLUMN IF NOT EXISTS pdf_attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cpay.ponds ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cpay.ponds ADD COLUMN IF NOT EXISTS pdf_attachments JSONB DEFAULT '[]'::jsonb;
