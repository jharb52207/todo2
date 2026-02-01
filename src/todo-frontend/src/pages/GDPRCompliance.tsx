import { Container, Paper, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function GDPRCompliance() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <MuiLink component={Link} to="/" variant="body2" sx={{ mb: 1, display: "inline-block" }}>
        &larr; Back to Home
      </MuiLink>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          GDPR Compliance
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: January 2026
        </Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>
          Your Rights Under GDPR
        </Typography>
        <Typography variant="body2" paragraph>
          If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, you have the
          following rights regarding your personal data:
        </Typography>

        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
          <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data.</li>
          <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
          <li><strong>Right to Object:</strong> Object to our processing of your data.</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Legal Basis for Processing</Typography>
        <Typography variant="body2" paragraph>
          We process your personal data on the following legal bases:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li><strong>Consent:</strong> You provide your email address to sign in.</li>
          <li><strong>Legitimate Interest:</strong> Operating the App and providing task management functionality.</li>
          <li><strong>Contract:</strong> Providing the service you requested by signing in.</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Data We Process</Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li><strong>Email address</strong> — For authentication only</li>
          <li><strong>Task data</strong> — Todo items you create</li>
          <li><strong>IP-derived region</strong> — For consent compliance (not stored on server)</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Data Retention</Typography>
        <Typography variant="body2" paragraph>
          Your account and task data are retained as long as your account is active. Login codes expire after 15
          minutes and are single-use. You may request deletion of all your data at any time.
        </Typography>

        <Typography variant="h6">Data Transfers</Typography>
        <Typography variant="body2" paragraph>
          The App is hosted in the United States. By using the App, your data may be transferred to and processed in
          the United States.
        </Typography>

        <Typography variant="h6">Exercising Your Rights</Typography>
        <Typography variant="body2" paragraph>
          To exercise any of your GDPR rights, contact John Harbison. We will respond to your request within 30 days.
        </Typography>

        <Typography variant="body2" paragraph>
          For details on what data we collect, see our{" "}
          <MuiLink component={Link} to="/privacy-policy">Privacy Policy</MuiLink>.
        </Typography>
      </Paper>
    </Container>
  );
}
