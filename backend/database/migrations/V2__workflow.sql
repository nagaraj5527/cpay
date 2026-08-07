/*==============================================================
V2__workflow.sql
Workflow Module
==============================================================*/

SET search_path TO cpay;

------------------------------------------------------------
-- Workflow Master
------------------------------------------------------------

INSERT INTO workflow_master
(
workflow_name,
description,
is_active
)
VALUES
(
'Carbon Credit Approval',
'Default Approval Workflow',
TRUE
)
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- Workflow Steps
------------------------------------------------------------

INSERT INTO workflow_steps
(
workflow_id,
step_order,
step_name,
assigned_role
)

SELECT

workflow_id,

1,

'Registration',

'Citizen'

FROM workflow_master

WHERE workflow_name='Carbon Credit Approval';

INSERT INTO workflow_steps
(
workflow_id,
step_order,
step_name,
assigned_role
)

SELECT

workflow_id,

2,

'Document Verification',

'Verifier'

FROM workflow_master

WHERE workflow_name='Carbon Credit Approval';

INSERT INTO workflow_steps
(
workflow_id,
step_order,
step_name,
assigned_role
)

SELECT

workflow_id,

3,

'Field Inspection',

'Field Officer'

FROM workflow_master

WHERE workflow_name='Carbon Credit Approval';

INSERT INTO workflow_steps
(
workflow_id,
step_order,
step_name,
assigned_role
)

SELECT

workflow_id,

4,

'Manager Approval',

'Manager'

FROM workflow_master

WHERE workflow_name='Carbon Credit Approval';

INSERT INTO workflow_steps
(
workflow_id,
step_order,
step_name,
assigned_role
)

SELECT

workflow_id,

5,

'Carbon Credit Generation',

'Administrator'

FROM workflow_master

WHERE workflow_name='Carbon Credit Approval';