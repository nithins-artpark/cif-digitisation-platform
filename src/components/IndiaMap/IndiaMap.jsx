import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { stateMapDetails } from "../../data/mockData";

function IndiaMap({ selectedStateName = "", onStateSelect }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [localStateName, setLocalStateName] = useState("");

  const mapHeight = isMaximized ? 540 : 360;
  const zoomLevel = isMaximized ? 6 : 5;

  const fallbackState = useMemo(
    () => ({
      state: "No state selected",
      cases: "-",
      trend: "-",
    }),
    []
  );

  const activeStateName = selectedStateName || localStateName;
  const stateOptions = Object.keys(stateMapDetails);
  const activeState = activeStateName
    ? {
        state: activeStateName,
        cases: stateMapDetails[activeStateName]?.cases ?? "-",
        trend: stateMapDetails[activeStateName]?.trend ?? "-",
      }
    : fallbackState;
  const mapQuery = activeStateName ? `${activeStateName}, India` : "India";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  const handleStateSelect = (stateName) => {
    if (onStateSelect) {
      onStateSelect(stateName);
      return;
    }
    setLocalStateName(stateName);
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Regional Trend Analysis - India Map
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
          Google Maps regional view for state-level case monitoring.
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
            title="Google India Map"
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
          Select a state to focus the map and update CIF metrics.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {stateOptions.map((stateName) => (
            <Button
              key={stateName}
              size="small"
              variant={activeStateName === stateName ? "contained" : "outlined"}
              onClick={() => handleStateSelect(stateName)}
            >
              {stateName}
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
            State Name
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
