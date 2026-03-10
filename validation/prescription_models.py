from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    conint,
    confloat,
    field_validator,
    model_validator,
)

NULL_MARKERS = {"", "unknown", "unreadable", "illegible", "na", "n/a", "not available", "--", "-"}


def _to_none_for_unknown(value: str | None) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    if cleaned.lower() in NULL_MARKERS:
        return None
    return cleaned


def _assert_no_negative_numeric(value: str | None, field_name: str) -> None:
    if value is None:
        return
    for match in re.finditer(r"-?\d+(?:\.\d+)?", value):
        if float(match.group()) < 0:
            raise ValueError(f"{field_name} cannot contain negative numeric values")


def normalize_frequency(value: str | None) -> str | None:
    if value is None:
        return None

    text = value.lower().strip()
    text = re.sub(r"\s+", " ", text)

    meal_hint = ""
    if re.search(r"\b(after food|af)\b", text):
        meal_hint = " (after food)"
    elif re.search(r"\b(before food|bf)\b", text):
        meal_hint = " (before food)"

    if re.search(r"\b(sos|prn|as needed)\b", text):
        return "as needed" + meal_hint
    if re.search(r"\b(hs|at bedtime)\b", text):
        return "once daily (at bedtime)"
    if re.search(r"\b(qid|four times|4 times|1-1-1-1)\b", text):
        return "four times daily" + meal_hint
    if re.search(r"\b(tds|tid|thrice|three times|1-1-1)\b", text):
        return "thrice daily" + meal_hint
    if re.search(r"\b(bd|bid|twice|2 times|1-0-1)\b", text):
        return "twice daily" + meal_hint
    if re.search(r"\b(od|once|1 time|0-0-1|1-0-0|0-1-0)\b", text):
        return "once daily" + meal_hint
    return value.strip()


