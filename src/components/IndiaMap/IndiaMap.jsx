import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import { stateMapDetails } from "../../data/mockData";

function IndiaMap({ selectedStateName = "", onStateSelect }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [focusAreaId, setFocusAreaId] = useState("gadchiroli-city");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapHeight = isMobile ? (isMaximized ? 420 : 300) : isMaximized ? 540 : 360;
  const maharashtraMetrics = stateMapDetails.Maharashtra;
  const focusAreaOptions = useMemo(
    () => [
      {
        id: "maharashtra-border",
        label: "Maharashtra Border",
        mapQuery: "Maharashtra state boundary, India",
        zoom: isMaximized ? 7 : 6,
      },
      {
        id: "gadchiroli-city",
        label: "Gadchiroli City",
        mapQuery: "Gadchiroli, Maharashtra, India",
        zoom: isMaximized ? 10 : 9,
      },
    ],
    [isMaximized]
  );

  const fallbackState = useMemo(
    () => ({
      state: "Maharashtra",
      cases: "-",
      trend: "-",
    }),
    []
  );

  const isMaharashtraSelected = selectedStateName === "Maharashtra";
  const activeFocusArea =
    focusAreaOptions.find((item) => item.id === (isMaharashtraSelected ? "maharashtra-border" : focusAreaId)) ??
    focusAreaOptions[0];
  const activeState = {
    state: activeFocusArea.label,
    cases: maharashtraMetrics?.cases ?? fallbackState.cases,
    trend: maharashtraMetrics?.trend ?? fallbackState.trend,
  };
  const mapQuery = activeFocusArea.mapQuery;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=&z=${activeFocusArea.zoom}&ie=UTF8&iwloc=&output=embed`;

  const handleFocusSelect = (nextFocusAreaId) => {
    setFocusAreaId(nextFocusAreaId);
    if (onStateSelect) {
      onStateSelect("Maharashtra");
    }
  };

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
          Google Maps regional view focused on Maharashtra border and Gadchiroli city.
        </Typography>
        <Box
          sx={{
            height: mapHeight,
            border: "1px solid #d7dee6",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "#f8fbff",
            transition: "height 0.3s ease",
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
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mt={2} mb={1}>
          Select a focus area in Maharashtra.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {focusAreaOptions.map((area) => (
            <Button
              key={area.id}
              size="small"
              variant={activeFocusArea.id === area.id ? "contained" : "outlined"}
              onClick={() => handleFocusSelect(area.id)}
            >
              {area.label}
            </Button>
          ))}
        </Stack>

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
