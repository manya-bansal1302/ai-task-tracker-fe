import { apiRequest } from "./api.js";

export function completeGoogleSignIn(code, state) {
  return apiRequest("/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
}

export function refreshSession() {
  return apiRequest("/auth/refresh", { method: "POST" });
}

export function getCurrentUser() {
  return apiRequest("/auth/me", {}, true);
}

export function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}
