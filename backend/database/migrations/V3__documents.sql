/*==============================================================
V3__documents.sql
Document Module
==============================================================*/

SET search_path TO cpay;

------------------------------------------------------------
-- Document Types
------------------------------------------------------------

INSERT INTO document_types
(document_name,mandatory)

VALUES

('Aadhaar Card',TRUE),

('PAN Card',TRUE),

('Survey Document',TRUE),

('Ownership Certificate',TRUE),

('Geo Tagged Photograph',TRUE),

('Plantation Photograph',FALSE),

('Aquaculture Photograph',FALSE),

('Consent Form',TRUE),

('Bank Passbook',FALSE)

ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- Default Carbon Rate
------------------------------------------------------------

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
1000,
CURRENT_DATE,
TRUE
)

ON CONFLICT DO NOTHING;