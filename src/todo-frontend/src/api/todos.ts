import apiClient from "./client";

export const TimeHorizon = {
  Today: 0,
  Tomorrow: 1,
  Someday: 2,
} as const;

export type TimeHorizonValue = (typeof TimeHorizon)[keyof typeof TimeHorizon];

export interface TodoItem {
  id: number;
  title: string;
  description: string | null;
  status: number;
  priority: number;
  timeHorizon: TimeHorizonValue;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: string[] | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: number;
  timeHorizon?: TimeHorizonValue;
  dueDate?: string;
  category?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: number;
  priority?: number;
  timeHorizon?: TimeHorizonValue;
  dueDate?: string;
  category?: string;
}

export const todosApi = {
  getAll: () => apiClient.get<ApiResponse<TodoItem[]>>("/todo"),
  getById: (id: number) => apiClient.get<ApiResponse<TodoItem>>(`/todo/${id}`),
  create: (data: CreateTodoRequest) =>
    apiClient.post<ApiResponse<TodoItem>>("/todo", data),
  update: (id: number, data: UpdateTodoRequest) =>
    apiClient.put<ApiResponse<TodoItem>>(`/todo/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse<null>>(`/todo/${id}`),
  bulkCreate: (items: CreateTodoRequest[]) =>
    apiClient.post<ApiResponse<TodoItem[]>>("/todo/bulk", items, {
      _skipAuthRedirect: true,
    } as Record<string, unknown>),
  deleteAll: async () => {
    const res = await apiClient.get<ApiResponse<TodoItem[]>>("/todo");
    const todos = res.data.data ?? [];
    await Promise.all(todos.map((t) => apiClient.delete(`/todo/${t.id}`)));
  },
};
