import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import CreateTaskModal from "../components/CreateTaskModal.jsx";
import DeleteTaskModal from "../components/DeleteTaskModel.jsx";
import EditTasksModal from "../components/EditTasksModal.jsx";
import { logout } from "../services/authService.js";
import AIAssistantMenu from "../components/AIAssistantMenu.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import {
  createTask,
  deleteTask,
  deleteTasks,
  getTasks,
  updateTask,
  updateTasks,
  updateTasksStatus,
} from "../services/taskService.js";

const statusLabels = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Completed",
};

export default function DashboardPage() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [tasksToDelete, setTasksToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [isMovingTasks, setIsMovingTasks] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        const result = await getTasks();
        if (active) setTasks(result.tasks);
      } catch (error) {
        if (active) {
          if (error.status === 401) {
            navigate("/", { replace: true });
          } else {
            setPageError(error.message);
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTasks();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleCreateTask(taskData) {
    setIsSaving(true);
    setFormError("");
    try {
      const result = await createTask(taskData);
      setTasks((currentTasks) => [result.task, ...currentTasks]);
      setIsCreateModalOpen(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const selectedTasks = tasks.filter((task) =>
    selectedTaskIds.some((id) => String(id) === String(task.id)),
  );

  function openDeleteConfirmation(tasksToRemove) {
    const list = Array.isArray(tasksToRemove) ? tasksToRemove : [tasksToRemove];
    setDeleteError("");
    setTasksToDelete(list);
  }

  async function confirmDeleteTasks() {
    if (!tasksToDelete?.length) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const deletedIds = tasksToDelete.map((task) => task.id);
      if (deletedIds.length === 1) {
        await deleteTask(deletedIds[0]);
      } else {
        await deleteTasks(deletedIds);
      }

      const deletedIdSet = new Set(deletedIds.map(String));
      setTasks((currentTasks) =>
        currentTasks.filter((task) => !deletedIdSet.has(String(task.id))),
      );
      setSelectedTaskIds((currentIds) =>
        currentIds.filter((id) => !deletedIdSet.has(String(id))),
      );
      setTasksToDelete(null);
      setIsEditModalOpen(false);
      setIsSelectionMode(false);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveSelected(changes) {
    if (selectedTasks.length === 0) return;
    setIsSavingEdit(true);
    setEditError("");

    try {
      if (selectedTasks.length === 1) {
        const result = await updateTask(selectedTasks[0].id, changes);
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            String(task.id) === String(result.task.id) ? result.task : task,
          ),
        );
      } else {
        const result = await updateTasks(
          selectedTasks.map((task) => task.id),
          changes,
        );
        const updatedById = new Map(
          result.tasks.map((task) => [String(task.id), task]),
        );
        setTasks((currentTasks) =>
          currentTasks.map((task) => updatedById.get(String(task.id)) || task),
        );
      }

      setIsEditModalOpen(false);
      setSelectedTaskIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setIsSavingEdit(false);
    }
  }

  function toggleTaskSelection(taskId) {
    setSelectedTaskIds((currentIds) =>
      currentIds.some((id) => String(id) === String(taskId))
        ? currentIds.filter((id) => String(id) !== String(taskId))
        : [...currentIds, taskId],
    );
  }

  function handleDragStart(event, taskId) {
    // Buttons inside a task card (especially the selection bullet) are not drag handles.
    if (event.target.closest("button")) {
      event.preventDefault();
      return;
    }

    const taskIdsToMove = selectedTaskIds.some(
      (id) => String(id) === String(taskId),
    )
      ? selectedTaskIds
      : [taskId];

    event.dataTransfer.setData("text/plain", JSON.stringify(taskIdsToMove));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event, status) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  async function handleDrop(event, newStatus) {
    event.preventDefault();
    setDragOverStatus(null);

    let draggedTaskIds;
    try {
      const parsedTaskIds = JSON.parse(
        event.dataTransfer.getData("text/plain"),
      );
      if (!Array.isArray(parsedTaskIds)) return;
      draggedTaskIds = [...new Set(parsedTaskIds.map(String))];
    } catch {
      return;
    }

    const tasksToMove = tasks.filter((task) =>
      draggedTaskIds.includes(String(task.id)),
    );
    if (tasksToMove.length === 0) return;

    const movingSelected = tasksToMove.some((task) =>
      selectedTaskIds.some((id) => String(id) === String(task.id)),
    );
    if (tasksToMove.every((task) => task.status === newStatus)) {
      if (movingSelected) setSelectedTaskIds([]);
      return;
    }

    const taskIdsToMove = tasksToMove.map((task) => task.id);
    const movedIdSet = new Set(taskIdsToMove.map(String));
    setPageError("");
    setIsMovingTasks(true);
    try {
      await updateTasksStatus(taskIdsToMove, newStatus);
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          movedIdSet.has(String(task.id))
            ? { ...task, status: newStatus }
            : task,
        ),
      );
      if (movingSelected) setSelectedTaskIds([]);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsMovingTasks(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setPageError(error.message);
    }
  }

  const taskColumns = [
    { status: "todo", title: "To do" },
    { status: "in_progress", title: "In progress" },
    { status: "review", title: "Review" },
    { status: "done", title: "Completed" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-600">TaskPilot</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Welcome, {user?.name || user?.email || "there"}
            </h1>
            <p className="mt-2 text-slate-600">Here are your tasks.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                setFormError("");
                setIsCreateModalOpen(true);
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
            >
              + Create task
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTaskIds([]);
                setIsEditModalOpen(false);
                setIsSelectionMode((current) => !current);
              }}
              className="rounded-lg border border-violet-300 bg-white px-4 py-2 font-medium text-violet-700 hover:bg-violet-50"
            >
              {isSelectionMode ? "Done" : "Edit tasks"}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </header>

        {isSelectionMode && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
            <p className="font-medium text-violet-900">
              {selectedTasks.length > 0
                ? `${selectedTasks.length} ${selectedTasks.length === 1 ? "task" : "tasks"} selected`
                : "Select one or more tasks using the bullets."}
            </p>
            {selectedTasks.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditError("");
                    setIsEditModalOpen(true);
                  }}
                  disabled={isMovingTasks}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  Edit selected ({selectedTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTaskIds([])}
                  className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm text-violet-800 hover:bg-violet-100"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}

        {pageError && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {pageError}
          </p>
        )}

        {isLoading ? (
          <p className="text-slate-600">Loading your tasks…</p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {taskColumns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.status,
              );
              return (
                <div
                  key={column.status}
                  onDragOver={(event) => handleDragOver(event, column.status)}
                  onDrop={(event) => handleDrop(event, column.status)}
                  className={`min-h-64 rounded-xl p-4 transition-colors ${
                    dragOverStatus === column.status
                      ? "bg-violet-100 ring-2 ring-violet-400"
                      : "bg-slate-100"
                  }`}
                >
                  <h2 className="mb-4 font-semibold text-slate-800">
                    {column.title}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {columnTasks.length}
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No tasks here yet.
                      </p>
                    ) : (
                      columnTasks.map((task) => {
                        const isSelected = selectedTaskIds.some(
                          (id) => String(id) === String(task.id),
                        );
                        return (
                          <article
                            key={task.id}
                            draggable={task.status !== "done" && !isMovingTasks}
                            onDragStart={(event) =>
                              handleDragStart(event, task.id)
                            }
                            onDragEnd={() => setDragOverStatus(null)}
                            className={`rounded-lg border bg-white p-4 shadow-sm transition ${
                              isSelected
                                ? "border-violet-400 ring-2 ring-violet-100"
                                : "border-slate-200"
                            } ${task.status === "done" ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                {isSelectionMode && task.status !== "done" && (
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    aria-label={`Select ${task.title}`}
                                    draggable={false}
                                    onDragStart={(event) =>
                                      event.preventDefault()
                                    }
                                    onClick={() => toggleTaskSelection(task.id)}
                                    disabled={isMovingTasks}
                                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                                      isSelected
                                        ? "border-violet-600 bg-violet-600 text-white"
                                        : "border-slate-400 hover:border-violet-600"
                                    } disabled:opacity-50`}
                                  >
                                    {isSelected ? "✓" : ""}
                                  </button>
                                )}
                                <h3 className="min-w-0 break-words font-semibold text-slate-900">
                                  {task.title}
                                </h3>
                              </div>

                              <button
                                type="button"
                                onClick={() => openDeleteConfirmation(task)}
                                aria-label={`Delete ${task.title}`}
                                title="Delete task"
                                draggable={false}
                                onDragStart={(event) => event.preventDefault()}
                                className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-5 w-5"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="m19 6-1 14H6L5 6" />
                                  <path d="M10 11v5M14 11v5" />
                                </svg>
                              </button>
                            </div>

                            {task.description && (
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {statusLabels[task.status] || task.status}
                              </span>
                              <span className="text-xs font-medium capitalize text-slate-500">
                                {task.priority} priority
                              </span>
                            </div>

                            <p className="mt-3 text-right text-sm text-slate-500">
                              {task.due_date
                                ? `Due ${String(task.due_date).slice(0, 10)}`
                                : "No due date"}
                            </p>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </section>

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          isSaving={isSaving}
          error={formError}
        />
      )}

      {isEditModalOpen && selectedTasks.length > 0 && (
        <EditTasksModal
          tasks={selectedTasks}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveSelected}
          onDelete={() => openDeleteConfirmation(selectedTasks)}
          isSaving={isSavingEdit}
          error={editError}
        />
      )}

      {tasksToDelete && (
        <DeleteTaskModal
          tasks={tasksToDelete}
          onCancel={() => {
            if (!isDeleting) {
              setTasksToDelete(null);
              setDeleteError("");
            }
          }}
          onConfirm={confirmDeleteTasks}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
      <AIAssistantMenu />
    </main>
  );
}
