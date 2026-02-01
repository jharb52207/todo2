import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Cookie Policy", to: "/cookie-policy" },
  { label: "COPPA Compliance", to: "/coppa-compliance" },
  { label: "GDPR Compliance", to: "/gdpr-compliance" },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: "auto", py: 3, bgcolor: "grey.100" }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {legalLinks.map((link) => (
            <MuiLink
              key={link.to}
              component={Link}
              to={link.to}
              variant="body2"
              color="text.secondary"
              underline="hover"
            >
              {link.label}
            </MuiLink>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} Todo Task Manager &mdash; John Harbison
        </Typography>
      </Container>
    </Box>
  );
}
