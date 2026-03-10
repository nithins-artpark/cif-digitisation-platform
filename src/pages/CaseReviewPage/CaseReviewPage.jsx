import { Alert, Box, Button, Grid, Snackbar, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CaseCard from "../../components/CaseCard/CaseCard";
import CaseTable from "../../components/CaseTable/CaseTable";
import DocumentCompare from "../../components/DocumentCompare/DocumentCompare";
import ValidationRules from "../../components/ValidationRules/ValidationRules";
import { useCif } from "../../context/CifContext";

function isValidDdmmyyyy(value) {
  const pattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = value.match(pattern);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isDateNotFuture(value) {
  if (!isValidDdmmyyyy(value)) return false;
  const [day, month, year] = value.split("-").map(Number);
  const selected = new Date(year, month - 1, day);
  const now = new Date();
  selected.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return selected <= now;
}

function CaseReviewPage() {
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const {
    uploadedFile,
    previewUrl,
    caseData,
    setCaseData,
    fieldStatus,
    setFieldStatus,
    recordStatus,
    setRecordStatus,
  } = useCif();

  const rows = useMemo(
    () => [
      { key: "patientName", label: "Patient Name", value: caseData.patientName, status: fieldStatus.patientName },
      { key: "age", label: "Age", value: caseData.age, status: fieldStatus.age },
      { key: "department", label: "Department", value: caseData.department, status: fieldStatus.department },
      { key: "date", label: "Date", value: caseData.date, status: fieldStatus.date },
      { key: "symptoms", label: "Symptoms", value: caseData.symptoms, status: fieldStatus.symptoms },
      { key: "diagnosis", label: "Diagnosis", value: caseData.diagnosis, status: fieldStatus.diagnosis },
      {
        key: "medicines",
        label: "Prescribed Medicines",
        value: caseData.medicines,
        status: fieldStatus.medicines,
        multiline: true,
      },
    ],
    [caseData, fieldStatus]
  );

  const validationRules = useMemo(() => {
    const requiredKeys = ["patientName", "age", "department", "date", "symptoms", "diagnosis", "medicines"];
    const missingFields = requiredKeys.filter((key) => !String(caseData[key] || "").trim());
    const ageNumber = Number(caseData.age);
    const medicineLines = String(caseData.medicines || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const hasDoseInfo = medicineLines.some((item) => /\b\d+\s?(mg|ml|mcg)\b/i.test(item));
    const verifiedCount = Object.values(fieldStatus).filter((status) => status === "Verified").length;

    return [
      {
        id: "required-fields",
        title: "Required Field Completeness",
        status: missingFields.length === 0 ? "pass" : "error",
        message:
          missingFields.length === 0
            ? "All required CIF fields are present."
            : `Missing values: ${missingFields.join(", ")}.`,
      },
      {
        id: "age-validation",
        title: "Age Range Validation",
        status: Number.isFinite(ageNumber) && ageNumber >= 0 && ageNumber <= 120 ? "pass" : "error",
        message:
          Number.isFinite(ageNumber) && ageNumber >= 0 && ageNumber <= 120
            ? "Age format and range look valid."
            : "Age must be a number between 0 and 120.",
      },
      {
        id: "date-validation",
        title: "Case Date Validation",
        status: isDateNotFuture(caseData.date) ? "pass" : "error",
        message: isDateNotFuture(caseData.date)
          ? "Date format is valid and not in the future."
          : "Date must be in DD-MM-YYYY format and not be future dated.",
      },
      {
        id: "medicine-check",
        title: "Medicine Extraction Quality",
        status: medicineLines.length >= 2 && hasDoseInfo ? "pass" : "warning",
        message:
          medicineLines.length >= 2 && hasDoseInfo
            ? "Medicine list includes multiple entries with dosage markers."
            : "Review medicines manually. Dosage/frequency may be incomplete.",
      },
      {
        id: "verification-readiness",
        title: "Verification Readiness",
        status: verifiedCount >= 5 ? "pass" : "warning",
        message:
          verifiedCount >= 5
            ? `${verifiedCount} fields are already marked as verified.`
            : `Only ${verifiedCount} fields are verified. Review before final approval.`,
      },
    ];
  }, [caseData, fieldStatus]);

  const handleChange = (key, value) => {
    setCaseData((prev) => ({ ...prev, [key]: value }));
    setFieldStatus((prev) => ({ ...prev, [key]: "Review Required" }));
    setRecordStatus("Review Required");
  };

  const handleMarkVerified = () => {
    setFieldStatus((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = "Verified";
      });
      return updated;
    });
    setRecordStatus("Verified");
  };

  const handleSave = () => {
    setToastOpen(true);
    setRecordStatus("Verified");
    setTimeout(() => navigate("/dashboard"), 1800);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Case Data Review</Typography>
        <Typography color="text.secondary">Review, edit and verify extracted CIF fields.</Typography>
      </Box>

      <DocumentCompare
        uploadedFile={uploadedFile}
        previewUrl={previewUrl}
        caseData={caseData}
        fieldStatus={fieldStatus}
      />

      <ValidationRules rules={validationRules} />

      <CaseTable rows={rows} onValueChange={handleChange} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button variant="contained" onClick={handleSave} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Save Record
        </Button>
        <Button variant="outlined" onClick={handleMarkVerified} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Mark Verified
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <CaseCard caseData={caseData} recordStatus={recordStatus} />
        </Grid>
      </Grid>

      <Snackbar
        open={toastOpen}
        autoHideDuration={1500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          <Typography variant="body2">Case Record Successfully Digitised</Typography>
          <Typography variant="body2">Record ID: CIF-00021</Typography>
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default CaseReviewPage;
