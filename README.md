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

## Run Locally

### Start Backend Server

Open a terminal inside the `backend` folder and run:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Using a local virtual environment inside `backend` avoids version conflicts with other Python tools installed on your system.

### Start Frontend Server

Open another terminal in the main project folder and run:

```bash
npm install
npm run dev
```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## LLM Extraction Benchmark And Budget

### Active Model Strategy

- Primary: `qwen/qwen3-vl-8b-instruct`
- Fallback for hard handwriting: `qwen/qwen3-vl-235b-a22b-instruct`
- Low-cost internal test path: `nvidia/nemotron-nano-12b-v2-vl:free`

### Estimation Assumptions

- One prescription image per request.
- Strict JSON extraction prompt.
- Missing or unclear fields must return `N/A`.
- Output includes only required extraction fields for review.

### Estimated Token Usage Per Prescription

| Model | Input Tokens | Output Tokens | Total Tokens |
|---|---:|---:|---:|
| `qwen/qwen3-vl-8b-instruct` | 2,400 to 5,400 | 350 to 900 | 2,750 to 6,300 |
| `qwen/qwen3-vl-235b-a22b-instruct` | 2,700 to 6,100 | 400 to 1,000 | 3,100 to 7,100 |
| `nvidia/nemotron-nano-12b-v2-vl:free` | 2,200 to 5,000 | 300 to 800 | 2,500 to 5,800 |

### Qwen 8B Cost Capacity For Current `$9` Credit

Pricing used:

- Input: `$0.08 / 1M tokens`
- Output: `$0.50 / 1M tokens`

| Scenario | Input Tokens | Output Tokens | Cost Per Prescription (USD) | Prescriptions For `$9` |
|---|---:|---:|---:|---:|
| Light document | 2,400 | 350 | 0.000367 | 24,523 |
| Typical document | 3,600 | 600 | 0.000588 | 15,306 |
| Heavy document | 5,400 | 900 | 0.000882 | 10,204 |

### Benchmark Log Format

Use this format for each run:

| run_id | model | file_name | input_tokens | output_tokens | total_tokens | latency_ms | extraction_status | fallback_used |
|---|---|---|---:|---:|---:|---:|---|---|
| `run_2026_03_16_001` | `qwen/qwen3-vl-8b-instruct` | `prescription_3.jpg` | 3,640 | 612 | 4,252 | 7,800 | `success` | `no` |
| `run_2026_03_16_002` | `qwen/qwen3-vl-235b-a22b-instruct` | `prescription_7.jpg` | 4,980 | 844 | 5,824 | 14,200 | `success` | `yes` |

### v0 Budget Guardrail

- Default all uploads to `qwen/qwen3-vl-8b-instruct`.
- Trigger 235B fallback only for low-confidence extraction.
- Record tokens and latency for every prescription to keep spend predictable.
