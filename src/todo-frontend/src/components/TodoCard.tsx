import { useState, useRef, useEffect } from "react";
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSwipeable } from "react-swipeable";
import { TimeHorizon, type TimeHorizonValue, type UpdateTodoRequest } from "../api/todos";

const PRIORITY_COLORS: Record<number, string> = {
  0: "#90caf9", // Low - blue
  1: "#ffb74d", // Medium - orange
  2: "#ef5350", // High - red
};

const PRIORITY_LABELS: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
};

const HORIZON_CONFIG: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  [TimeHorizon.Today]: { label: "Today", color: "#e65100", bg: "#fff3e0" },
  [TimeHorizon.Tomorrow]: {
    label: "Tomorrow",
    color: "#bf360c",
    bg: "#fbe9e7",
  },
  [TimeHorizon.Someday]: {
    label: "Someday",
    color: "#4a148c",
    bg: "#f3e5f5",
  },
};

interface TodoCardProps {
  title: string;
  description?: string | null;
  completed: boolean;
  priority: number;
  category?: string | null;
  timeHorizon: TimeHorizonValue;
  createdAt?: string;
  updatedAt?: string;
  isOverdue?: boolean;
  showHorizon?: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  onChangeHorizon?: (h: TimeHorizonValue) => void;
  onUpdate?: (fields: UpdateTodoRequest) => void;
}

