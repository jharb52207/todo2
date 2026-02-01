import { Container, Paper, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <MuiLink component={Link} to="/" variant="body2" sx={{ mb: 1, display: "inline-block" }}>
        &larr; Back to Home
      </MuiLink>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: January 2026
        </Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>
          Acceptance of Terms
        </Typography>
        <Typography variant="body2" paragraph>
          By accessing or using the Todo Task Manager application ("the App"), you agree to be bound by these Terms of
          Service. If you do not agree, you may not use the App.
        </Typography>

        <Typography variant="h6">Description of Service</Typography>
        <Typography variant="body2" paragraph>
          The App is a task management tool that allows you to create, manage, and organize todo items. The App is
          provided as a demonstration project by John Harbison.
        </Typography>

        <Typography variant="h6">User Accounts</Typography>
        <Typography variant="body2" paragraph>
          You may use the App anonymously with locally stored todos, or sign in with your email address to persist
          your data. You are responsible for maintaining the security of your email account and any devices used to
          access the App.
        </Typography>

        <Typography variant="h6">Acceptable Use</Typography>
        <Typography variant="body2" paragraph>
          You agree not to misuse the App. This includes but is not limited to: attempting to gain unauthorized access
          to the service, interfering with other users, or using the App for unlawful purposes.
        </Typography>

        <Typography variant="h6">Intellectual Property</Typography>
        <Typography variant="body2" paragraph>
          The App and its original content, features, and functionality are owned by John Harbison and are protected by
          applicable intellectual property laws. Your task data remains yours.
        </Typography>

        <Typography variant="h6">Limitation of Liability</Typography>
        <Typography variant="body2" paragraph>
          The App is provided "as is" without warranties of any kind. John Harbison shall not be liable for any
          indirect, incidental, special, or consequential damages arising from your use of the App.
        </Typography>

        <Typography variant="h6">Data &amp; Privacy</Typography>
        <Typography variant="body2" paragraph>
          Your use of the App is also governed by our{" "}
          <MuiLink component={Link} to="/privacy-policy">Privacy Policy</MuiLink>. By using the App, you consent to
          the collection and use of information as described therein.
        </Typography>

        <Typography variant="h6">Termination</Typography>
        <Typography variant="body2" paragraph>
          We reserve the right to suspend or terminate access to the App at any time, with or without cause or notice.
        </Typography>

        <Typography variant="h6">Changes to Terms</Typography>
        <Typography variant="body2" paragraph>
          We may update these terms from time to time. Continued use of the App after changes constitutes acceptance
          of the revised terms.
        </Typography>

        <Typography variant="h6">Contact</Typography>
        <Typography variant="body2" paragraph>
          For questions about these terms, contact John Harbison.
        </Typography>
      </Paper>
    </Container>
  );
}
