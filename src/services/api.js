// In production, call the API through the frontend's own origin. Render's
// rewrite rules proxy these paths to the backend, keeping auth cookies
// same-origin on mobile browsers. During local development, use the API URL.
export const API_BASE_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

export async function apiRequest(path, options = {}, retryOn401 = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && retryOn401 && path !== "/auth/refresh") {
      await apiRequest("/auth/refresh", { method: "POST" });
      return apiRequest(path, options, false);
    }

    const error = new Error(result.message || "The request failed.");
    error.status = response.status;
    throw error;
  }

  return result;
}
