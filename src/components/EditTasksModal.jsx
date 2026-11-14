import { useState } from "react";

const statusOptions = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Completed" },
];

export default function EditTasksModal({
  tasks,
  onClose,
  onSubmit,
  onDelete,
  isSaving,
  error,
}) {
  const isSingleTask = tasks.length === 1;
  const task = tasks[0];
  const [form, setForm] = useState(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: isSingleTask ? task?.priority ?? "medium" : "",
    status: isSingleTask ? task?.status ?? "todo" : "",
    due_date: isSingleTask ? String(task?.due_date ?? "").slice(0, 10) : "",
  }));

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSingleTask) {
      onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      });
      return;
    }

    const changes = {};
    if (form.priority) changes.priority = form.priority;
    if (form.status) changes.status = form.status;
    onSubmit(changes);
  }

  const canSave = isSingleTask || Boolean(form.priority || form.status);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-tasks-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-tasks-title" className="text-xl font-semibold text-slate-900">
              {isSingleTask ? "Edit task" : `Edit ${tasks.length} tasks`}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isSingleTask
                ? task.title
                : "Choose fields to apply to every selected task. Leave a field unchanged to keep its current value."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close edit dialog"
            className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSingleTask && (
            <>
              <div>
                <label htmlFor="edit-task-title" className="mb-1 block text-sm font-medium text-slate-700">
                  Task name
                </label>
                <input
                  id="edit-task-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="edit-task-description" className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="edit-task-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-500"
                  placeholder="Add more details (optional)"
                />
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-task-priority" className="mb-1 block text-sm font-medium text-slate-700">
                Priority{!isSingleTask && " (optional)"}
              </label>
              <select
                id="edit-task-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {!isSingleTask && <option value="">Keep current priority</option>}
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-task-status" className="mb-1 block text-sm font-medium text-slate-700">
                Status{!isSingleTask && " (optional)"}
              </label>
              <select
                id="edit-task-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {!isSingleTask && <option value="">Keep current status</option>}
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSingleTask && (
            <div>
              <label htmlFor="edit-task-due-date" className="mb-1 block text-sm font-medium text-slate-700">
                Due date
              </label>
              <input
                id="edit-task-due-date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="rounded-lg px-3 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete {isSingleTask ? "task" : `${tasks.length} tasks`}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !canSave}
                className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {isSaving ? "Saving…" : isSingleTask ? "Save changes" : "Update selected"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
