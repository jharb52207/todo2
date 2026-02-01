import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { todosApi } from "../api/todos";
import { getSessionTodos, clearSessionTodos } from "../storage/sessionTodos";

interface AuthContextValue {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("auth_token")
  );
  const [email, setEmail] = useState<string | null>(
    () => localStorage.getItem("auth_email")
  );
  const queryClient = useQueryClient();

  const login = useCallback(
    async (newToken: string, newEmail: string) => {
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_email", newEmail);
      setToken(newToken);
      setEmail(newEmail);

      // Transfer session todos to API
      const sessionTodos = getSessionTodos();
      if (sessionTodos.length > 0) {
        try {
          await todosApi.bulkCreate(
            sessionTodos.map(({ tempId: _, ...rest }) => rest)
          );
        } catch {
          // Silently fail — user can re-add manually
        }
        clearSessionTodos();
      }

      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    setToken(null);
    setEmail(null);
    queryClient.cancelQueries({ queryKey: ["todos"] });
    queryClient.removeQueries({ queryKey: ["todos"] });
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ token, email, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
