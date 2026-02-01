import apiClient from "./client";
import type { ApiResponse } from "./todos";

export interface AuthResponse {
  token: string;
  email: string;
}

export const authApi = {
  requestMagicLink: (email: string) =>
    apiClient.post<ApiResponse<null>>("/auth/request-magic-link", { email }),

  confirmMagicLink: (token: string) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/confirm-magic-link", {
      token,
    }),
};
