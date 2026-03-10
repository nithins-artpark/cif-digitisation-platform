# CIF (Case Investigation Files) Digitisation System

React + Vite application demonstrating a government-style health case digitisation workflow:

Upload CIF Document -> Processing Timeline -> Case Data Review -> Record Creation -> Dashboard Analytics -> Regional Trend Analysis with India Map

## Tech Stack

- React (Vite)
- React Router
- Material UI
- Recharts
- React Simple Maps

## Prescription Validation (Pre-OCR/LLM Ready)

A standalone Pydantic validation module is included in [`validation/`](./validation) so extraction contracts can be finalized before OCR/LLM integration.

- Strict schema for prescription fields and medicine list
- Date, numeric sanity, frequency normalization, duplicate medicine consolidation
- Metadata schema for source, OCR, extraction, quality, provenance, review, and audit
- Example payload: [`validation/example_prescription_payload.json`](./validation/example_prescription_payload.json)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

## Main Routes

- `/upload` - Upload CIF document and start processing
- `/processing` - Sequential processing timeline simulation
- `/case-review` - Editable extracted data table and verification
- `/dashboard` - Case analytics, regional trends, and India map
- `/reports` - Reports module placeholder

## Deploy on Netlify

This project is pre-configured for Netlify with:

- `netlify.toml` for build settings
- `public/_redirects` for React Router SPA routing

### Option A: Deploy via Netlify UI (recommended)

1. Push this project to GitHub.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select your GitHub repo.
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**.
6. After deploy completes, copy the generated Netlify URL and share it with your team lead.

### Option B: Manual deploy using `dist`

1. Run:

```bash
npm run build
```

2. In Netlify, go to **Sites** and drag-drop the `dist` folder to deploy.
