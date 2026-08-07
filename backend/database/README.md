# CPAY Database

## Overview

The CPAY Database is designed for the Andhra Pradesh Carbon Credit Bank (APCCB) application.

It supports:

- User Management
- Authentication & Authorization (RBAC)
- Registration Management
- Land Details
- Plantation Details
- Aquaculture Details
- Carbon Credit Calculation
- Document Management
- Workflow Management
- Audit Logging
- Reporting

Database Engine:

- PostgreSQL 18+

Schema:

- cpay

---

# Folder Structure

database/

├── schema.sql

├── constraints.sql

├── indexes.sql

├── functions.sql

├── triggers.sql

├── views.sql

├── seed.sql

├── migrations/

└── README.md

---

# Prerequisites

Install PostgreSQL 18 or higher.

Enable extension:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

# Installation Order

Run the SQL files in the following order.

### 1

schema.sql

Creates:

- Schema
- Tables
- Primary Keys
- Foreign Keys

---

### 2

constraints.sql

Creates:

- CHECK Constraints
- UNIQUE Constraints

---

### 3

indexes.sql

Creates:

- Performance Indexes

---

### 4

functions.sql

Creates:

- Database Functions
- Utility Functions

---

### 5

views.sql

Creates:

- Views
- Materialized Views

---

### 6

triggers.sql

Creates:

- Audit Triggers
- Update Triggers

---

### 7

seed.sql

Loads:

- Roles
- Permissions
- Registration Types
- User Types
- Land Types
- Plant Species
- Fish Species
- Prawn Species
- Units
- Carbon Rates
- Document Types

---

# Database Modules

## Authentication

- users
- roles
- permissions
- role_permissions
- user_permissions

---

## Registration

- registration

- individual_details

- organization_details

- government_details

- valuator_details

- address_details

---

## Land

- land_details

- plantation_details

- aquaculture_details

---

## Carbon

- carbon_calculation

---

## Workflow

- workflow_master

- workflow_steps

- workflow_history

- workflow_tasks

- approval_actions

---

## Documents

- uploaded_documents

- document_versions

- document_verification

---

## Audit

- audit_logs

- audit_logs_archive

---

# Materialized Views

- mv_dashboard

- mv_registration_statistics

- mv_carbon_statistics

- mv_district_statistics

Refresh them using:

```sql
SELECT refresh_all_materialized_views();
```

---

# Maintenance

Cleanup OTP

```sql
SELECT cleanup_expired_otps();
```

Archive Audit Logs

```sql
SELECT archive_audit_logs();
```

Database Health

```sql
SELECT * FROM database_health_report();
```

Maintenance

```sql
SELECT perform_database_maintenance();
```

---

# Backup

Export schema only

```bash
pg_dump -s -d cpay > schema_backup.sql
```

Export data

```bash
pg_dump -a -d cpay > data_backup.sql
```

Export complete database

```bash
pg_dump -d cpay > cpay_backup.sql
```

---

# Restore

```bash
psql -d cpay -f cpay_backup.sql
```

---

# Project Version

Database Version

1.0

Schema

cpay

Database

PostgreSQL

Author

APCCB Development Team
