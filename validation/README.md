# Prescription Validation Module

This module makes the extraction pipeline integration-ready before OCR/LLM credentials are available.

## Included

- Strict Pydantic schema for:
  - `patient_name`
  - `patient_age`
  - `patient_sex`
  - `prescription_date` (`DD-MM-YYYY`)
  - `diagnosis`
  - `medicines[]` with `name`, `dose`, `duration`, `frequency`
- Schema validation rules:
  - Date format and real calendar date checks
  - Future-date rejection
  - Numeric sanity checks (no negative numbers in dose/duration)
  - Frequency normalization (for example `1-0-1 AF` -> `twice daily (after food)`)
  - Duplicate medicine consolidation (`name + dose`)
  - Unknown/unreadable markers converted to `null`
- Metadata schema:
  - `source`, `ocr`, `extraction`, `quality`, `provenance`, `review`, `audit`

## Files

- `prescription_models.py`: Pydantic models + validators + helper functions
- `example_prescription_payload.json`: sample input payload

## Minimal usage

```python
import json
from validation import validate_prescription_record

with open("validation/example_prescription_payload.json", "r", encoding="utf-8") as file:
    payload = json.load(file)

record = validate_prescription_record(payload)
print(record.model_dump())
```

## Dependency

Install Pydantic v2:

```bash
pip install "pydantic>=2,<3"
```
