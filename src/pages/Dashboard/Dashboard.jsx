import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import DepartmentBarChart from "../../components/Charts/DepartmentBarChart";
import RegionalBarChart from "../../components/Charts/RegionalBarChart";
import RegionalLineChart from "../../components/Charts/RegionalLineChart";
import StatCard from "../../components/Charts/StatCard";
import StateSegmentationCard from "../../components/Charts/StateSegmentationCard";
import StatusPieChart from "../../components/Charts/StatusPieChart";
import WeeklyCaseTrendChart from "../../components/Charts/WeeklyCaseTrendChart";
import IndiaMap from "../../components/IndiaMap/IndiaMap";
import {
  casesByState,
  departmentDistribution,
  nationalSegments,
  regionalTrend,
  statusBreakdown,
  stateNameOptions,
  stateProfiles,
  summaryStats,
  weeklyCaseTrend,
} from "../../data/mockData";

function Dashboard() {
  const [selectedStateName, setSelectedStateName] = useState("");

  const activeStateProfile = selectedStateName ? stateProfiles[selectedStateName] : null;

  const statCards = useMemo(() => {
    if (!activeStateProfile) return summaryStats;
    return [
      { title: "Total Cases", value: activeStateProfile.totalCases },
      { title: "Follow-up Cases", value: activeStateProfile.followUpCases },
      { title: "New Cases This Week", value: activeStateProfile.newCasesThisWeek },
      { title: "Verified Records", value: activeStateProfile.verifiedRecords },
    ];
  }, [activeStateProfile]);

  const trendData = activeStateProfile ? activeStateProfile.weeklyTrend : weeklyCaseTrend;
  const departmentData = activeStateProfile
    ? activeStateProfile.departmentDistribution
    : departmentDistribution;
  const statusData = activeStateProfile ? activeStateProfile.statusBreakdown : statusBreakdown;
  const segmentData = activeStateProfile ? activeStateProfile.segments : nationalSegments;

  const onMapStateSelect = (stateName) => {
    setSelectedStateName(stateName);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Public Health Case Dashboard</Typography>
        <Typography color="text.secondary">
          Government case investigation digitisation analytics overview.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 320 } }}>
            <InputLabel id="state-select-label">State</InputLabel>
            <Select
              labelId="state-select-label"
              label="State"
              value={selectedStateName}
              onChange={(event) => setSelectedStateName(event.target.value)}
            >
              <MenuItem value="">All States</MenuItem>
              {stateNameOptions.map((stateName) => (
                <MenuItem key={stateName} value={stateName}>
                  {stateName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {statCards.map((item) => (
          <Grid key={item.title} item xs={12} sm={6} md={3}>
            <StatCard title={item.title} value={item.value} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <WeeklyCaseTrendChart
            data={trendData}
            title={selectedStateName ? `${selectedStateName} Weekly Trend` : "Weekly Case Trend"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DepartmentBarChart
            data={departmentData}
            title={
              selectedStateName
                ? `${selectedStateName} Department Distribution`
                : "Department Case Distribution"
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StatusPieChart
            data={statusData}
            title={selectedStateName ? `${selectedStateName} Status Breakdown` : "Case Status Breakdown"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StateSegmentationCard
            title={selectedStateName ? `${selectedStateName} Segmentation` : "National Segmentation"}
            segments={segmentData}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" mb={1}>
          Regional Trend Analysis
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <RegionalBarChart data={casesByState} highlightedState={selectedStateName} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RegionalLineChart data={regionalTrend} />
        </Grid>
      </Grid>

      <IndiaMap selectedStateName={selectedStateName} onStateSelect={onMapStateSelect} />
    </Stack>
  );
}

export default Dashboard;
