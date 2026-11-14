import { apiRequest } from "./api.js";

export function getTasks() {
  return apiRequest("/tasks", {}, true);
}

export function createTask(task) {
  return apiRequest(
    "/tasks",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    },
    true,
  );
}
export function updateTaskStatus(taskId, status) {
  return apiRequest(
    `/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    true,
  );
}

export function updateTask(taskId, changes) {
  return apiRequest(
    `/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    },
    true,
  );
}

export function updateTasks(taskIds, changes) {
  return apiRequest(
    "/tasks/bulk",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIds, ...changes }),
    },
    true,
  );
}

export function updateTasksStatus(taskIds, status) {
  return apiRequest(
    "/tasks/bulk-status",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIds, status }),
    },
    true,
  );
}
export function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}`, { method: "DELETE" }, true);
}

export function deleteTasks(taskIds) {
  return apiRequest(
    "/tasks/bulk",
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIds }),
    },
    true,
  );
}
