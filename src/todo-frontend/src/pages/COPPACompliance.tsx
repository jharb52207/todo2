import { Container, Paper, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function COPPACompliance() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <MuiLink component={Link} to="/" variant="body2" sx={{ mb: 1, display: "inline-block" }}>
        &larr; Back to Home
      </MuiLink>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          COPPA Compliance
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: January 2026
        </Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>
          Children's Privacy
        </Typography>
        <Typography variant="body2" paragraph>
          The Todo Task Manager application is not directed to children under the age of 13. We do not knowingly
          collect personal information from children under 13. If you are a parent or guardian and believe your child
          has provided us with personal information, please contact us so we can take appropriate action.
        </Typography>

        <Typography variant="h6">Age Requirement</Typography>
        <Typography variant="body2" paragraph>
          Users must be at least 13 years of age to create an account and use authenticated features of this App.
          Anonymous usage (localStorage-only todos) does not collect personal information.
        </Typography>

        <Typography variant="h6">Information We Collect</Typography>
        <Typography variant="body2" paragraph>
          The only personal information collected from authenticated users is an email address, used solely for
          passwordless authentication via one-time login codes. No additional personal data, behavioral data, or
          device identifiers are collected.
        </Typography>

        <Typography variant="h6">Parental Rights</Typography>
        <Typography variant="body2" paragraph>
          Parents and guardians have the right to:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Review any personal information collected from their child</li>
          <li>Request deletion of their child's personal information</li>
          <li>Refuse further collection of their child's information</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Data Retention</Typography>
        <Typography variant="body2" paragraph>
          If we discover that personal information has been collected from a child under 13 without verifiable parental
          consent, we will delete that information promptly.
        </Typography>

        <Typography variant="h6">Contact</Typography>
        <Typography variant="body2" paragraph>
          For COPPA-related inquiries, contact John Harbison.
        </Typography>
      </Paper>
    </Container>
  );
}
