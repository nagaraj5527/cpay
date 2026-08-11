/*==============================================================
 V4__enterprise_tables.sql
 C-PAY Enterprise Architecture Tables
 ==============================================================*/

SET search_path TO cpay, public;

---------------------------------------------------------------
-- PONDS (Child entities of Land / Asset)
---------------------------------------------------------------
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

---------------------------------------------------------------
-- POND CARBON CALCULATIONS
---------------------------------------------------------------
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

---------------------------------------------------------------
-- AUDITOR PIN CODE ASSIGNMENTS
---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditor_pin_assignments
(
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditor_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pincode VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_auditor_pincode UNIQUE (auditor_user_id, pincode)
);

CREATE INDEX IF NOT EXISTS idx_auditor_pin_pincode ON auditor_pin_assignments(pincode);

---------------------------------------------------------------
-- ENTERPRISE NOTIFICATIONS
---------------------------------------------------------------
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

---------------------------------------------------------------
-- SUPPORT TICKETS
---------------------------------------------------------------
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

---------------------------------------------------------------
-- SUPPORT MESSAGES
---------------------------------------------------------------
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

---------------------------------------------------------------
-- ASSET VERIFICATION HISTORY
---------------------------------------------------------------
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