class Medicine(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str | None = Field(default=None)
    dose: str | None = Field(default=None)
    duration: str | None = Field(default=None)
    frequency: str | None = Field(default=None)

    @field_validator("name", "dose", "duration", "frequency", mode="before")
    @classmethod
    def normalize_null_markers(cls, value: str | None) -> str | None:
        return _to_none_for_unknown(value)

    @model_validator(mode="after")
    def apply_medicine_validations(self) -> "Medicine":
        if not any([self.name, self.dose, self.duration, self.frequency]):
            raise ValueError("medicine row is empty")

        _assert_no_negative_numeric(self.dose, "dose")
        _assert_no_negative_numeric(self.duration, "duration")
        self.frequency = normalize_frequency(self.frequency)
        return self


class PrescriptionData(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    patient_name: str | None = Field(default=None)
    patient_age: conint(ge=0, le=120) | None = Field(default=None)
    patient_sex: Literal["male", "female", "other", "unknown"] | None = Field(default=None)
    prescription_date: str | None = Field(default=None, description="Format: DD-MM-YYYY")
    diagnosis: str | None = Field(default=None)
    medicines: list[Medicine] = Field(min_length=1)

    @field_validator("patient_name", "prescription_date", "diagnosis", mode="before")
    @classmethod
    def normalize_top_level_null_markers(cls, value: str | None) -> str | None:
        return _to_none_for_unknown(value)

    @field_validator("prescription_date")
    @classmethod
    def validate_prescription_date_format(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not re.fullmatch(r"\d{2}-\d{2}-\d{4}", value):
            raise ValueError("prescription_date must be in DD-MM-YYYY format (e.g. 01-01-2025)")
        try:
            parsed_date = datetime.strptime(value, "%d-%m-%Y").date()
        except ValueError as exc:
            raise ValueError("prescription_date is not a valid calendar date") from exc

        if parsed_date > datetime.now().date():
            raise ValueError("prescription_date cannot be in the future")
        return value

    @model_validator(mode="after")
    def consolidate_duplicate_medicines(self) -> "PrescriptionData":
        consolidated: dict[tuple[str, str], Medicine] = {}
        output: list[Medicine] = []

        for item in self.medicines:
            name_key = (item.name or "").strip().lower()
            dose_key = (item.dose or "").strip().lower()
            key = (name_key, dose_key)

            if key == ("", ""):
                output.append(item)
                continue

            if key not in consolidated:
                consolidated[key] = item
                output.append(item)
                continue

            existing = consolidated[key]
            existing.duration = existing.duration or item.duration
            existing.frequency = existing.frequency or item.frequency

        if not any(medicine.name for medicine in output):
            raise ValueError("at least one medicine with a readable name is required")

        self.medicines = output
        return self


class SourceMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    file_name: str
    file_hash: str
    mime_type: str
    page_count: conint(ge=1)
    upload_time: datetime


class PageConfidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page_number: conint(ge=1)
    confidence: confloat(ge=0.0, le=1.0)


class OCRMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    engine_name: str
    engine_version: str
    language_detected: list[str] = Field(min_length=1)
    per_page_ocr_confidence: list[PageConfidence] = Field(min_length=1)


class ExtractionMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    model_provider: str
    model_version: str
    prompt_version: str
    schema_version: str
    run_id: str


class QualityMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    per_field_confidence: dict[str, confloat(ge=0.0, le=1.0)]
    record_confidence: confloat(ge=0.0, le=1.0)
    failed_validation_rules: list[str] = Field(default_factory=list)


class ProvenanceItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: str
    page_number: conint(ge=1)
    bbox: list[float] | None = Field(
        default=None, description="Bounding box as [x1, y1, x2, y2]"
    )
    text_span: str | None = Field(default=None)

    @field_validator("bbox")
    @classmethod
    def validate_bbox_shape(cls, value: list[float] | None) -> list[float] | None:
        if value is None:
            return None
        if len(value) != 4:
            raise ValueError("bbox must have exactly 4 values: [x1, y1, x2, y2]")
        return value


class EditedField(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: str
    old_value: str | None = None
    new_value: str | None = None


class ReviewMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    edited_fields: list[EditedField] = Field(default_factory=list)
    reviewer_id: str | None = None
    reviewer_role: str | None = None
    verified_time: datetime | None = None


class AuditMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    created_at: datetime
    updated_at: datetime
    app_version: str
    environment: Literal["local", "dev", "staging", "production"]


class Metadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: SourceMetadata
    ocr: OCRMetadata
    extraction: ExtractionMetadata
    quality: QualityMetadata
    provenance: list[ProvenanceItem] = Field(default_factory=list)
    review: ReviewMetadata
    audit: AuditMetadata


class PrescriptionExtractionRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str
    extracted_data: PrescriptionData
    metadata: Metadata


def validate_prescription_record(payload: dict) -> PrescriptionExtractionRecord:
    return PrescriptionExtractionRecord.model_validate(payload)


def generate_json_schema() -> dict:
    return PrescriptionExtractionRecord.model_json_schema()


if __name__ == "__main__":
    sample_payload = {
        "schema_version": "prescription.v1",
        "extracted_data": {
            "patient_name": "Suresh Patil",
            "patient_age": 47,
            "patient_sex": "male",
            "prescription_date": "10-03-2026",
            "diagnosis": "Acute upper respiratory infection",
            "medicines": [
                {
                    "name": "Paracetamol",
                    "dose": "650 mg",
                    "duration": "5 days",
                    "frequency": "1-0-1 AF",
                },
                {
                    "name": "Paracetamol",
                    "dose": "650 mg",
                    "duration": "5 days",
                    "frequency": "twice daily after food",
                },
                {
                    "name": "Azithromycin",
                    "dose": "unreadable",
                    "duration": "3 days",
                    "frequency": "OD after food",
                },
            ],
        },
        "metadata": {
            "source": {
                "file_name": "prescription_001.jpg",
                "file_hash": "sha256:abc123",
                "mime_type": "image/jpeg",
                "page_count": 1,
                "upload_time": "2026-03-10T18:45:02+05:30",
            },
            "ocr": {
                "engine_name": "tesseract",
                "engine_version": "5.4.0",
                "language_detected": ["en", "mr"],
                "per_page_ocr_confidence": [{"page_number": 1, "confidence": 0.89}],
            },
            "extraction": {
                "model_provider": "openrouter",
                "model_version": "provider/model-name",
                "prompt_version": "prompt_rx_v1",
                "schema_version": "prescription.v1",
                "run_id": "rx_20260310_001",
            },
            "quality": {
                "per_field_confidence": {
                    "patient_name": 0.96,
                    "patient_age": 0.93,
                    "patient_sex": 0.91,
                    "prescription_date": 0.95,
                    "diagnosis": 0.84,
                    "medicines[0].name": 0.97,
                    "medicines[0].dose": 0.95,
                    "medicines[0].duration": 0.93,
                    "medicines[0].frequency": 0.9,
                    "medicines[1].name": 0.88,
                    "medicines[1].dose": 0.41,
                    "medicines[1].duration": 0.87,
                    "medicines[1].frequency": 0.86,
                },
                "record_confidence": 0.86,
                "failed_validation_rules": [],
            },
            "provenance": [
                {
                    "field": "patient_name",
                    "page_number": 1,
                    "bbox": [122, 205, 544, 246],
                    "text_span": "Name: Suresh Patil",
                }
            ],
            "review": {
                "edited_fields": [],
                "reviewer_id": None,
                "reviewer_role": None,
                "verified_time": None,
            },
            "audit": {
                "created_at": "2026-03-10T18:45:12+05:30",
                "updated_at": "2026-03-10T18:49:30+05:30",
                "app_version": "1.3.0",
                "environment": "dev",
            },
        },
    }

    try:
        record = validate_prescription_record(sample_payload)
        print(record.model_dump_json(indent=2))
    except ValidationError as exc:
        print(exc)
