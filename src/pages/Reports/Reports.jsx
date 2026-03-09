import { Card, CardContent, Stack, Typography } from "@mui/material";

function Reports() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Reports</Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>
            CIF Reporting Module
          </Typography>
          <Typography color="text.secondary">
            Monthly and district-level downloadable reporting views can be configured in this section.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default Reports;