function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameDayLocal(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getEffectiveHorizon(
  timeHorizon: TimeHorizonValue,
  updatedAt?: string
): TimeHorizonValue {
  if (timeHorizon !== TimeHorizon.Tomorrow || !updatedAt) return timeHorizon;
  const updated = new Date(updatedAt);
  const todayStart = startOfTodayLocal();
  return updated < todayStart ? TimeHorizon.Today : TimeHorizon.Tomorrow;
}

function isCompletedBeforeToday(completed: boolean, updatedAt?: string): boolean {
  if (!completed || !updatedAt) return false;
  const updated = new Date(updatedAt);
  const now = new Date();
  return !isSameDayLocal(updated, now);
}

function isOverdueCheck(
  timeHorizon: TimeHorizonValue,
  completed: boolean,
  createdAt?: string,
  updatedAt?: string
): boolean {
  if (completed || !createdAt) return false;
  const effective = getEffectiveHorizon(timeHorizon, updatedAt);
  if (effective !== TimeHorizon.Today) return false;
  const created = new Date(createdAt);
  const now = new Date();
  return !isSameDayLocal(created, now);
}

export { isOverdueCheck, getEffectiveHorizon, isCompletedBeforeToday };

export default function TodoCard({
  title,
  description,
  completed,
  priority,
  category,
  timeHorizon,
  createdAt,
  updatedAt,
  isOverdue: isOverdueProp,
  showHorizon = true,
  onToggleComplete,
  onDelete,
  onChangeHorizon,
  onUpdate,
}: TodoCardProps) {
  const [horizonAnchor, setHorizonAnchor] = useState<HTMLElement | null>(null);
  const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(description ?? "");
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const effectiveHorizon = getEffectiveHorizon(timeHorizon, updatedAt);

  const [swipeOffset, setSwipeOffset] = useState(0);

  // Swipe actions depend on which bucket the card is in:
  // Today:    left = done,           right = move to Tomorrow
  // Tomorrow: left = move to Today,  right = move to Someday
  // Someday:  left = move to Tomorrow, right = nothing
  // Done:     no swipe actions
  const getSwipeActions = () => {
    if (completed) return { left: null, right: null };
    switch (effectiveHorizon) {
      case TimeHorizon.Today:
        return {
          left: () => onToggleComplete(),
          right: () => onChangeHorizon?.(TimeHorizon.Tomorrow),
        };
      case TimeHorizon.Tomorrow:
        return {
          left: () => onChangeHorizon?.(TimeHorizon.Today),
          right: () => onChangeHorizon?.(TimeHorizon.Someday),
        };
      case TimeHorizon.Someday:
        return {
          left: () => onChangeHorizon?.(TimeHorizon.Tomorrow),
          right: null,
        };
      default:
        return { left: null, right: null };
    }
  };

  const swipeActions = getSwipeActions();
  const hasLeftSwipe = Boolean(swipeActions.left);
  const hasRightSwipe = Boolean(swipeActions.right);

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      let clamped = e.deltaX;
      if (clamped < 0 && !hasLeftSwipe) clamped = 0;
      if (clamped > 0 && !hasRightSwipe) clamped = 0;
      setSwipeOffset(Math.max(-100, Math.min(100, clamped)));
    },
    onSwipedLeft: () => {
      if (swipeOffset < -60 && swipeActions.left) swipeActions.left();
      setSwipeOffset(0);
    },
    onSwipedRight: () => {
      if (swipeOffset > 60 && swipeActions.right) swipeActions.right();
      setSwipeOffset(0);
    },
    onTouchEndOrOnMouseUp: () => setSwipeOffset(0),
    trackMouse: false,
    trackTouch: true,
    delta: 20,
  });

  const overdue =
    isOverdueProp ?? isOverdueCheck(timeHorizon, completed, createdAt, updatedAt);
  const horizon = HORIZON_CONFIG[effectiveHorizon] ?? HORIZON_CONFIG[TimeHorizon.Today];
  const borderColor = PRIORITY_COLORS[priority] ?? "#bdbdbd";
  const hasDescription = Boolean(description);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus();
  }, [editingDesc]);

  const commitTitle = () => {
    setEditingTitle(false);
    const trimmed = editTitle.replace(/[\r\n]/g, "").trim().slice(0, 120);
    if (trimmed && trimmed !== title && onUpdate) {
      onUpdate({ title: trimmed });
    } else {
      setEditTitle(title);
    }
  };

  const commitDesc = () => {
    setEditingDesc(false);
    const trimmed = editDesc.slice(0, 500).trim();
    if (trimmed !== (description ?? "") && onUpdate) {
      onUpdate({ description: trimmed || undefined });
    } else {
      setEditDesc(description ?? "");
    }
  };

  // Swipe background: green for "done", bucket colors for moves
  const getSwipeBg = () => {
    if (swipeOffset < -40 && hasLeftSwipe) {
      // Left swipe: green if completing, orange if moving to Today/Tomorrow
      return effectiveHorizon === TimeHorizon.Today
        ? "rgba(76, 175, 80, 0.15)"   // completing → green
        : "rgba(255, 152, 0, 0.12)";  // moving → orange
    }
    if (swipeOffset > 40 && hasRightSwipe) {
      return "rgba(156, 39, 176, 0.12)"; // moving forward → purple
    }
    return undefined;
  };
  const swipeBg = getSwipeBg();

  return (
    <Box
      {...swipeHandlers}
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 1,
        bgcolor: swipeBg ?? (completed ? "action.hover" : "background.paper"),
        transition: swipeOffset === 0 ? "all 0.25s ease" : "none",
        transform: `translateX(${swipeOffset}px)`,
        opacity: completed ? 0.6 : 1,
        "&:hover": completed ? {} : { bgcolor: "action.hover" },
        mb: 0.5,
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      {/* Line 1: checkbox + title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          pt: 1,
          px: 1.5,
          pb: 0.5,
        }}
      >
        <Checkbox
          checked={completed}
          onChange={onToggleComplete}
          size="small"
          sx={{ p: 0.5, mt: -0.25 }}
        />

        {editingTitle && onUpdate ? (
          <InputBase
            inputRef={titleRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value.replace(/[\r\n]/g, "").slice(0, 120))}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitTitle(); }
              if (e.key === "Escape") {
                setEditTitle(title);
                setEditingTitle(false);
              }
            }}
            sx={{
              flex: 1,
              fontSize: "0.95rem",
              py: 0,
              "& textarea": { py: 0 },
            }}
            fullWidth
          />
        ) : (
          <Typography
            onClick={() => {
              if (onUpdate && !completed) {
                setEditTitle(title);
                setEditingTitle(true);
              }
            }}
            sx={{
              flex: 1,
              textDecoration: completed ? "line-through" : "none",
              color: completed ? "text.disabled" : "text.primary",
              transition: "all 0.25s ease",
              fontSize: "0.95rem",
              cursor: onUpdate && !completed ? "text" : "default",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>
        )}

        {overdue && (
          <WarningAmberIcon
            sx={{ fontSize: 18, color: "warning.main", mt: 0.25, flexShrink: 0 }}
            titleAccess="Overdue"
          />
        )}

        {!completed && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ p: 0.25, flexShrink: 0 }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>

      {/* Expandable details */}
      <Collapse in={expanded && !completed}>
        <Box sx={{ px: 1.5, pb: 1.5, pl: 5.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Chips row: priority, horizon, category, delete */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Chip
              label={PRIORITY_LABELS[priority] ?? "Med"}
              size="small"
              onClick={onUpdate ? (e) => setPriorityAnchor(e.currentTarget) : undefined}
              sx={{
                height: 22,
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#fff",
                bgcolor: borderColor,
                borderRadius: "6px",
                cursor: onUpdate ? "pointer" : "default",
              }}
            />
            {onUpdate && (
              <Menu
                anchorEl={priorityAnchor}
                open={Boolean(priorityAnchor)}
                onClose={() => setPriorityAnchor(null)}
              >
                {[0, 1, 2].map((p) => (
                  <MenuItem
                    key={p}
                    selected={p === priority}
                    onClick={() => {
                      setPriorityAnchor(null);
                      if (p !== priority) onUpdate({ priority: p });
                    }}
                  >
                    {p === priority && (
                      <ListItemIcon>
                        <CheckIcon fontSize="small" />
                      </ListItemIcon>
                    )}
                    <Box
                      component="span"
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: PRIORITY_COLORS[p],
                        display: "inline-block",
                        mr: 1,
                      }}
                    />
                    {PRIORITY_LABELS[p]}
                  </MenuItem>
                ))}
              </Menu>
            )}

            {showHorizon && (
              <>
                <Chip
                  label={horizon.label}
                  size="small"
                  onClick={onChangeHorizon ? (e) => setHorizonAnchor(e.currentTarget) : undefined}
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: horizon.color,
                    bgcolor: horizon.bg,
                    borderRadius: "6px",
                    cursor: onChangeHorizon ? "pointer" : "default",
                  }}
                />
                {onChangeHorizon && (
                  <Menu
                    anchorEl={horizonAnchor}
                    open={Boolean(horizonAnchor)}
                    onClose={() => setHorizonAnchor(null)}
                  >
                    {([TimeHorizon.Today, TimeHorizon.Tomorrow, TimeHorizon.Someday] as TimeHorizonValue[]).map((h) => {
                      const cfg = HORIZON_CONFIG[h];
                      const isCurrent = h === effectiveHorizon;
                      return (
                        <MenuItem
                          key={h}
                          selected={isCurrent}
                          onClick={() => {
                            setHorizonAnchor(null);
                            if (!isCurrent) onChangeHorizon(h);
                          }}
                        >
                          {isCurrent && (
                            <ListItemIcon>
                              <CheckIcon fontSize="small" />
                            </ListItemIcon>
                          )}
                          {cfg.label}
                        </MenuItem>
                      );
                    })}
                  </Menu>
                )}
              </>
            )}

            {category && (
              <Chip
                label={category}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
            )}

            <Box sx={{ flex: 1 }} />

            <IconButton size="small" onClick={onDelete} sx={{ p: 0.25 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Description */}
          {editingDesc && onUpdate ? (
            <InputBase
              inputRef={descRef}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value.slice(0, 500))}
              onBlur={commitDesc}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditDesc(description ?? "");
                  setEditingDesc(false);
                }
              }}
              multiline
              minRows={2}
              maxRows={6}
              placeholder="Add a description..."
              sx={{
                width: "100%",
                fontSize: "0.85rem",
                color: "text.secondary",
                bgcolor: "action.hover",
                borderRadius: 1,
                px: 1,
                py: 0.5,
              }}
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              onClick={() => {
                if (onUpdate && !completed) {
                  setEditDesc(description ?? "");
                  setEditingDesc(true);
                }
              }}
              sx={{
                fontSize: "0.85rem",
                cursor: onUpdate && !completed ? "text" : "default",
                fontStyle: hasDescription ? "normal" : "italic",
                whiteSpace: "pre-wrap",
                minHeight: 24,
              }}
            >
              {hasDescription ? description : "Add a description..."}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
