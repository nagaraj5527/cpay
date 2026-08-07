/*==============================================================
CPAY DATABASE INDEXES
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- USERS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_mobile
ON users(mobile_number);

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role_id);

CREATE INDEX IF NOT EXISTS idx_users_type
ON users(user_type_id);

CREATE INDEX IF NOT EXISTS idx_users_active
ON users(is_active);

---------------------------------------------------------------
-- REGISTRATION
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_registration_user
ON registration(user_id);

CREATE INDEX IF NOT EXISTS idx_registration_status
ON registration(application_status);

CREATE INDEX IF NOT EXISTS idx_registration_type
ON registration(registration_type_id);

CREATE INDEX IF NOT EXISTS idx_registration_created
ON registration(created_at);

CREATE INDEX IF NOT EXISTS idx_registration_submitted
ON registration(submitted_at);

---------------------------------------------------------------
-- INDIVIDUAL DETAILS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_individual_name
ON individual_details(full_name);

CREATE INDEX IF NOT EXISTS idx_individual_mobile
ON individual_details(mobile_number);

CREATE INDEX IF NOT EXISTS idx_individual_aadhaar
ON individual_details(aadhaar_number);

CREATE INDEX IF NOT EXISTS idx_individual_pan
ON individual_details(pan_number);

---------------------------------------------------------------
-- ORGANIZATION DETAILS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_org_name
ON organization_details(organization_name);

CREATE INDEX IF NOT EXISTS idx_org_gst
ON organization_details(gst_number);

---------------------------------------------------------------
-- ADDRESS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_address_state
ON address_details(state_id);

CREATE INDEX IF NOT EXISTS idx_address_district
ON address_details(district_id);

CREATE INDEX IF NOT EXISTS idx_address_mandal
ON address_details(mandal_id);

CREATE INDEX IF NOT EXISTS idx_address_village
ON address_details(village_id);

---------------------------------------------------------------
-- LAND
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_land_registration
ON land_details(registration_id);

CREATE INDEX IF NOT EXISTS idx_land_type
ON land_details(land_type_id);

CREATE INDEX IF NOT EXISTS idx_land_survey
ON land_details(survey_number);

---------------------------------------------------------------
-- PLANTATION
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_plantation_land
ON plantation_details(land_id);

CREATE INDEX IF NOT EXISTS idx_plant_species
ON plantation_details(plant_species_id);

CREATE INDEX IF NOT EXISTS idx_plant_category
ON plantation_details(plantation_category_id);

---------------------------------------------------------------
-- AQUACULTURE
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_aqua_land
ON aquaculture_details(land_id);

CREATE INDEX IF NOT EXISTS idx_aqua_fish
ON aquaculture_details(fish_species_id);

CREATE INDEX IF NOT EXISTS idx_aqua_prawn
ON aquaculture_details(prawn_species_id);

CREATE INDEX IF NOT EXISTS idx_aqua_type
ON aquaculture_details(aquaculture_type);

---------------------------------------------------------------
-- CARBON
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_carbon_registration
ON carbon_calculation(registration_id);

CREATE INDEX IF NOT EXISTS idx_carbon_calculated
ON carbon_calculation(calculated_at);

---------------------------------------------------------------
-- OTP
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_otp_registration
ON otp_verification(registration_id);

CREATE INDEX IF NOT EXISTS idx_otp_mobile
ON otp_verification(mobile_number);

CREATE INDEX IF NOT EXISTS idx_otp_verified
ON otp_verification(verified);

CREATE INDEX IF NOT EXISTS idx_otp_expiry
ON otp_verification(expires_at);

---------------------------------------------------------------
-- DOCUMENTS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_document_registration
ON uploaded_documents(registration_id);

CREATE INDEX IF NOT EXISTS idx_document_type
ON uploaded_documents(document_type_id);

CREATE INDEX IF NOT EXISTS idx_document_uploaded_by
ON uploaded_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_document_verified
ON uploaded_documents(is_verified);

---------------------------------------------------------------
-- DOCUMENT VERSION
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_document_version_document
ON document_versions(document_id);

---------------------------------------------------------------
-- DOCUMENT VERIFICATION
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_document_verify_document
ON document_verification(document_id);

CREATE INDEX IF NOT EXISTS idx_document_verify_user
ON document_verification(verified_by);

---------------------------------------------------------------
-- WORKFLOW
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_workflow_history_registration
ON workflow_history(registration_id);

CREATE INDEX IF NOT EXISTS idx_workflow_history_step
ON workflow_history(step_id);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_registration
ON workflow_tasks(registration_id);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_assigned
ON workflow_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_role
ON workflow_tasks(assigned_role);

---------------------------------------------------------------
-- APPROVALS
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_approval_registration
ON approval_actions(registration_id);

CREATE INDEX IF NOT EXISTS idx_approval_user
ON approval_actions(approved_by);

---------------------------------------------------------------
-- STATUS HISTORY
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_status_registration
ON application_status_history(registration_id);

CREATE INDEX IF NOT EXISTS idx_status_changed_by
ON application_status_history(changed_by);

---------------------------------------------------------------
-- AUDIT
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_audit_table
ON audit_logs(table_name);

CREATE INDEX IF NOT EXISTS idx_audit_record
ON audit_logs(record_id);

CREATE INDEX IF NOT EXISTS idx_audit_operation
ON audit_logs(operation_type);

CREATE INDEX IF NOT EXISTS idx_audit_time
ON audit_logs(performed_at);

CREATE INDEX IF NOT EXISTS idx_audit_archive_time
ON audit_logs_archive(performed_at);

---------------------------------------------------------------
-- VALUATOR DETAILS (HIGH PERFORMANCE INDEXES)
---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_valuator_user_id
ON valuator_details(user_id);

CREATE INDEX IF NOT EXISTS idx_valuator_licence
ON valuator_details(licence);

CREATE INDEX IF NOT EXISTS idx_valuator_aadhaar
ON valuator_details(aadhaar_number);

CREATE INDEX IF NOT EXISTS idx_valuator_pan
ON valuator_details(pan_number);

CREATE INDEX IF NOT EXISTS idx_valuator_approved
ON valuator_details(is_approved);


