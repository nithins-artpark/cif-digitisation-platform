import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import { Box, Card, CardContent, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import ProcessingTimeline from "../../components/ProcessingTimeline/ProcessingTimeline";
import { useCif } from "../../context/CifContext";
import { DEMO_ROLES } from "../../config/roleAccess";

const STEP_CONFIG = [
  {
    label: "Document Received",
    durationMs: 1600,
    note: "Validating file integrity and metadata",
    doneLog: "Source document accepted by ingestion service",
  },
  {
    label: "Image Pre-processing",
    durationMs: 2400,
    note: "Deskewing, denoising and contrast enhancement",
    doneLog: "Image quality normalized for OCR",
  },
  {
    label: "Text Detection",
    durationMs: 3000,
    note: "Running OCR model and detecting text regions",
    doneLog: "Detected handwritten and printed text blocks",
  },
  {
    label: "Field Extraction",
    durationMs: 2200,
    note: "Mapping detected text to CIF structured fields",
    doneLog: "Mapped patient and clinical fields with confidence scoring",
  },
  {
    label: "Structured Record Generation",
    durationMs: 1700,
    note: "Generating CIF record and preparing review draft",
    doneLog: "Draft record generated and queued for verification",
  },
];

function formatSeconds(totalMs) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ProcessingPage({ activeRole = "" }) {
  const navigate = useNavigate();
  const { uploadedFile } = useCif();
  const isFrontLineWorker = activeRole === DEMO_ROLES.FRONT_LINE_WORKER;
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(Array(STEP_CONFIG.length).fill(false));
  const [stepProgress, setStepProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [etaMs, setEtaMs] = useState(STEP_CONFIG.reduce((sum, step) => sum + step.durationMs, 0));
  const [processingLog, setProcessingLog] = useState([]);
  const [currentNote, setCurrentNote] = useState(STEP_CONFIG[0].note);

  const intervalRef = useRef(null);
  const navTimeoutRef = useRef(null);
  const runIdRef = useRef(0);
  const processStateRef = useRef({
    currentStep: 0,
    stepStartMs: 0,
    flowStartMs: 0,
    completedRef: Array(STEP_CONFIG.length).fill(false),
  });

  useEffect(() => {
    if (!uploadedFile) {
      navigate("/upload", { replace: true });
      return undefined;
    }

    const now = Date.now();
    runIdRef.current += 1;
    const runId = runIdRef.current;

    processStateRef.current = {
      currentStep: 0,
      stepStartMs: now,
      flowStartMs: now,
      completedRef: Array(STEP_CONFIG.length).fill(false),
    };
    setProcessingLog([`[${new Date(now).toLocaleTimeString()}] Job started for ${uploadedFile.name}`]);
    setActiveStep(0);
    setCompleted(Array(STEP_CONFIG.length).fill(false));
    setStepProgress(0);
    setProgress(0);
    setCurrentNote(STEP_CONFIG[0].note);

    intervalRef.current = setInterval(() => {
      if (runIdRef.current !== runId) return;

      const tickNow = Date.now();
      const state = processStateRef.current;
      const step = STEP_CONFIG[state.currentStep];
      const stepElapsed = tickNow - state.stepStartMs;
      const localStepProgress = Math.min(100, Math.round((stepElapsed / step.durationMs) * 100));
      const completedPortion = state.currentStep / STEP_CONFIG.length;
      const runningPortion = (localStepProgress / 100) * (1 / STEP_CONFIG.length);
      const overallProgress = Math.min(100, Math.round((completedPortion + runningPortion) * 100));

      setActiveStep(state.currentStep);
      setStepProgress(localStepProgress);
      setProgress(overallProgress);
      setElapsedMs(tickNow - state.flowStartMs);

      const remainingCurrent = Math.max(step.durationMs - stepElapsed, 0);
      const futureMs = STEP_CONFIG.slice(state.currentStep + 1).reduce(
        (sum, stepItem) => sum + stepItem.durationMs,
        0
      );
      setEtaMs(remainingCurrent + futureMs);

      if (localStepProgress < 100) {
        return;
      }

      const nextCompleted = [...state.completedRef];
      nextCompleted[state.currentStep] = true;
      state.completedRef = nextCompleted;
      setCompleted(nextCompleted);
      setProcessingLog((prev) => [
        ...prev,
        `[${new Date(tickNow).toLocaleTimeString()}] ${step.doneLog}`,
      ]);

      if (state.currentStep === STEP_CONFIG.length - 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStepProgress(100);
        setProgress(100);
        setCurrentNote("Final validation completed");
        navTimeoutRef.current = setTimeout(() => navigate("/case-review"), 1500);
        return;
      }

      state.currentStep += 1;
      state.stepStartMs = tickNow;
      setCurrentNote(STEP_CONFIG[state.currentStep].note);
    }, 120);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
    };
  }, [navigate, uploadedFile]);

  return (
    <Stack spacing={3}>
      <Box>
        <BackButton fallbackPath="/upload" />
        <Typography variant="h5">Document Processing Screen</Typography>
        <Typography color="text.secondary">
          {isFrontLineWorker
            ? "Processing uploaded document for case extraction."
            : "Simulating OCR and case extraction workflow stages."}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            mb={1}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Processing Progress
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip icon={<InsertDriveFileRoundedIcon />} label={uploadedFile?.name || "No file"} size="small" />
              <Chip label={`Elapsed: ${formatSeconds(elapsedMs)}`} size="small" />
              <Chip label={`ETA: ${formatSeconds(etaMs)}`} color="primary" size="small" />
            </Stack>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, height: 8, borderRadius: 10 }} />
          <Typography variant="body2" color="text.secondary" mb={2}>
            {currentNote} ({progress}% complete)
          </Typography>
          {!isFrontLineWorker && (
            <>
              <Divider sx={{ mb: 2 }} />
              <ProcessingTimeline
                steps={STEP_CONFIG.map((step) => step.label)}
                activeStep={activeStep}
                completed={completed}
                stepProgress={stepProgress}
                currentNote={currentNote}
              />
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: "#f6f8fb",
                  border: "1px solid #d8e0ea",
                  borderRadius: 1,
                  maxHeight: 140,
                  overflowY: "auto",
                }}
              >
                <Typography variant="body2" fontWeight={700} mb={0.8}>
                  Live Processor Log
                </Typography>
                <Stack spacing={0.5}>
                  {processingLog.slice(-5).map((item, index) => (
                    <Typography variant="caption" color="text.secondary" key={`${item}-${index}`}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ProcessingPage;
