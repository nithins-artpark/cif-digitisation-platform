import { Box, Container } from "@mui/material";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import UploadPage from "./pages/UploadPage/UploadPage";
import ProcessingPage from "./pages/ProcessingPage/ProcessingPage";
import CaseReviewPage from "./pages/CaseReviewPage/CaseReviewPage";
import Reports from "./pages/Reports/Reports";

function App() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box key={location.pathname} className="page-fade">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/case-review" element={<CaseReviewPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
