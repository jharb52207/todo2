import { Container, Paper, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <MuiLink component={Link} to="/" variant="body2" sx={{ mb: 1, display: "inline-block" }}>
        &larr; Back to Home
      </MuiLink>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: January 2026
        </Typography>

        <Typography variant="h6" sx={{ mt: 3 }}>
          Overview
        </Typography>
        <Typography variant="body2" paragraph>
          This Todo Task Manager application ("the App") is developed and maintained by John Harbison.
          This policy describes how personal information is collected, used, and shared when you use the App.
        </Typography>

        <Typography variant="h6">Information We Collect</Typography>
        <Typography variant="body2" paragraph>
          <strong>Account Information:</strong> When you sign in via email code, we store your email address to identify your account.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Task Data:</strong> Todo items, categories, and any content you create within the App.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Session Data:</strong> Anonymous todos created before sign-in are stored in your browser's local storage
          until you authenticate, at which point they are transferred to your account.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Region Detection:</strong> We use a third-party IP geolocation service (geojs.io) to determine your
          approximate region for consent compliance purposes. No precise location data is collected or stored on our servers.
        </Typography>

        <Typography variant="h6">How We Use Your Information</Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>To provide and maintain the App functionality</li>
          <li>To authenticate your identity via email login code</li>
          <li>To persist your tasks across sessions</li>
          <li>To determine applicable privacy regulations based on your region</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Data Storage</Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Task data is stored in a SQL database</li>
          <li>Authentication uses JWT tokens; login codes are single-use and expire after 15 minutes</li>
          <li>No passwords are stored — authentication is passwordless via email codes</li>
          <li>Login code emails are delivered via EmailJS; your email address is shared with EmailJS solely for delivery</li>
          <li>No data is sold or shared with third parties</li>
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Cookies &amp; Local Storage</Typography>
        <Typography variant="body2" paragraph>
          The App uses essential browser storage (localStorage) for authentication tokens, session todos, cookie consent
          preferences, and cached region data. No analytics or advertising cookies are used.
          See our{" "}
          <MuiLink component={Link} to="/cookie-policy">Cookie Policy</MuiLink> for details.
        </Typography>

        <Typography variant="h6">Your Rights</Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li><strong>Access:</strong> You can view all your data within the App</li>
          <li><strong>Deletion:</strong> You can delete your account and all associated data</li>
          <li><strong>Export:</strong> You can request an export of your data</li>
        </Typography>

        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
          For additional rights under GDPR or COPPA, see our{" "}
          <MuiLink component={Link} to="/gdpr-compliance">GDPR Compliance</MuiLink> and{" "}
          <MuiLink component={Link} to="/coppa-compliance">COPPA Compliance</MuiLink> pages.
        </Typography>

        <Typography variant="h6">Contact</Typography>
        <Typography variant="body2" paragraph>
          For privacy-related questions, contact John Harbison.
        </Typography>
      </Paper>
    </Container>
  );
}
