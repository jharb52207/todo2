import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme/theme";
import { AuthProvider } from "./auth/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import COPPACompliance from "./pages/COPPACompliance";
import GDPRCompliance from "./pages/GDPRCompliance";
import Footer from "./components/Footer";
import CookieConsent, { CONSENT_STORAGE_KEY } from "./components/CookieConsent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  const [consentDismissed, setConsentDismissed] = useState(
    () => !!localStorage.getItem(CONSENT_STORAGE_KEY)
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/coppa-compliance" element={<COPPACompliance />} />
                <Route path="/gdpr-compliance" element={<GDPRCompliance />} />
              </Routes>
            </AuthProvider>
            {consentDismissed ? (
              <Footer />
            ) : (
              <CookieConsent onDismiss={() => setConsentDismissed(true)} />
            )}
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
