import { Container, Paper, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function CookiePolicy() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <MuiLink component={Link} to="/" variant="body2" sx={{ mb: 1, display: "inline-block" }}>
        &larr; Back to Home
      </MuiLink>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Cookie Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: January 2026
        </Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>
          What Are Cookies?
        </Typography>
        <Typography variant="body2" paragraph>
          Cookies and similar storage mechanisms (such as localStorage) are small pieces of data stored on your device
          by your browser. They help websites and applications function correctly.
        </Typography>

        <Typography variant="h6">How We Use Cookies</Typography>
        <Typography variant="body2" paragraph>
          This App uses <strong>only essential storage</strong>. We do not use analytics, advertising, or third-party tracking cookies.
        </Typography>

        <Typography variant="h6">Storage We Use</Typography>

        <Typography variant="body2" paragraph>
          <strong>Authentication Token</strong> (localStorage) — Stores your JWT session token so you remain signed in
          across page reloads. Cleared on sign-out.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Session Todos</strong> (localStorage) — Stores anonymous draft todos before you sign in. Cleared after
          sign-in when todos are transferred to your account.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Cookie Consent Preference</strong> (localStorage) — Records whether you accepted or rejected cookies via
          the consent banner.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Region Cache</strong> (localStorage) — Caches your approximate region (determined via IP geolocation) for
          up to 30 days to display the appropriate consent experience.
        </Typography>

        <Typography variant="h6">Third-Party Services</Typography>
        <Typography variant="body2" paragraph>
          <strong>geojs.io</strong> — Used for IP-based region detection to determine applicable privacy regulations.
          This service receives your IP address. No personal data is stored from this lookup beyond the resulting region code.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>EmailJS</strong> — Used to deliver login code emails. Your email address is shared with EmailJS
          solely for the purpose of sending your authentication code.
        </Typography>

        <Typography variant="h6">Managing Your Preferences</Typography>
        <Typography variant="body2" paragraph>
          You can clear all stored data by clearing your browser's site data for this application.
          You can also sign out to remove your authentication token.
        </Typography>

        <Typography variant="h6">Contact</Typography>
        <Typography variant="body2" paragraph>
          For questions about our cookie practices, contact John Harbison.
        </Typography>
      </Paper>
    </Container>
  );
}
