-- ====================================================
-- C-PAY Database Migration: Aquaculture Details Columns
-- ====================================================

ALTER TABLE cpay.aquaculture_details 
ADD COLUMN IF NOT EXISTS crops_per_year NUMERIC DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS net_biomass_gain NUMERIC DEFAULT 198.0,
ADD COLUMN IF NOT EXISTS feed_crude_protein NUMERIC DEFAULT 0.28,
ADD COLUMN IF NOT EXISTS feed_carbon_content NUMERIC DEFAULT 0.40,
ADD COLUMN IF NOT EXISTS dob_proportion NUMERIC DEFAULT 0.9091,
ADD COLUMN IF NOT EXISTS dob_emission_factor NUMERIC DEFAULT 0.4,
ADD COLUMN IF NOT EXISTS gnc_emission_factor NUMERIC DEFAULT 1.2,
ADD COLUMN IF NOT EXISTS n_retention_efficiency NUMERIC DEFAULT 0.25,
ADD COLUMN IF NOT EXISTS c_retention_efficiency NUMERIC DEFAULT 0.22,
ADD COLUMN IF NOT EXISTS n2o_n_emission_factor NUMERIC DEFAULT 0.006,
ADD COLUMN IF NOT EXISTS gwp_ch4 NUMERIC DEFAULT 28.0,
ADD COLUMN IF NOT EXISTS gwp_n2o NUMERIC DEFAULT 265.0,
ADD COLUMN IF NOT EXISTS diesel_emission_factor NUMERIC DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS diesel_baseline NUMERIC DEFAULT 2000.0,
ADD COLUMN IF NOT EXISTS diesel_improved NUMERIC DEFAULT 1600.0,
ADD COLUMN IF NOT EXISTS baseline_anaerobic_fraction NUMERIC DEFAULT 0.20,
ADD COLUMN IF NOT EXISTS improved_anaerobic_fraction NUMERIC DEFAULT 0.08,
ADD COLUMN IF NOT EXISTS fcr_improvement NUMERIC DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS measured_ch4_baseline NUMERIC,
ADD COLUMN IF NOT EXISTS measured_ch4_improved NUMERIC,
ADD COLUMN IF NOT EXISTS measured_n2o_baseline NUMERIC,
ADD COLUMN IF NOT EXISTS measured_n2o_improved NUMERIC;
