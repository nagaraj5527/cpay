/*==============================================================
V1__initial.sql
Initial Database Creation
==============================================================*/

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS cpay;

SET search_path TO cpay;

------------------------------------------------------------
-- Execute Base Scripts
------------------------------------------------------------

-- Copy the contents of:
-- schema.sql
-- constraints.sql
-- indexes.sql
-- functions.sql

-- into this migration.

-- Initial Seed

-- Roles
INSERT INTO roles(role_name)
VALUES
('Administrator'),
('Manager'),
('Field Officer'),
('Verifier'),
('Citizen')
ON CONFLICT DO NOTHING;

-- User Types

INSERT INTO user_types(user_type_name)
VALUES
('Individual'),
('Organization'),
('Government'),
('Valuator')
ON CONFLICT DO NOTHING;