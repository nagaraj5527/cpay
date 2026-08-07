/*==============================================================
CPAY DATABASE CONSTRAINTS
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- LAND DETAILS
---------------------------------------------------------------

ALTER TABLE land_details
ADD CONSTRAINT chk_land_total_area
CHECK (total_area > 0);

ALTER TABLE land_details
ADD CONSTRAINT chk_land_cultivated_area
CHECK (
    cultivated_area IS NULL
    OR cultivated_area >= 0
);

ALTER TABLE land_details
ADD CONSTRAINT chk_land_uncultivated_area
CHECK (
    uncultivated_area IS NULL
    OR uncultivated_area >= 0
);

ALTER TABLE land_details
ADD CONSTRAINT uq_land_registration_survey
UNIQUE (
    registration_id,
    survey_number,
    sub_division_number
);

---------------------------------------------------------------
-- PLANTATION DETAILS
---------------------------------------------------------------

ALTER TABLE plantation_details
ADD CONSTRAINT chk_plantation_area
CHECK (
    plantation_area IS NULL
    OR plantation_area > 0
);

ALTER TABLE plantation_details
ADD CONSTRAINT chk_number_of_plants
CHECK (
    number_of_plants IS NULL
    OR number_of_plants >= 0
);

ALTER TABLE plantation_details
ADD CONSTRAINT chk_plantation_age
CHECK (
    plantation_age IS NULL
    OR plantation_age >= 0
);

ALTER TABLE plantation_details
ADD CONSTRAINT chk_survival_rate
CHECK (
    survival_rate IS NULL
    OR (survival_rate >= 0 AND survival_rate <= 100)
);

ALTER TABLE plantation_details
ADD CONSTRAINT uq_land_plantation
UNIQUE
(
    land_id,
    plantation_category_id,
    plant_species_id
);

---------------------------------------------------------------
-- AQUACULTURE
---------------------------------------------------------------

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_stock_quantity
CHECK (
    stock_quantity IS NULL
    OR stock_quantity >= 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_pond_area
CHECK (
    pond_area IS NULL
    OR pond_area > 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_water_spread
CHECK (
    water_spread_area IS NULL
    OR water_spread_area > 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_culture_days
CHECK (
    culture_days IS NULL
    OR culture_days > 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_feed_consumed
CHECK (
    feed_consumed IS NULL
    OR feed_consumed >= 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_fcr
CHECK (
    fcr IS NULL
    OR fcr >= 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_crops_per_year
CHECK (
    crops_per_year IS NULL
    OR crops_per_year > 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_annual_production
CHECK (
    annual_production IS NULL
    OR annual_production >= 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_biomass_gain
CHECK (
    net_biomass_gain IS NULL
    OR net_biomass_gain >= 0
);

ALTER TABLE aquaculture_details
ADD CONSTRAINT uq_land_aquaculture
UNIQUE
(
    land_id,
    aquaculture_type,
    fish_species_id,
    prawn_species_id
);

---------------------------------------------------------------
-- CARBON CALCULATION
---------------------------------------------------------------

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_plantation_carbon
CHECK (plantation_carbon >= 0);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_aquaculture_carbon
CHECK (aquaculture_carbon >= 0);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_total_carbon
CHECK (total_carbon >= 0);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_carbon_credits
CHECK (carbon_credits >= 0);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_market_rate
CHECK (
    market_rate IS NULL
    OR market_rate >= 0
);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_market_value
CHECK (
    market_value IS NULL
    OR market_value >= 0
);

---------------------------------------------------------------
-- OTP
---------------------------------------------------------------

ALTER TABLE otp_verification
ADD CONSTRAINT chk_otp_length
CHECK (length(otp_code) BETWEEN 4 AND 10);

---------------------------------------------------------------
-- DOCUMENT VERSION
---------------------------------------------------------------

ALTER TABLE document_versions
ADD CONSTRAINT chk_document_version
CHECK (version_number > 0);

---------------------------------------------------------------
-- USERS
---------------------------------------------------------------

ALTER TABLE users
ADD CONSTRAINT chk_failed_login
CHECK (failed_login_attempts >= 0);

---------------------------------------------------------------
-- VERSION CHECKS
---------------------------------------------------------------

ALTER TABLE users
ADD CONSTRAINT chk_user_version
CHECK (version > 0);

ALTER TABLE registration
ADD CONSTRAINT chk_registration_version
CHECK (version > 0);

ALTER TABLE individual_details
ADD CONSTRAINT chk_individual_version
CHECK (version > 0);

ALTER TABLE organization_details
ADD CONSTRAINT chk_organization_version
CHECK (version > 0);

ALTER TABLE government_details
ADD CONSTRAINT chk_government_version
CHECK (version > 0);

ALTER TABLE valuator_details
ADD CONSTRAINT chk_valuator_version
CHECK (version > 0);

ALTER TABLE address_details
ADD CONSTRAINT chk_address_version
CHECK (version > 0);

ALTER TABLE land_details
ADD CONSTRAINT chk_land_version
CHECK (version > 0);

ALTER TABLE plantation_details
ADD CONSTRAINT chk_plantation_version
CHECK (version > 0);

ALTER TABLE aquaculture_details
ADD CONSTRAINT chk_aquaculture_version
CHECK (version > 0);

ALTER TABLE carbon_calculation
ADD CONSTRAINT chk_carbon_version
CHECK (version > 0);

ALTER TABLE consent_details
ADD CONSTRAINT chk_consent_version
CHECK (version > 0);

CREATE UNIQUE INDEX IF NOT EXISTS uq_land_user_survey_coalesce 
ON land_details (user_id, survey_number, COALESCE(sub_division_number, ''));


