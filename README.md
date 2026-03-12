# CIF Digitisation Platform

## Project Overview

The CIF Digitisation Platform is a role-based web application for converting paper Case Investigation Files (CIF) into structured digital records.

It supports district health operations by:

- capturing CIF uploads from field teams,
- guiding records through a processing pipeline,
- enabling case-data review and correction, and
- presenting case analytics for monitoring and decision-making.

The current demo workflow is aligned to district-level operations, with Gadchiroli shown as the active operational context.

## User Journey

### 1. Entry and Role Selection

Users land on the home page and choose a role:

- Front Line Worker
- Medical Officer
- Admin (User Analytics)

Role selection controls which modules each user can access.

### 2. Front Line Worker Journey

1. Open **Upload CIF** (`/upload`) and submit a case document.
2. Move to **Processing** (`/processing`) to follow ingestion and extraction stages.
3. Open **Case Records** (`/case-review`) to verify and edit extracted values.
4. Finalize the reviewed case for downstream monitoring.

### 3. Medical Officer Journey

1. Log in to **Dashboard** (`/dashboard`).
2. Monitor case volume, status mix, and regional performance.
3. Use visual summaries (including the India map view) to identify trends and review priorities.

### 4. Admin / User Analytics Journey

1. Access **Dashboard** for system-wide metrics.
2. Use **Upload CIF**, **Processing**, and **Case Records** for operational checks.
3. Open **Reports** (`/reports`) for reporting workflows.

### 5. Continuous Operational Cycle

The platform is designed as a loop:

Upload -> Process -> Review -> Monitor -> Improve data quality in the next upload cycle.
