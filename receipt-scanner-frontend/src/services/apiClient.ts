import { frontendEnv } from "../config/env";

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: { msg: string; path: string }[];
}

/**
 * Centralized API client.
 *
 * Benefits:
 * - Single place for base URL, auth headers
 * - Consistent error parsing (backend returns { status, message })
 * - Typed responses via generics
 * - Optional 401 callback for auth invalidation
 */
async function request<T>(
  path: string,
  options: ApiClientOptions = {},
  onUnauthorized?: () => void
): Promise<T> {
  const { method = "GET", body, headers = {}, formData } = options;
  const url = `${frontendEnv.API_URL}${path}`;

  const requestHeaders: Record<string, string> = { ...headers };
  if (!formData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (formData) {
    fetchOptions.body = formData;
    delete requestHeaders["Content-Type"];
  } else if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { message: "Invalid response from server" };
  }

  if (!res.ok) {
    if (res.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    const err = data as ApiError;
    throw new Error(err.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, onUnauthorized?: () => void) =>
    request<T>(path, { method: "GET" }, onUnauthorized),

  post: <T>(path: string, body: unknown, onUnauthorized?: () => void) =>
    request<T>(path, { method: "POST", body }, onUnauthorized),

  postForm: <T>(path: string, formData: FormData, onUnauthorized?: () => void) =>
    request<T>(path, { method: "POST", formData }, onUnauthorized),
};
