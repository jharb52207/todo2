import { Box, Button, Typography, Paper, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";

export const CONSENT_STORAGE_KEY = "cookie-consent";

interface CookieConsentProps {
  onDismiss: () => void;
}

export default function CookieConsent({ onDismiss }: CookieConsentProps) {
  const { requiresStrictConsent } = useGeolocation();

  const accept = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    onDismiss();
  };

  const reject = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");
    onDismiss();
  };

  return (
    <Paper
      elevation={6}
      sx={{
        mt: "auto",
        p: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { sm: "center" },
        gap: 2,
        borderRadius: 0,
      }}
    >
      <Typography variant="body2" sx={{ flex: 1 }}>
        {requiresStrictConsent
          ? "We use essential cookies to operate this application. By continuing, you consent to our use of cookies as described in our "
          : "This site uses essential cookies to function properly. See our "}
        <MuiLink component={Link} to="/cookie-policy">
          Cookie Policy
        </MuiLink>
        {" and "}
        <MuiLink component={Link} to="/privacy-policy">
          Privacy Policy
        </MuiLink>
        .
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <Button variant="contained" size="small" onClick={accept}>
          Accept
        </Button>
        <Button variant="outlined" size="small" onClick={reject}>
          Reject
        </Button>
      </Box>
    </Paper>
  );
}
