export default function DeleteTaskModal({
  tasks,
  onCancel,
  onConfirm,
  isDeleting,
  error,
}) {
  const isSingleTask = tasks.length === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2
          id="delete-task-title"
          className="text-xl font-semibold text-slate-900"
        >
          {isSingleTask ? "Delete this task?" : `Delete ${tasks.length} tasks?`}
        </h2>

        <p className="mt-3 text-slate-600">
          {isSingleTask ? (
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-900">{tasks[0].title}</span>? This action cannot be undone.
            </>
          ) : (
            <>Are you sure you want to permanently delete all {tasks.length} selected tasks? This action cannot be undone.</>
          )}
        </p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : isSingleTask ? "Delete task" : `Delete ${tasks.length} tasks`}
          </button>
        </div>
      </section>
    </div>
  );
}
