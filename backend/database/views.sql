/*==============================================================
 CPAY DATABASE VIEWS
==============================================================*/

SET search_path TO cpay;

---------------------------------------------------------------
-- REGISTRATION SUMMARY
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_registration_summary AS
SELECT
    r.registration_id,
    r.application_number,
    r.application_status,
    rt.registration_type_name,
    u.username,
    i.full_name,
    i.mobile_number,
    i.email,
    r.created_at,
    r.submitted_at
FROM registration r
LEFT JOIN registration_types rt
       ON r.registration_type_id = rt.registration_type_id
LEFT JOIN users u
       ON r.user_id = u.user_id
LEFT JOIN individual_details i
       ON r.user_id = i.user_id;

---------------------------------------------------------------
-- LAND SUMMARY
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_land_summary AS
SELECT

    l.land_id,

    l.registration_id,

    l.survey_number,

    l.sub_division_number,

    lt.land_type_name,

    l.total_area,

    l.cultivated_area,

    l.uncultivated_area

FROM land_details l

LEFT JOIN land_types lt

ON l.land_type_id=lt.land_type_id;

---------------------------------------------------------------
-- PLANTATION SUMMARY
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_plantation_summary AS
SELECT

    p.plantation_id,

    p.land_id,

    pc.category_name,

    ps.common_name,

    p.number_of_plants,

    p.plantation_area,

    p.estimated_biomass

FROM plantation_details p

LEFT JOIN plantation_categories pc

ON p.plantation_category_id=pc.plantation_category_id

LEFT JOIN plant_species ps

ON p.plant_species_id=ps.plant_species_id;

---------------------------------------------------------------
-- AQUACULTURE SUMMARY
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_aquaculture_summary AS
SELECT

    a.aquaculture_id,

    a.land_id,

    a.aquaculture_type,

    fs.species_name AS fish_species,

    pr.species_name AS prawn_species,

    a.stock_quantity,

    a.annual_production,

    a.net_biomass_gain

FROM aquaculture_details a

LEFT JOIN fish_species fs

ON a.fish_species_id=fs.fish_species_id

LEFT JOIN prawn_species pr

ON a.prawn_species_id=pr.prawn_species_id;

---------------------------------------------------------------
-- CARBON SUMMARY
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_carbon_summary AS
SELECT

    c.registration_id,

    r.application_number,

    c.plantation_carbon,

    c.aquaculture_carbon,

    c.total_carbon,

    c.carbon_credits,

    c.market_rate,

    c.market_value,

    c.calculated_at

FROM carbon_calculation c

JOIN registration r

ON c.registration_id=r.registration_id;

---------------------------------------------------------------
-- DASHBOARD VIEW
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_dashboard AS
SELECT

    r.registration_id,

    r.application_number,

    i.full_name,

    r.application_status,

    c.total_carbon,

    c.carbon_credits,

    c.market_value,

    r.created_at

FROM registration r

LEFT JOIN individual_details i

ON r.user_id=i.user_id

LEFT JOIN carbon_calculation c

ON r.registration_id=c.registration_id;

---------------------------------------------------------------
-- PENDING APPROVALS
---------------------------------------------------------------

CREATE OR REPLACE VIEW vw_pending_approvals AS
SELECT

    registration_id,

    application_number,

    application_status,

    submitted_at

FROM registration

WHERE application_status
IN
(
'PENDING',
'UNDER_REVIEW',
'VERIFICATION_PENDING'
);



/*==============================================================
 MATERIALIZED VIEWS
==============================================================*/

---------------------------------------------------------------
-- DASHBOARD
---------------------------------------------------------------

CREATE MATERIALIZED VIEW mv_dashboard AS

SELECT *

FROM vw_dashboard;

---------------------------------------------------------------
-- REGISTRATION STATISTICS
---------------------------------------------------------------

CREATE MATERIALIZED VIEW mv_registration_statistics AS

SELECT

application_status,

COUNT(*) total_applications

FROM registration

GROUP BY application_status;

---------------------------------------------------------------
-- CARBON STATISTICS
---------------------------------------------------------------

CREATE MATERIALIZED VIEW mv_carbon_statistics AS

SELECT

COUNT(*) total_projects,

SUM(total_carbon) total_carbon,

SUM(carbon_credits) total_credits,

SUM(market_value) total_market_value

FROM carbon_calculation;

---------------------------------------------------------------
-- DISTRICT STATISTICS
---------------------------------------------------------------

CREATE MATERIALIZED VIEW mv_district_statistics AS

SELECT

d.district_name,

COUNT(DISTINCT r.registration_id) total_registrations,

SUM(l.total_area) total_area

FROM registration r

JOIN address_details a

ON r.registration_id=a.registration_id

JOIN districts d

ON a.district_id=d.district_id

LEFT JOIN land_details l

ON r.registration_id=l.registration_id

GROUP BY d.district_name;
