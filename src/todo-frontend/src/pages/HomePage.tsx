import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  todosApi,
  TimeHorizon,
  type CreateTodoRequest,
  type TodoItem,
  type TimeHorizonValue,
} from "../api/todos";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import TodoCard, {
  isOverdueCheck,
  getEffectiveHorizon,
  isCompletedBeforeToday,
} from "../components/TodoCard";

const TAB_LABELS = ["Today", "Tomorrow", "Someday", "Done"] as const;

export default function HomePage() {
  const { isAuthenticated, email, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const queryClient = useQueryClient();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await todosApi.deleteAll();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setConfirmClear(false);
      setSettingsOpen(false);
    } finally {
      setClearing(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Todo App
          </Typography>
          <Box sx={{ textAlign: "right" }}>
            <Link
              component="button"
              variant="body2"
              color="text.secondary"
              underline="hover"
              onClick={() => setSettingsOpen(true)}
              sx={{ cursor: "pointer" }}
            >
              {email}
            </Link>
            <br />
            <Button size="small" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </Button>
          </Box>
        </Box>

        <AuthenticatedTodos />
      </Paper>

      {/* Settings modal */}
      <Dialog open={settingsOpen} onClose={() => { setSettingsOpen(false); setConfirmClear(false); }} fullWidth maxWidth="xs">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          {!confirmClear ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => setConfirmClear(true)}
            >
              Clear all tasks
            </Button>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                This will permanently delete all your tasks. Are you sure?
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <Button variant="outlined" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
                <Button variant="contained" color="error" onClick={handleClearAll} disabled={clearing}>
                  {clearing ? "Clearing..." : "Yes, delete all"}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSettingsOpen(false); setConfirmClear(false); }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function AuthenticatedTodos() {
  const [title, setTitle] = useState("");
  const [horizon, setHorizon] = useState<TimeHorizonValue>(TimeHorizon.Today);
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todosApi.getAll().then((r) => r.data.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateTodoRequest) => todosApi.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setTitle("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => todosApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...fields }: { id: number } & import("../api/todos").UpdateTodoRequest) =>
      todosApi.update(id, fields),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate({ title: title.trim(), timeHorizon: horizon });
    }
  };

  const handleToggleComplete = (todo: TodoItem) => {
    const newStatus = todo.status === 2 ? 0 : 2; // Toggle between Completed and Pending
    updateMutation.mutate({ id: todo.id, status: newStatus });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to load todos.</Alert>;

  const allTodos = data ?? [];
  const isDoneTab = activeTab === 3;

  const filteredTodos = (isDoneTab
    ? allTodos.filter((t) => t.status === 2)
    : allTodos.filter((t) => {
        const effective = getEffectiveHorizon(t.timeHorizon ?? TimeHorizon.Today, t.updatedAt);
        if (effective !== activeTab) return false;
        if (isCompletedBeforeToday(t.status === 2, t.updatedAt)) return false;
        return true;
      })
  ).sort((a, b) => {
    // Done tasks always sort to the bottom
    const aDone = a.status === 2 ? 1 : 0;
    const bDone = b.status === 2 ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    // Then by priority: High (2) first, Low (0) last
    return b.priority - a.priority;
  });

  const overdueCount = allTodos.filter((t) =>
    isOverdueCheck(t.timeHorizon ?? TimeHorizon.Today, t.status === 2, t.createdAt, t.updatedAt)
  ).length;

  return (
    <>
      <Box component="form" onSubmit={handleAdd} sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value.replace(/[\r\n]/g, "").slice(0, 120))}
          inputProps={{ maxLength: 120 }}
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
        sx={{ mb: 2 }}
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

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {TAB_LABELS.map((label, i) => (
          <Tab
            key={label}
            label={
              i === 0 && overdueCount > 0
                ? `${label} (${overdueCount} overdue)`
                : label
            }
            value={i}
          />
        ))}
      </Tabs>

      {filteredTodos.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          {isDoneTab ? "No completed todos yet." : `No ${TAB_LABELS[activeTab].toLowerCase()} todos. Add one above!`}
        </Typography>
      ) : (
        <Box>
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              title={todo.title}
              description={todo.description}
              completed={todo.status === 2}
              priority={todo.priority}
              category={todo.category}
              timeHorizon={todo.timeHorizon ?? TimeHorizon.Today}
              createdAt={todo.createdAt}
              updatedAt={todo.updatedAt}
              showHorizon={isDoneTab}
              onToggleComplete={() => handleToggleComplete(todo)}
              onDelete={() => deleteMutation.mutate(todo.id)}
              onChangeHorizon={isDoneTab ? undefined : (h) => updateMutation.mutate({ id: todo.id, timeHorizon: h })}
              onUpdate={(fields) => updateMutation.mutate({ id: todo.id, ...fields })}
            />
          ))}
        </Box>
      )}
    </>
  );
}
