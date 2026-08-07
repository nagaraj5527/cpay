/*==============================================================
 CPAY DATABASE SEED DATA
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- ROLES
---------------------------------------------------------------

INSERT INTO roles (role_id, role_name, description) VALUES
('5c80088e-4162-4671-9fdb-b89a956cbb4f', 'ADMIN', 'System Administrator'),
('f061f4e6-0c98-466d-a37c-121024948a84', 'SELLER', 'Private Land Owner'),
('f17ce811-e345-49f1-a2bf-411ddcc495ca', 'FARMER', 'Agricultural Farmer'),
('bbb9212c-4713-450f-9cbf-be87123df11e', 'NGO', 'Non Government Organization'),
('9776f814-9b5d-4794-af99-cf86da6d75b0', 'FPO', 'Farmer Producer Organization'),
('e2267e01-00b8-479c-a906-1d775c771609', 'COMMUNITY', 'Community Organization'),
('b35244de-cd33-4e86-8577-c002cf77733f', 'GOVERNMENT', 'Government Department'),
('ab679f90-78c1-4d8a-8b10-35dad4d67925', 'BUYER', 'Carbon Credit Buyer'),
('d7859794-79fc-4969-a26d-3c613dbd56f5', 'TRADER', 'Carbon Credit Trader'),
('e89456bc-365a-493e-bc5d-df12b694b8e2', 'VALUATOR', 'Approved Valuator')
ON CONFLICT (role_id) DO NOTHING;

---------------------------------------------------------------
-- USER TYPES
---------------------------------------------------------------

INSERT INTO user_types (user_type_name, category, description) VALUES
('Individual','INDIVIDUAL','Individual Applicant'),
('Organization','ORGANIZATION','Private Organization'),
('Government','GOVERNMENT','Government Department'),
('Valuator','VALUATOR','Approved Valuator')
ON CONFLICT (user_type_name) DO NOTHING;

---------------------------------------------------------------
-- REGISTRATION TYPES
---------------------------------------------------------------

INSERT INTO registration_types
(registration_type_name,description)
VALUES
('Individual','Individual Registration'),
('Organization','Organization Registration'),
('Government','Government Registration')
ON CONFLICT (registration_type_name) DO NOTHING;

---------------------------------------------------------------
-- LAND TYPES
---------------------------------------------------------------

INSERT INTO land_types
(land_type_name)
VALUES
('Agricultural'),
('Forest'),
('Wetland'),
('Aquaculture'),
('Mixed')
ON CONFLICT (land_type_name) DO NOTHING;

---------------------------------------------------------------
-- PLANTATION CATEGORIES
---------------------------------------------------------------

INSERT INTO plantation_categories
(category_name)
VALUES
('Fruit'),
('Timber'),
('Medicinal'),
('Bamboo'),
('Mangrove'),
('Shade Trees')
ON CONFLICT (category_name) DO NOTHING;

---------------------------------------------------------------
-- PLANT SPECIES
---------------------------------------------------------------

INSERT INTO plant_species
(common_name,scientific_name,carbon_factor)
VALUES
('Neem','Azadirachta indica',2.50),
('Mango','Mangifera indica',3.10),
('Teak','Tectona grandis',4.20),
('Bamboo','Bambusa vulgaris',5.00),
('Coconut','Cocos nucifera',2.90)
ON CONFLICT DO NOTHING;

---------------------------------------------------------------
-- FISH SPECIES
---------------------------------------------------------------

INSERT INTO fish_species
(species_name,scientific_name,carbon_factor)
VALUES
('Rohu','Labeo rohita',1.20),
('Catla','Catla catla',1.10),
('Tilapia','Oreochromis niloticus',1.30),
('Common Carp','Cyprinus carpio',1.15)
ON CONFLICT DO NOTHING;

---------------------------------------------------------------
-- PRAWN SPECIES
---------------------------------------------------------------

INSERT INTO prawn_species
(species_name,scientific_name,carbon_factor)
VALUES
('Black Tiger','Penaeus monodon',1.80),
('Vannamei','Litopenaeus vannamei',2.00)
ON CONFLICT DO NOTHING;

---------------------------------------------------------------
-- UNITS
---------------------------------------------------------------

INSERT INTO units
(unit_name,unit_symbol)
VALUES
('Acre','ac'),
('Hectare','ha'),
('Square Meter','sqm'),
('Kilogram','kg'),
('Ton','t'),
('Number','nos')
ON CONFLICT (unit_name) DO NOTHING;

---------------------------------------------------------------
-- DOCUMENT TYPES
---------------------------------------------------------------

INSERT INTO document_types
(document_name,mandatory)
VALUES
('Aadhaar Card',TRUE),
('PAN Card',TRUE),
('Land Ownership Document',TRUE),
('Survey Sketch',TRUE),
('Geo Tagged Photo',TRUE),
('Plantation Photo',FALSE),
('Aquaculture Photo',FALSE),
('Bank Passbook',FALSE),
('Consent Form',TRUE)
ON CONFLICT (document_name) DO NOTHING;

---------------------------------------------------------------
-- CARBON RATE
---------------------------------------------------------------

INSERT INTO carbon_rate_master
(
credit_type,
rate_per_credit,
effective_from,
is_active
)
VALUES
(
'Standard Carbon Credit',
120.00,
CURRENT_DATE,
TRUE
)
ON CONFLICT DO NOTHING;


---------------------------------------------------------------
-- PERMISSIONS
---------------------------------------------------------------

INSERT INTO permissions(module_name,permission_name)
VALUES

('Users','CREATE'),
('Users','READ'),
('Users','UPDATE'),
('Users','DELETE'),

('Registration','CREATE'),
('Registration','READ'),
('Registration','UPDATE'),
('Registration','DELETE'),

('Land','CREATE'),
('Land','READ'),
('Land','UPDATE'),
('Land','DELETE'),

('Plantation','CREATE'),
('Plantation','READ'),
('Plantation','UPDATE'),
('Plantation','DELETE'),

('Aquaculture','CREATE'),
('Aquaculture','READ'),
('Aquaculture','UPDATE'),
('Aquaculture','DELETE'),

('Carbon','CALCULATE'),
('Carbon','VIEW'),

('Documents','UPLOAD'),
('Documents','VERIFY'),

('Workflow','APPROVE'),

('Reports','VIEW')

ON CONFLICT DO NOTHING;

---------------------------------------------------------------
-- DEFAULT ADMIN USER (admin@datagridz.com / datagridz123)
---------------------------------------------------------------

INSERT INTO users (
    user_id,
    role_id,
    user_type_id,
    username,
    email,
    mobile_number,
    password_hash,
    is_active
) VALUES (
    '11111111-1111-4111-a111-111111111111',
    '5c80088e-4162-4671-9fdb-b89a956cbb4f',
    (SELECT user_type_id FROM user_types WHERE category = 'GOVERNMENT' OR user_type_name = 'Government' LIMIT 1),
    'admin@datagridz.com',
    'admin@datagridz.com',
    '9999999999',
    '$2b$10$h1DPKgmIyP97AShHXhOIi./PO7oji4okaeInlvnklz6TQeV6ih64u',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;



