import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DEMO_ROLES } from "../../config/roleAccess";

const roleCards = [
  {
    role: DEMO_ROLES.FRONT_LINE_WORKER,
    title: "Front Line Workers",
    subtitle: "Field Data Operations",
    description:
      "For ASHA and data entry teams to upload CIF documents, edit case records, and verify entries for downstream medical review.",
    buttonLabel: "Login as Front Line Worker",
    route: "/upload",
    icon: UploadFileRoundedIcon,
    accentColor: "#1f6f5f",
  },
  {
    role: DEMO_ROLES.MEDICAL_OFFICER,
    title: "Medical Officers",
    subtitle: "Monitoring Access",
    description:
      "Focused access to dashboard metrics for clinical and administrative supervision of case trends and operational health.",
    buttonLabel: "Login as Medical Officer",
    route: "/dashboard",
    icon: MedicalServicesRoundedIcon,
    accentColor: "#7a3e1d",
  },
];

const adminAccess = {
  role: DEMO_ROLES.USER_ANALYTICS,
  buttonLabel: "Admin Login",
  route: "/dashboard",
};

function LandingPage({ onRoleSelect }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "calc(100vh - 48px)",
        px: { xs: 1, md: 2 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 12%, rgba(18, 60, 107, 0.11), transparent 34%), radial-gradient(circle at 84% 0%, rgba(201, 120, 50, 0.1), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)",
          zIndex: 0,
        }}
      />

      <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        <Card
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 10,
              background: "linear-gradient(90deg, #f28c28 0%, #f7f7f7 50%, #2e7d32 100%)",
            }}
          />
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography variant="h4" sx={{ color: "primary.dark", mt: 0.6, fontSize: { xs: "2rem", sm: "2.3rem" } }}>
              CIF Digitisation System
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 880, mx: "auto", mt: 1.2, lineHeight: 1.7 }}
            >
              District-level case investigation digitisation platform for structured health record intake and
              verification. Current operational region is Gadchiroli.
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end", px: { xs: 0.5, md: 1 } }}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              onRoleSelect?.(adminAccess.role);
              navigate(adminAccess.route);
            }}
            sx={{ color: "text.secondary" }}
          >
            {adminAccess.buttonLabel}
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {roleCards.map((role) => {
            const IconComponent = role.icon;

            return (
              <Grid key={role.title} item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderTop: `4px solid ${role.accentColor}`,
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 16px 28px rgba(8, 34, 61, 0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.2, height: "100%" }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          bgcolor: "primary.light",
                          display: "grid",
                          placeItems: "center",
                          color: role.accentColor,
                        }}
                      >
                        <IconComponent />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: "primary.dark", lineHeight: 1.2 }}>
                          {role.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.subtitle}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {role.description}
                    </Typography>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => {
                        onRoleSelect?.(role.role);
                        navigate(role.route);
                      }}
                      sx={{
                        mt: "auto",
                        bgcolor: role.accentColor,
                        "&:hover": {
                          bgcolor: role.accentColor,
                          filter: "brightness(0.92)",
                        },
                      }}
                    >
                      {role.buttonLabel}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    </Box>
  );
}

export default LandingPage;
