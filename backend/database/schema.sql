/*==============================================================
 CPAY DATABASE SCHEMA
 Version : 1.0
 Database: PostgreSQL
==============================================================*/

---------------------------------------------------------------
-- EXTENSIONS
---------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------------
-- SCHEMA
---------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS cpay;

SET search_path TO cpay, public;

---------------------------------------------------------------
-- MASTER TABLE : ROLES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles
(
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    role_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : USER TYPES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_types
(
    user_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_type_name VARCHAR(100) NOT NULL UNIQUE,

    category VARCHAR(100) NOT NULL,

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : REGISTRATION TYPES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS registration_types
(
    registration_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_type_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : STATES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS states
(
    state_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    state_name VARCHAR(150) NOT NULL UNIQUE,

    state_code VARCHAR(10),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- AQUACULTURE GHG & CARBON CALCULATIONS (v3.3 Engine Spec)
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS aquaculture_ghg_calculations
(
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,
    culture_type VARCHAR(50) NOT NULL DEFAULT 'IMC',
    pond_area_ha NUMERIC(14,4) DEFAULT 1.0,
    crops_per_year NUMERIC(14,4) DEFAULT 1.5,
    stocking_density NUMERIC(14,4) DEFAULT 6250,
    stocking_weight_g NUMERIC(14,4) DEFAULT 150,
    final_harvest_weight_g NUMERIC(14,4) DEFAULT 1500,
    culture_duration_days NUMERIC(14,4) DEFAULT 240,
    survival_fraction NUMERIC(6,4) DEFAULT 0.80,
    actual_fcr_used NUMERIC(8,4) DEFAULT 3.0,
    improved_fcr NUMERIC(8,4) DEFAULT 2.5,
    total_feed_required_kg NUMERIC(16,4) DEFAULT 0,
    improved_feed_kg NUMERIC(16,4) DEFAULT 0,
    total_production_kg NUMERIC(16,4) DEFAULT 0,
    feed_scope3_co2e_t NUMERIC(14,4) DEFAULT 0,
    improved_feed_co2e_t NUMERIC(14,4) DEFAULT 0,
    ch4_co2e_t NUMERIC(14,4) DEFAULT 0,
    improved_ch4_co2e_t NUMERIC(14,4) DEFAULT 0,
    n2o_co2e_t NUMERIC(14,4) DEFAULT 0,
    improved_n2o_co2e_t NUMERIC(14,4) DEFAULT 0,
    electricity_co2e_t NUMERIC(14,4) DEFAULT 0,
    diesel_co2e_t NUMERIC(14,4) DEFAULT 0,
    total_energy_co2e_t NUMERIC(14,4) DEFAULT 0,
    improved_energy_co2e_t NUMERIC(14,4) DEFAULT 0,
    gross_emission_baseline_t NUMERIC(14,4) DEFAULT 0,
    gross_emission_improved_t NUMERIC(14,4) DEFAULT 0,
    carbon_stored_biomass_t NUMERIC(14,4) DEFAULT 0,
    net_emission_baseline_t NUMERIC(14,4) DEFAULT 0,
    net_emission_improved_t NUMERIC(14,4) DEFAULT 0,
    co2e_reduction_per_crop_t NUMERIC(14,4) DEFAULT 0,
    pct_reduction NUMERIC(10,4) DEFAULT 0,
    carbon_credit_per_year_t NUMERIC(14,4) DEFAULT 0,
    carbon_credit_per_ha_per_year_t NUMERIC(14,4) DEFAULT 0,
    gross_income NUMERIC(18,2) DEFAULT 0,
    total_cost NUMERIC(18,2) DEFAULT 0,
    net_profit NUMERIC(18,2) DEFAULT 0,
    annual_net_profit NUMERIC(18,2) DEFAULT 0,
    calculation_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : DISTRICTS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS districts
(
    district_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    state_id UUID NOT NULL,

    district_name VARCHAR(150) NOT NULL,

    district_code VARCHAR(20),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_district_state
        FOREIGN KEY(state_id)
        REFERENCES states(state_id)
);

---------------------------------------------------------------
-- MASTER TABLE : MANDALS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mandals
(
    mandal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    district_id UUID NOT NULL,

    mandal_name VARCHAR(150) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mandal_district
        FOREIGN KEY(district_id)
        REFERENCES districts(district_id)
);

---------------------------------------------------------------
-- MASTER TABLE : VILLAGES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS villages
(
    village_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    mandal_id UUID NOT NULL,

    village_name VARCHAR(150) NOT NULL,

    pincode VARCHAR(10),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_village_mandal
        FOREIGN KEY(mandal_id)
        REFERENCES mandals(mandal_id)
);

---------------------------------------------------------------
-- MASTER TABLE : LAND TYPES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS land_types
(
    land_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    land_type_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : PLANTATION CATEGORIES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS plantation_categories
(
    plantation_category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    category_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : PLANT SPECIES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS plant_species
(
    plant_species_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    scientific_name VARCHAR(200),

    common_name VARCHAR(200),

    carbon_factor NUMERIC(10,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : FISH SPECIES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fish_species
(
    fish_species_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    species_name VARCHAR(200) NOT NULL,

    scientific_name VARCHAR(200),

    carbon_factor NUMERIC(10,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : PRAWN SPECIES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS prawn_species
(
    prawn_species_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    species_name VARCHAR(200) NOT NULL,

    scientific_name VARCHAR(200),

    carbon_factor NUMERIC(10,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : UNITS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS units
(
    unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    unit_name VARCHAR(100) NOT NULL UNIQUE,

    unit_symbol VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : CARBON RATE MASTER
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carbon_rate_master
(
    rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    credit_type VARCHAR(100),

    rate_per_credit NUMERIC(18,2),

    effective_from DATE,

    effective_to DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- MASTER TABLE : DOCUMENT TYPES
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS document_types
(
    document_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    document_name VARCHAR(200) NOT NULL UNIQUE,

    mandatory BOOLEAN DEFAULT FALSE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/*==============================================================
AUTHENTICATION & RBAC TABLES
==============================================================*/

---------------------------------------------------------------
-- USERS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    role_id UUID NOT NULL,

    user_type_id UUID NOT NULL,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(255) UNIQUE,

    mobile_number VARCHAR(15) UNIQUE,

    password_hash TEXT NOT NULL,

    is_email_verified BOOLEAN DEFAULT FALSE,

    is_mobile_verified BOOLEAN DEFAULT FALSE,

    account_locked BOOLEAN DEFAULT FALSE,

    failed_login_attempts INTEGER DEFAULT 0,

    last_login TIMESTAMP,

    password_changed_at TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,

    updated_by UUID,

    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_users_type
        FOREIGN KEY (user_type_id)
        REFERENCES user_types(user_type_id)
);

---------------------------------------------------------------
-- PERMISSIONS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS permissions
(
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    module_name VARCHAR(100) NOT NULL,

    permission_name VARCHAR(150) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_permission
        UNIQUE(module_name, permission_name)
);

---------------------------------------------------------------
-- ROLE PERMISSIONS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS role_permissions
(
    role_permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    role_id UUID NOT NULL,

    permission_id UUID NOT NULL,

    can_create BOOLEAN DEFAULT FALSE,

    can_read BOOLEAN DEFAULT FALSE,

    can_update BOOLEAN DEFAULT FALSE,

    can_delete BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role_permission_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY(permission_id)
        REFERENCES permissions(permission_id),

    CONSTRAINT uq_role_permission
        UNIQUE(role_id, permission_id)
);

---------------------------------------------------------------
-- USER PERMISSIONS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_permissions
(
    user_permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL,

    permission_id UUID NOT NULL,

    can_create BOOLEAN DEFAULT FALSE,

    can_read BOOLEAN DEFAULT FALSE,

    can_update BOOLEAN DEFAULT FALSE,

    can_delete BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_permission_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_permission_permission
        FOREIGN KEY(permission_id)
        REFERENCES permissions(permission_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_permission
        UNIQUE(user_id, permission_id)
);


/*==============================================================
REGISTRATION MODULE
==============================================================*/

---------------------------------------------------------------
-- REGISTRATION
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS registration
(
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    application_number VARCHAR(50) NOT NULL UNIQUE,

    registration_type_id UUID NOT NULL,

    user_type_id UUID,

    user_id UUID NOT NULL,

    application_status VARCHAR(50) DEFAULT 'DRAFT',

    current_step INTEGER DEFAULT 1,

    submitted_at TIMESTAMP,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_registration_type
        FOREIGN KEY (registration_type_id)
        REFERENCES registration_types(registration_type_id),

    CONSTRAINT fk_registration_user_type
        FOREIGN KEY (user_type_id)
        REFERENCES user_types(user_type_id),

    CONSTRAINT fk_registration_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

---------------------------------------------------------------
-- INDIVIDUAL DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS individual_details
(
    individual_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL UNIQUE,

    full_name VARCHAR(200) NOT NULL,

    father_name VARCHAR(200),

    gender VARCHAR(20),

    date_of_birth DATE,

    aadhaar_number VARCHAR(20),

    pan_number VARCHAR(20),

    mobile_number VARCHAR(15),

    email VARCHAR(255),

    occupation VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_individual_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

---------------------------------------------------------------
-- ORGANIZATION DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_details
(
    organization_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL UNIQUE,

    organization_name VARCHAR(250) NOT NULL,

    organization_type VARCHAR(100),

    registration_number VARCHAR(100),

    gst_number VARCHAR(50),

    pan_number VARCHAR(50),

    contact_person VARCHAR(200),

    mobile_number VARCHAR(15),

    email VARCHAR(255),

    website VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_organization_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

---------------------------------------------------------------
-- GOVERNMENT DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS government_details
(
    government_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL UNIQUE,

    department_name VARCHAR(250) NOT NULL,

    office_name VARCHAR(250),

    designation VARCHAR(150),

    officer_name VARCHAR(200),

    employee_id VARCHAR(100),

    mobile_number VARCHAR(15),

    email VARCHAR(255),

    pan_number VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_government_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

---------------------------------------------------------------
-- VALUATOR DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS valuator_details
(
    valuator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID,

    registration_id UUID UNIQUE,

    name VARCHAR(200),

    valuator_name VARCHAR(200),

    licence VARCHAR(100),

    license_number VARCHAR(100),

    organization_name VARCHAR(250),

    mobile_number VARCHAR(15),

    email VARCHAR(255),

    address TEXT,

    aadhaar_number VARCHAR(20),

    pan_number VARCHAR(20),

    aadhaar_file VARCHAR(255),

    pan_file VARCHAR(255),

    licence_file VARCHAR(255),

    is_approved BOOLEAN DEFAULT FALSE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1
);

---------------------------------------------------------------
-- ADDRESS DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS address_details
(
    address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL UNIQUE,

    address_line1 VARCHAR(255),

    address_line2 VARCHAR(255),

    state_id UUID NOT NULL,

    district_id UUID NOT NULL,

    mandal_id UUID NOT NULL,

    village_id UUID NOT NULL,

    pincode VARCHAR(10),

    latitude NUMERIC(10,7),

    longitude NUMERIC(10,7),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_address_registration
        FOREIGN KEY (registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_address_state
        FOREIGN KEY (state_id)
        REFERENCES states(state_id),

    CONSTRAINT fk_address_district
        FOREIGN KEY (district_id)
        REFERENCES districts(district_id),

    CONSTRAINT fk_address_mandal
        FOREIGN KEY (mandal_id)
        REFERENCES mandals(mandal_id),

    CONSTRAINT fk_address_village
        FOREIGN KEY (village_id)
        REFERENCES villages(village_id)
);


/*==============================================================
LAND & CARBON MODULE
==============================================================*/

---------------------------------------------------------------
-- LAND DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS land_details
(
    land_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL,

    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,

    survey_number VARCHAR(100) NOT NULL,

    sub_division_number VARCHAR(100),

    land_type_id UUID NOT NULL,

    total_area NUMERIC(12,4) NOT NULL,

    cultivated_area NUMERIC(12,4),

    uncultivated_area NUMERIC(12,4),

    unit_id UUID REFERENCES units(unit_id),

    irrigation_source VARCHAR(150),

    soil_type VARCHAR(150),

    latitude NUMERIC(10,7),

    longitude NUMERIC(10,7),

    photo_id VARCHAR(100),
    photo_document_id VARCHAR(100),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_land_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_land_type
        FOREIGN KEY(land_type_id)
        REFERENCES land_types(land_type_id)
);

---------------------------------------------------------------
-- PLANTATION DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS plantation_details
(
    plantation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,

    land_id UUID NOT NULL,

    plantation_category_id UUID NOT NULL,

    plant_species_id UUID NOT NULL,

    plantation_area NUMERIC(12,4),

    area_unit_id UUID REFERENCES units(unit_id),
    unit_id UUID REFERENCES units(unit_id),

    number_of_plants NUMERIC(12,2),

    plantation_date DATE,

    plantation_age NUMERIC(12,2),

    average_height NUMERIC(8,2),

    average_girth NUMERIC(8,2),

    survival_rate NUMERIC(5,2),

    estimated_biomass NUMERIC(12,2),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_plantation_land
        FOREIGN KEY(land_id)
        REFERENCES land_details(land_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_plantation_category
        FOREIGN KEY(plantation_category_id)
        REFERENCES plantation_categories(plantation_category_id),

    CONSTRAINT fk_plant_species
        FOREIGN KEY(plant_species_id)
        REFERENCES plant_species(plant_species_id)
);

---------------------------------------------------------------
-- AQUACULTURE DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS aquaculture_details
(
    aquaculture_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,

    land_id UUID NOT NULL,

    aquaculture_type VARCHAR(50),

    fish_species_id UUID,

    prawn_species_id UUID,

    pond_area NUMERIC(12,4),
    area_unit_id UUID REFERENCES units(unit_id),
    feed_unit_id UUID REFERENCES units(unit_id),
    unit_id UUID REFERENCES units(unit_id),

    water_spread_area NUMERIC(12,4),

    stock_quantity NUMERIC(12,2),

    culture_days NUMERIC(12,2),

    feed_consumed NUMERIC(12,2),

    fcr NUMERIC(8,2),

    crops_per_year NUMERIC(12,2),

    annual_production NUMERIC(12,2),

    net_biomass_gain NUMERIC(12,2),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_aqua_land
        FOREIGN KEY(land_id)
        REFERENCES land_details(land_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_aqua_fish
        FOREIGN KEY(fish_species_id)
        REFERENCES fish_species(fish_species_id),

    CONSTRAINT fk_aqua_prawn
        FOREIGN KEY(prawn_species_id)
        REFERENCES prawn_species(prawn_species_id)
);

---------------------------------------------------------------
-- CARBON CALCULATION
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carbon_calculation
(
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL,

    land_id UUID REFERENCES land_details(land_id) ON DELETE CASCADE,

    plantation_carbon NUMERIC(18,4) DEFAULT 0,

    aquaculture_carbon NUMERIC(18,4) DEFAULT 0,

    estimated_co2 NUMERIC(18,4) DEFAULT 0,

    total_carbon NUMERIC(18,4) DEFAULT 0,

    carbon_credits NUMERIC(18,4) DEFAULT 0,

    market_rate NUMERIC(18,2),

    market_value NUMERIC(18,2),

    source_type VARCHAR(50),

    formula_version VARCHAR(50),

    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    calculated_by UUID,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_carbon_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_carbon_user
        FOREIGN KEY(calculated_by)
        REFERENCES users(user_id)
);


/*==============================================================
CONSENT & OTP MODULE
==============================================================*/

---------------------------------------------------------------
-- CONSENT DETAILS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS consent_details
(
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL UNIQUE,

    consent_given BOOLEAN DEFAULT FALSE,

    accept_terms BOOLEAN DEFAULT TRUE,
    accept_privacy BOOLEAN DEFAULT TRUE,
    accept_declaration BOOLEAN DEFAULT TRUE,
    declaration_version VARCHAR(20),

    consent_text TEXT,

    consent_date TIMESTAMP,

    ip_address VARCHAR(100),

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,

    version INTEGER DEFAULT 1,

    CONSTRAINT fk_consent_registration
        FOREIGN KEY (registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE
);

---------------------------------------------------------------
-- OTP VERIFICATION
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS otp_verification
(
    otp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID,

    mobile_number VARCHAR(15),

    otp_code VARCHAR(10),

    purpose VARCHAR(50),

    expires_at TIMESTAMP,

    verified BOOLEAN DEFAULT FALSE,

    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_registration
        FOREIGN KEY (registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE
);



/*==============================================================
DOCUMENT MANAGEMENT
==============================================================*/

---------------------------------------------------------------
-- DOCUMENTS & BINARY FILE STORAGE
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents
(
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id VARCHAR(255) NOT NULL,

    document_type VARCHAR(100) NOT NULL,

    filename VARCHAR(255) NOT NULL,

    content_type VARCHAR(100) NOT NULL,

    data BYTEA NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uidx_registration_document_type UNIQUE (registration_id, document_type)
);

CREATE INDEX IF NOT EXISTS idx_documents_registration_id ON documents(registration_id);

---------------------------------------------------------------
-- UPLOADED DOCUMENTS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS uploaded_documents
(
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL,

    document_type_id UUID NOT NULL,

    file_name VARCHAR(255),

    original_file_name VARCHAR(255),

    file_path TEXT,

    file_id VARCHAR(255),

    file_size BIGINT,

    mime_type VARCHAR(150),

    uploaded_by UUID,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_verified BOOLEAN DEFAULT FALSE,

    remarks TEXT,

    CONSTRAINT fk_document_registration
        FOREIGN KEY (registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_type
        FOREIGN KEY (document_type_id)
        REFERENCES document_types(document_type_id),

    CONSTRAINT fk_document_user
        FOREIGN KEY (uploaded_by)
        REFERENCES users(user_id)
);

---------------------------------------------------------------
-- DOCUMENT VERSIONS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS document_versions
(
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    document_id UUID NOT NULL,

    version_number INTEGER NOT NULL,

    file_id VARCHAR(255),

    file_path TEXT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    uploaded_by UUID,

    remarks TEXT,

    CONSTRAINT fk_document_version
        FOREIGN KEY(document_id)
        REFERENCES uploaded_documents(document_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_version_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(user_id)
);

---------------------------------------------------------------
-- DOCUMENT VERIFICATION
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS document_verification
(
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    document_id UUID NOT NULL,

    verified_by UUID,

    verification_status VARCHAR(50),

    remarks TEXT,

    verified_at TIMESTAMP,

    CONSTRAINT fk_doc_verify_document
        FOREIGN KEY(document_id)
        REFERENCES uploaded_documents(document_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doc_verify_user
        FOREIGN KEY(verified_by)
        REFERENCES users(user_id)
);



/*==============================================================
WORKFLOW MANAGEMENT
==============================================================*/

---------------------------------------------------------------
-- WORKFLOW MASTER
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_master
(
    workflow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    workflow_name VARCHAR(150),

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------------
-- WORKFLOW STEPS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_steps
(
    step_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    workflow_id UUID NOT NULL,

    step_number INTEGER,

    step_name VARCHAR(150),

    assigned_role UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_steps
        FOREIGN KEY(workflow_id)
        REFERENCES workflow_master(workflow_id),

    CONSTRAINT fk_step_role
        FOREIGN KEY(assigned_role)
        REFERENCES roles(role_id)
);

---------------------------------------------------------------
-- WORKFLOW HISTORY
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_history
(
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL,

    step_id UUID NOT NULL,

    action_taken VARCHAR(100),

    action_by UUID,

    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    CONSTRAINT fk_workflow_history_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_workflow_history_step
        FOREIGN KEY(step_id)
        REFERENCES workflow_steps(step_id),

    CONSTRAINT fk_workflow_history_user
        FOREIGN KEY(action_by)
        REFERENCES users(user_id)
);

---------------------------------------------------------------
-- WORKFLOW TASKS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workflow_tasks
(
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID,

    assigned_to UUID,

    assigned_role UUID,

    task_status VARCHAR(50),

    due_date TIMESTAMP,

    completed_at TIMESTAMP,

    remarks TEXT,

    CONSTRAINT fk_task_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id),

    CONSTRAINT fk_task_user
        FOREIGN KEY(assigned_to)
        REFERENCES users(user_id),

    CONSTRAINT fk_task_role
        FOREIGN KEY(assigned_role)
        REFERENCES roles(role_id)
);

---------------------------------------------------------------
-- APPROVAL ACTIONS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS approval_actions
(
    approval_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    registration_id UUID,

    approved_by UUID,

    approval_level INTEGER,

    approval_status VARCHAR(50),

    remarks TEXT,

    approved_at TIMESTAMP,

    CONSTRAINT fk_approval_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id),

    CONSTRAINT fk_approval_user
        FOREIGN KEY(approved_by)
        REFERENCES users(user_id)
);



/*==============================================================
AUDIT
==============================================================*/

---------------------------------------------------------------
-- AUDIT LOGS
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs
(
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    table_name VARCHAR(200),

    record_id UUID,

    operation_type VARCHAR(20),

    old_data JSONB,

    new_data JSONB,

    performed_by UUID,

    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ip_address VARCHAR(100),

    user_agent TEXT
);

---------------------------------------------------------------
-- AUDIT LOGS ARCHIVE
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs_archive
(
    LIKE audit_logs INCLUDING ALL
);



/*==============================================================
APPLICATION STATUS HISTORY
==============================================================*/

---------------------------------------------------------------
-- APPLICATION STATUS HISTORY
---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS application_status_history
(
    status_history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    history_id UUID DEFAULT uuid_generate_v4(),

    registration_id UUID NOT NULL,

    old_status VARCHAR(50),

    new_status VARCHAR(50),

    previous_status VARCHAR(50),
    current_status VARCHAR(50),
    status VARCHAR(50),

    changed_by UUID,

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    CONSTRAINT fk_status_registration
        FOREIGN KEY(registration_id)
        REFERENCES registration(registration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_user
        FOREIGN KEY(changed_by)
        REFERENCES users(user_id)
);

/*==============================================================
VERIFICATION REQUESTS & AUDITOR EVALUATIONS
==============================================================*/

CREATE TABLE IF NOT EXISTS verification_requests
(
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_valuator_id UUID REFERENCES users(user_id),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    remarks TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valuator_evaluations
(
    evaluation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,
    valuator_id UUID REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL,
    remarks TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*==============================================================
WALLET & CARBON CREDIT TRADING MODULE
==============================================================*/

CREATE TABLE IF NOT EXISTS wallet_balances
(
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    credit_wallet_balance NUMERIC(18,2) DEFAULT 0,
    cash_wallet_balance NUMERIC(18,2) DEFAULT 100000.00,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions
(
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_type VARCHAR(100) NOT NULL,
    details TEXT,
    credit_amount NUMERIC(18,2) DEFAULT 0,
    cash_amount NUMERIC(18,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carbon_trades
(
    trade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_user_id UUID REFERENCES users(user_id),
    buyer_user_id UUID REFERENCES users(user_id),
    registration_id UUID REFERENCES registration(registration_id),
    quantity NUMERIC(18,2) NOT NULL,
    price_per_credit NUMERIC(18,2) NOT NULL,
    total_amount NUMERIC(18,2) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates
(
    certificate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    registration_id UUID REFERENCES registration(registration_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    issued_date DATE DEFAULT CURRENT_DATE,
    total_carbon_credits NUMERIC(18,2) DEFAULT 0,
    certificate_url TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*==============================================================
ENTERPRISE MULTI-POND, NOTIFICATIONS & SUPPORT MODULES
==============================================================*/

CREATE TABLE IF NOT EXISTS ponds
(
    pond_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    land_id UUID NOT NULL REFERENCES land_details(land_id) ON DELETE CASCADE,
    pond_number INTEGER NOT NULL,
    pond_name VARCHAR(100),
    culture_type VARCHAR(100) NOT NULL DEFAULT 'Fish Culture',
    species_name VARCHAR(100) NOT NULL DEFAULT 'IMC',
    pond_area_ha NUMERIC(12,4) NOT NULL DEFAULT 1.0,
    unit VARCHAR(50) DEFAULT 'Hectare',
    stocking_density NUMERIC(12,2) DEFAULT 6250,
    stocking_weight_g NUMERIC(10,2) DEFAULT 150,
    final_harvest_weight_g NUMERIC(10,2) DEFAULT 1500,
    culture_duration_days INTEGER DEFAULT 240,
    survival_fraction NUMERIC(5,2) DEFAULT 0.80,
    actual_fcr NUMERIC(6,2) DEFAULT 3.0,
    improved_fcr NUMERIC(6,2) DEFAULT 2.5,
    paddlewheel_units INTEGER DEFAULT 4,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_land_pond_number UNIQUE (land_id, pond_number)
);

CREATE INDEX IF NOT EXISTS idx_ponds_land_id ON ponds(land_id);

CREATE TABLE IF NOT EXISTS pond_carbon_calculations
(
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pond_id UUID NOT NULL REFERENCES ponds(pond_id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES land_details(land_id) ON DELETE CASCADE,
    total_feed_required_kg NUMERIC(16,4) DEFAULT 0,
    total_production_kg NUMERIC(16,4) DEFAULT 0,
    co2e_reduction_per_crop_t NUMERIC(14,4) DEFAULT 0,
    pct_reduction NUMERIC(10,4) DEFAULT 0,
    carbon_credit_per_year_t NUMERIC(14,4) DEFAULT 0,
    carbon_credit_per_ha_per_year_t NUMERIC(14,4) DEFAULT 0,
    portfolio_value NUMERIC(18,2) DEFAULT 0,
    calculation_details JSONB,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pond_calc_pond_id ON pond_carbon_calculations(pond_id);
CREATE INDEX IF NOT EXISTS idx_pond_calc_land_id ON pond_carbon_calculations(land_id);

CREATE TABLE IF NOT EXISTS auditor_pin_assignments
(
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditor_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pincode VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_auditor_pincode UNIQUE (auditor_user_id, pincode)
);

CREATE INDEX IF NOT EXISTS idx_auditor_pin_pincode ON auditor_pin_assignments(pincode);

CREATE TABLE IF NOT EXISTS notifications
(
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, is_read);

CREATE TABLE IF NOT EXISTS support_tickets
(
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

CREATE TABLE IF NOT EXISTS support_messages
(
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

CREATE TABLE IF NOT EXISTS asset_verification_history
(
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    land_id UUID NOT NULL REFERENCES land_details(land_id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES users(user_id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    remarks TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_verification_land ON asset_verification_history(land_id);



