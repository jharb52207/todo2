import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  TextField,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TodayIcon from "@mui/icons-material/Today";
import SwipeIcon from "@mui/icons-material/Swipe";
import PaletteIcon from "@mui/icons-material/Palette";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNavigate } from "react-router-dom";
import { TimeHorizon, type TimeHorizonValue } from "../api/todos";
import {
  getSessionTodos,
  addSessionTodo,
  removeSessionTodo,
  toggleSessionTodoComplete,
  updateSessionTodo,
  type SessionTodo,
} from "../storage/sessionTodos";
import TodoCard from "../components/TodoCard";

const features = [
  {
    icon: <TodayIcon sx={{ fontSize: 40 }} />,
    title: "Today, Tomorrow, Someday",
    description: "Organize tasks by when they matter. Tomorrow's tasks auto-promote when the day changes.",
  },
  {
    icon: <SwipeIcon sx={{ fontSize: 40 }} />,
    title: "Swipe to Move",
    description: "Swipe tasks between buckets or mark them done. Completed tasks archive at end of day.",
  },
  {
    icon: <BoltIcon sx={{ fontSize: 40 }} />,
    title: "Smart Priorities",
    description: "Color-coded priority levels. Overdue tasks get flagged, not buried — your list stays honest.",
  },
  {
    icon: <PaletteIcon sx={{ fontSize: 40 }} />,
    title: "Edit Inline",
    description: "Tap to rename, expand for details, change priority — all without leaving your list.",
  },
];

const steps = [
  { number: "1", title: "Add your tasks", description: "Type it, speak it, or use natural language. No friction." },
  { number: "2", title: "Stay focused", description: "See only what matters today. Tomorrow's tasks wait their turn." },
  { number: "3", title: "Get it done", description: "Check things off and watch your streaks grow." },
];

function TryItTodos() {
  const [title, setTitle] = useState("");
  const [horizon, setHorizon] = useState<TimeHorizonValue>(TimeHorizon.Today);
  const [todos, setTodos] = useState<SessionTodo[]>(getSessionTodos);
  const navigate = useNavigate();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addSessionTodo({ title: title.trim(), timeHorizon: horizon });
      setTodos(getSessionTodos());
      setTitle("");
    }
  };

  const handleRemove = (tempId: string) => {
    removeSessionTodo(tempId);
    setTodos(getSessionTodos());
  };

  const handleToggle = (tempId: string) => {
    toggleSessionTodoComplete(tempId);
    setTodos(getSessionTodos());
  };

  const handleChangeHorizon = (tempId: string, timeHorizon: TimeHorizonValue) => {
    updateSessionTodo(tempId, { timeHorizon });
    setTodos(getSessionTodos());
  };

  return (
    <Paper
      elevation={8}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* App-style header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={700}>My Tasks</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate("/login")}
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.5)",
            "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
            borderRadius: "50px",
            textTransform: "none",
          }}
        >
          Sign in to save
        </Button>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleAdd} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Add a todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={!title.trim()}>
            Add
          </Button>
        </Box>

        <ToggleButtonGroup
          value={horizon}
          exclusive
          onChange={(_, v) => { if (v !== null) setHorizon(v); }}
          size="small"
          sx={{ mb: 1.5 }}
        >
          <ToggleButton value={TimeHorizon.Today} sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}>
            Today
          </ToggleButton>
          <ToggleButton value={TimeHorizon.Tomorrow} sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}>
            Tomorrow
          </ToggleButton>
          <ToggleButton value={TimeHorizon.Someday} sx={{ px: 1.5, py: 0.25, fontSize: "0.75rem" }}>
            Someday
          </ToggleButton>
        </ToggleButtonGroup>

        {todos.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
            Try it — add your first task above
          </Typography>
        ) : (
          <Box>
            {todos.map((todo) => (
              <TodoCard
                key={todo.tempId}
                title={todo.title}
                completed={todo.completed}
                priority={todo.priority ?? 1}
                timeHorizon={todo.timeHorizon ?? TimeHorizon.Today}
                onToggleComplete={() => handleToggle(todo.tempId)}
                onDelete={() => handleRemove(todo.tempId)}
                onChangeHorizon={(h) => handleChangeHorizon(todo.tempId, h)}
              />
            ))}
          </Box>
        )}

        {todos.length > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            These are stored locally.{" "}
            <Box
              component="span"
              onClick={() => navigate("/login")}
              sx={{ cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
            >
              Sign in
            </Box>{" "}
            to save them permanently.
          </Alert>
        )}
      </Box>
    </Paper>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const ctaClick = () => navigate("/login");

  return (
    <Box>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backdropFilter: "blur(12px)",
          bgcolor: "rgba(255,255,255,0.85)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircleOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Todo
            </Typography>
          </Stack>
          <Button variant="contained" size="small" onClick={ctaClick} sx={{ borderRadius: "50px", px: 3 }}>
            Sign In
          </Button>
        </Container>
      </Box>

      {/* Hero — live app + tagline */}
      <Box
        sx={{
          pt: { xs: 5, md: 8 },
          pb: { xs: 6, md: 10 },
          background: `linear-gradient(170deg, ${theme.palette.primary.main}08 0%, ${theme.palette.background.default} 60%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 8 }}
            alignItems={{ md: "center" }}
          >
            {/* Text side */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3.25rem" },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Get things done,{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  not just listed
                </Box>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                fontWeight={400}
                sx={{ mb: 2, maxWidth: 480, mx: { xs: "auto", md: 0 } }}
              >
                A task manager that respects your time. Focus on today, plan for tomorrow, and stop carrying a list that never ends.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start adding tasks right now — no signup required.
              </Typography>
            </Box>

            {/* Live todo app */}
            <Box sx={{ flex: 1, width: "100%", maxWidth: { xs: 480, md: "none" }, mx: { xs: "auto", md: 0 } }}>
              <TryItTodos />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
            Built for how you actually work
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 520, mx: "auto" }}
          >
            Not another feature-bloated app. Just the right tools to keep you moving.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            flexWrap="wrap"
            justifyContent="center"
            spacing={3}
            useFlexGap
          >
            {features.map((f) => (
              <Paper
                key={f.title}
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  flex: { sm: "1 1 calc(50% - 24px)", lg: "1 1 calc(25% - 24px)" },
                  maxWidth: { sm: "calc(50% - 12px)", lg: "calc(25% - 18px)" },
                  textAlign: "center",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <Box sx={{ color: "primary.main", mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.description}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
            Three steps. That's it.
          </Typography>
          <Stack spacing={4}>
            {steps.map((s) => (
              <Stack key={s.number} direction="row" spacing={3} alignItems="flex-start">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    flexShrink: 0,
                  }}
                >
                  {s.number}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {s.title}
                  </Typography>
                  <Typography color="text.secondary">{s.description}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Social Proof */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "grey.50" }}>
        <Container maxWidth="md">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
            spacing={{ xs: 3, sm: 6 }}
            textAlign="center"
          >
            {[
              { value: "10k+", label: "Tasks completed" },
              { value: "99%", label: "Uptime" },
              { value: "Free", label: "To get started" },
            ].map((stat) => (
              <Box key={stat.label}>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary">{stat.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Ready to save your tasks?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Sign in to sync across devices, set priorities, and never lose a task again.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={ctaClick}
            sx={{
              borderRadius: "50px",
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
            }}
          >
            Sign In
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
