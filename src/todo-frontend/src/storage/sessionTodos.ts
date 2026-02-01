import type { CreateTodoRequest, TimeHorizonValue } from "../api/todos";
import { TimeHorizon } from "../api/todos";

const STORAGE_KEY = "draft_todos";

export interface SessionTodo extends CreateTodoRequest {
  tempId: string;
  timeHorizon: TimeHorizonValue;
  completed: boolean;
  completedAt: string | null;
}

export function getSessionTodos(): SessionTodo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addSessionTodo(todo: CreateTodoRequest): SessionTodo {
  const todos = getSessionTodos();
  const item: SessionTodo = {
    ...todo,
    tempId: crypto.randomUUID(),
    timeHorizon: todo.timeHorizon ?? TimeHorizon.Today,
    completed: false,
    completedAt: null,
  };
  todos.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return item;
}

export function removeSessionTodo(tempId: string): void {
  const todos = getSessionTodos().filter((t) => t.tempId !== tempId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function updateSessionTodo(
  tempId: string,
  updates: Partial<CreateTodoRequest>
): void {
  const todos = getSessionTodos().map((t) =>
    t.tempId === tempId ? { ...t, ...updates } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function toggleSessionTodoComplete(tempId: string): void {
  const todos = getSessionTodos().map((t) =>
    t.tempId === tempId
      ? {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : null,
        }
      : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function clearSessionTodos(): void {
  localStorage.removeItem(STORAGE_KEY);
}
