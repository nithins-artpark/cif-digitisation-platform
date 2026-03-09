import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Upload CIF", path: "/upload" },
  { label: "Case Records", path: "/case-review" },
  { label: "Reports", path: "/reports" },
];

function Navbar() {
  const location = useLocation();

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.dark" }}>
      <Toolbar sx={{ minHeight: 68, display: "flex", gap: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          CIF Digitisation System
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              color="inherit"
              variant={location.pathname === item.path ? "outlined" : "text"}
              sx={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
