import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { stateMapDetails } from "../../data/mockData";

function IndiaMap() {
  const [isMaximized, setIsMaximized] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapHeight = isMobile ? (isMaximized ? 420 : 300) : isMaximized ? 540 : 360;
  const maharashtraMetrics = stateMapDetails.Maharashtra;
  const fallbackState = {
    state: "Gadchiroli",
    cases: "-",
    trend: "-",
  };
  const activeFocusArea = {
    label: "Gadchiroli",
    mapQuery: "Gadchiroli district boundary, Maharashtra, India",
    zoom: isMaximized ? 13 : 12,
  };
  const activeState = {
    state: activeFocusArea.label,
    cases: maharashtraMetrics?.cases ?? fallbackState.cases,
    trend: maharashtraMetrics?.trend ?? fallbackState.trend,
  };
  const mapQuery = activeFocusArea.mapQuery;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=&z=${activeFocusArea.zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1} spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Regional Trend Analysis - Maharashtra / Gadchiroli Map
          </Typography>
          <IconButton
            onClick={() => setIsMaximized((prev) => !prev)}
            size="small"
            aria-label="maximize map"
          >
            {isMaximized ? <CloseFullscreenRoundedIcon /> : <OpenInFullRoundedIcon />}
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Google Maps regional view focused on Gadchiroli boundary. Map movement is disabled.
        </Typography>
        <Box
          sx={{
            height: mapHeight,
            border: "1px solid #d7dee6",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "#f8fbff",
            transition: "height 0.3s ease",
            position: "relative",
          }}
        >
          <Box
            component="iframe"
            src={mapSrc}
            title="Google Maharashtra and Gadchiroli Map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sx={{
              width: "100%",
              height: "100%",
              border: 0,
              pointerEvents: "none",
            }}
          />
        </Box>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            border: "1px solid #d7dee6",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Focus Area
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {activeState.state}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            <Chip label={`Number of Cases: ${activeState.cases}`} size="small" />
            <Chip label={`Weekly Trend: ${activeState.trend}`} size="small" color="primary" />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default IndiaMap;
