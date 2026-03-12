import { Box, Container } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { getRoleHome, isRouteAllowed } from "./config/roleAccess";
import Dashboard from "./pages/Dashboard/Dashboard";
import UploadPage from "./pages/UploadPage/UploadPage";
import ProcessingPage from "./pages/ProcessingPage/ProcessingPage";
import CaseReviewPage from "./pages/CaseReviewPage/CaseReviewPage";
import Reports from "./pages/Reports/Reports";
import LandingPage from "./pages/LandingPage/LandingPage";

function RoleGuard({ activeRole, routePath, children }) {
  if (!activeRole) {
    return <Navigate to="/" replace />;
  }

  if (!isRouteAllowed(activeRole, routePath)) {
    return <Navigate to={getRoleHome(activeRole)} replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const [activeRole, setActiveRole] = useState(() => sessionStorage.getItem("demoRole") || "");
  const isLandingPage = location.pathname === "/";
  const roleHome = useMemo(() => getRoleHome(activeRole), [activeRole]);

  useEffect(() => {
    if (!activeRole) {
      sessionStorage.removeItem("demoRole");
      return;
    }
    sessionStorage.setItem("demoRole", activeRole);
  }, [activeRole]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {!isLandingPage && <Navbar activeRole={activeRole} onRoleReset={() => setActiveRole("")} />}
      <Container
        maxWidth="xl"
        sx={{
          py: isLandingPage ? { xs: 0.5, md: 1 } : { xs: 2, md: 3 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box key={location.pathname} className="page-fade">
          <Routes>
            <Route path="/" element={<LandingPage onRoleSelect={setActiveRole} />} />
            <Route
              path="/dashboard"
              element={
                <RoleGuard activeRole={activeRole} routePath="/dashboard">
                  <Dashboard activeRole={activeRole} />
                </RoleGuard>
              }
            />
            <Route
              path="/upload"
              element={
                <RoleGuard activeRole={activeRole} routePath="/upload">
                  <UploadPage activeRole={activeRole} />
                </RoleGuard>
              }
            />
            <Route
              path="/processing"
              element={
                <RoleGuard activeRole={activeRole} routePath="/processing">
                  <ProcessingPage activeRole={activeRole} />
                </RoleGuard>
              }
            />
            <Route
              path="/case-review"
              element={
                <RoleGuard activeRole={activeRole} routePath="/case-review">
                  <CaseReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleGuard activeRole={activeRole} routePath="/reports">
                  <Reports />
                </RoleGuard>
              }
            />
            <Route path="*" element={<Navigate to={activeRole ? roleHome : "/"} replace />} />
          </Routes>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
