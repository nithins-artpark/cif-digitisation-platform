import { createContext, useContext, useMemo, useState } from "react";
import { extractedCaseData, extractedStatus } from "../data/mockData";

const CifContext = createContext(null);

export function CifProvider({ children }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caseData, setCaseData] = useState(extractedCaseData);
  const [fieldStatus, setFieldStatus] = useState(extractedStatus);
  const [recordStatus, setRecordStatus] = useState("System Extracted");

  const value = useMemo(
    () => ({
      uploadedFile,
      setUploadedFile,
      previewUrl,
      setPreviewUrl,
      caseData,
      setCaseData,
      fieldStatus,
      setFieldStatus,
      recordStatus,
      setRecordStatus,
    }),
    [uploadedFile, previewUrl, caseData, fieldStatus, recordStatus]
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
