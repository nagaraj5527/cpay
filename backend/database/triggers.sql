/*==============================================================
 CPAY DATABASE TRIGGERS
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- UPDATED_AT TRIGGERS
---------------------------------------------------------------

CREATE TRIGGER trg_registration_updated
BEFORE UPDATE
ON registration
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_individual_updated
BEFORE UPDATE
ON individual_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_organization_updated
BEFORE UPDATE
ON organization_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_government_updated
BEFORE UPDATE
ON government_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_valuator_updated
BEFORE UPDATE
ON valuator_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_address_updated
BEFORE UPDATE
ON address_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_land_updated
BEFORE UPDATE
ON land_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_plantation_updated
BEFORE UPDATE
ON plantation_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_aquaculture_updated
BEFORE UPDATE
ON aquaculture_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_carbon_updated
BEFORE UPDATE
ON carbon_calculation
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_consent_updated
BEFORE UPDATE
ON consent_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

---------------------------------------------------------------
-- AUDIT TRIGGERS
---------------------------------------------------------------

CREATE TRIGGER trg_registration_audit
AFTER INSERT OR UPDATE OR DELETE
ON registration
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('registration_id');

CREATE TRIGGER trg_individual_audit
AFTER INSERT OR UPDATE OR DELETE
ON individual_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('individual_id');

CREATE TRIGGER trg_organization_audit
AFTER INSERT OR UPDATE OR DELETE
ON organization_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('organization_id');

CREATE TRIGGER trg_government_audit
AFTER INSERT OR UPDATE OR DELETE
ON government_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('government_id');

CREATE TRIGGER trg_valuator_audit
AFTER INSERT OR UPDATE OR DELETE
ON valuator_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('valuator_id');

CREATE TRIGGER trg_address_audit
AFTER INSERT OR UPDATE OR DELETE
ON address_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('address_id');

CREATE TRIGGER trg_land_audit
AFTER INSERT OR UPDATE OR DELETE
ON land_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('land_id');

CREATE TRIGGER trg_plantation_audit
AFTER INSERT OR UPDATE OR DELETE
ON plantation_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('plantation_id');

CREATE TRIGGER trg_aquaculture_audit
AFTER INSERT OR UPDATE OR DELETE
ON aquaculture_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('aquaculture_id');

CREATE TRIGGER trg_carbon_audit
AFTER INSERT OR UPDATE OR DELETE
ON carbon_calculation
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('calculation_id');

CREATE TRIGGER trg_consent_audit
AFTER INSERT OR UPDATE OR DELETE
ON consent_details
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('consent_id');

CREATE TRIGGER trg_document_audit
AFTER INSERT OR UPDATE OR DELETE
ON uploaded_documents
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('document_id');

CREATE TRIGGER trg_document_version_audit
AFTER INSERT OR UPDATE OR DELETE
ON document_versions
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('version_id');

CREATE TRIGGER trg_document_verification_audit
AFTER INSERT OR UPDATE OR DELETE
ON document_verification
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('verification_id');

CREATE TRIGGER trg_workflow_history_audit
AFTER INSERT OR UPDATE OR DELETE
ON workflow_history
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('history_id');

CREATE TRIGGER trg_workflow_task_audit
AFTER INSERT OR UPDATE OR DELETE
ON workflow_tasks
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('task_id');

CREATE TRIGGER trg_approval_audit
AFTER INSERT OR UPDATE OR DELETE
ON approval_actions
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('approval_id');

CREATE TRIGGER trg_status_history_audit
AFTER INSERT OR UPDATE OR DELETE
ON application_status_history
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_function('status_history_id');