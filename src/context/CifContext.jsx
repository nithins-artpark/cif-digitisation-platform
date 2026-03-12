import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { extractedCaseData, extractedStatus } from "../data/mockData";

const CifContext = createContext(null);
const UPLOAD_HISTORY_STORAGE_KEY = "demoUploadHistory";

function loadStoredUploadHistory() {
  try {
    const storedHistory = sessionStorage.getItem(UPLOAD_HISTORY_STORAGE_KEY);
    if (!storedHistory) return [];
    const parsed = JSON.parse(storedHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function CifProvider({ children }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState(loadStoredUploadHistory);
  const [caseData, setCaseData] = useState(extractedCaseData);
  const [fieldStatus, setFieldStatus] = useState(extractedStatus);
  const [recordStatus, setRecordStatus] = useState("System Extracted");

  useEffect(() => {
    sessionStorage.setItem(UPLOAD_HISTORY_STORAGE_KEY, JSON.stringify(uploadedDocuments));
  }, [uploadedDocuments]);

  const addUploadedDocument = useCallback((file, uploadedByRole) => {
    if (!file) return;
    const metadata = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: file.name,
      fileType: file.type || "unknown",
      fileSize: Number(file.size) || 0,
      uploadedAt: new Date().toISOString(),
      uploadedByRole: uploadedByRole || "unknown",
    };
    setUploadedDocuments((previous) => [metadata, ...previous]);
  }, []);

  const clearUploadedDocuments = useCallback(() => {
    setUploadedDocuments([]);
  }, []);

  const value = useMemo(
    () => ({
      uploadedFile,
      setUploadedFile,
      previewUrl,
      setPreviewUrl,
      uploadedDocuments,
      addUploadedDocument,
      clearUploadedDocuments,
      caseData,
      setCaseData,
      fieldStatus,
      setFieldStatus,
      recordStatus,
      setRecordStatus,
    }),
    [
      uploadedFile,
      previewUrl,
      uploadedDocuments,
      addUploadedDocument,
      clearUploadedDocuments,
      caseData,
      fieldStatus,
      recordStatus,
    ]
  );

  return <CifContext.Provider value={value}>{children}</CifContext.Provider>;
}

export function useCif() {
  const context = useContext(CifContext);
  if (!context) {
    throw new Error("useCif must be used within CifProvider");
  }
  return context;
}
