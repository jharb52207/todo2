import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { authApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.requestMagicLink(email);
      setStep("code");
    } catch {
      setError("Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.confirmMagicLink(code);
      const data = res.data.data;
      if (data) {
        await login(data.token, data.email);
        navigate("/", { replace: true });
      } else {
        setError("Invalid or expired code.");
      }
    } catch {
      setError("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => (step === "code" ? setStep("email") : navigate("/"))}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Sign In
        </Typography>

        {step === "email" ? (
          <Box component="form" onSubmit={handleRequestCode} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Login Code"}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleConfirmCode} sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              We sent a 6-digit code to {email}. Check your email (or the API
              console in dev mode).
            </Alert>
            <TextField
              fullWidth
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              inputProps={{ maxLength: 6, pattern: "[0-9]{6}" }}
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
