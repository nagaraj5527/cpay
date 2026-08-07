/*==============================================================
 CPAY DATABASE FUNCTIONS
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- FUNCTION : UPDATE UPDATED_AT & VERSION
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
AS $$
BEGIN

    NEW.updated_at = CURRENT_TIMESTAMP;

    IF NEW.version IS NOT NULL THEN
        NEW.version = OLD.version + 1;
    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : AUDIT LOG
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
AS $$
DECLARE
    record_uuid UUID;
BEGIN

    IF TG_OP = 'INSERT' THEN

        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0])
        INTO record_uuid
        USING NEW;

        INSERT INTO audit_logs
        (
            table_name,
            record_id,
            operation_type,
            old_data,
            new_data,
            performed_at
        )
        VALUES
        (
            TG_TABLE_NAME,
            record_uuid,
            TG_OP,
            NULL,
            to_jsonb(NEW),
            CURRENT_TIMESTAMP
        );

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN

        IF to_jsonb(OLD) = to_jsonb(NEW) THEN
            RETURN NEW;
        END IF;

        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0])
        INTO record_uuid
        USING NEW;

        INSERT INTO audit_logs
        (
            table_name,
            record_id,
            operation_type,
            old_data,
            new_data,
            performed_at
        )
        VALUES
        (
            TG_TABLE_NAME,
            record_uuid,
            TG_OP,
            to_jsonb(OLD),
            to_jsonb(NEW),
            CURRENT_TIMESTAMP
        );

        RETURN NEW;

    ELSE

        EXECUTE format('SELECT ($1).%I::uuid', TG_ARGV[0])
        INTO record_uuid
        USING OLD;

        INSERT INTO audit_logs
        (
            table_name,
            record_id,
            operation_type,
            old_data,
            new_data,
            performed_at
        )
        VALUES
        (
            TG_TABLE_NAME,
            record_uuid,
            TG_OP,
            to_jsonb(OLD),
            NULL,
            CURRENT_TIMESTAMP
        );

        RETURN OLD;

    END IF;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : CLEAN EXPIRED OTP
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER
AS $$
DECLARE
    deleted_rows INTEGER;
BEGIN

    DELETE FROM otp_verification
    WHERE expires_at < CURRENT_TIMESTAMP
      AND verified = FALSE;

    GET DIAGNOSTICS deleted_rows = ROW_COUNT;

    RETURN deleted_rows;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : ARCHIVE AUDIT LOGS
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION archive_audit_logs()
RETURNS INTEGER
AS $$
DECLARE
    archived_rows INTEGER;
BEGIN

    INSERT INTO audit_logs_archive
    SELECT *
    FROM audit_logs
    WHERE performed_at < CURRENT_DATE - INTERVAL '365 days';

    GET DIAGNOSTICS archived_rows = ROW_COUNT;

    DELETE
    FROM audit_logs
    WHERE performed_at < CURRENT_DATE - INTERVAL '365 days';

    RETURN archived_rows;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : REFRESH MATERIALIZED VIEWS
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID
AS $$
BEGIN

    REFRESH MATERIALIZED VIEW mv_dashboard;

    REFRESH MATERIALIZED VIEW mv_registration_statistics;

    REFRESH MATERIALIZED VIEW mv_carbon_statistics;

    REFRESH MATERIALIZED VIEW mv_district_statistics;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : DATABASE HEALTH REPORT
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION database_health_report()
RETURNS TABLE
(
    table_name TEXT,
    total_rows BIGINT
)
AS $$
BEGIN

    RETURN QUERY

    SELECT

        relname::TEXT,

        n_live_tup

    FROM pg_stat_user_tables

    WHERE schemaname='cpay'

    ORDER BY relname;

END;
$$
LANGUAGE plpgsql;

---------------------------------------------------------------
-- FUNCTION : DATABASE MAINTENANCE
---------------------------------------------------------------

CREATE OR REPLACE FUNCTION perform_database_maintenance()
RETURNS VOID
AS $$
BEGIN

    PERFORM cleanup_expired_otps();

    PERFORM archive_audit_logs();

    PERFORM refresh_all_materialized_views();

END;
$$
LANGUAGE plpgsql;