import { useRef, useState } from "react";
import {
  parseTaskFromAudio,
  parseTaskFromSpeech,
} from "../services/aiService.js";

export default function CreateTaskModal({
  onClose,
  onSubmit,
  isSaving,
  error,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });
  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [aiTaskError, setAiTaskError] = useState("");
  const [hasGeneratedDraft, setHasGeneratedDraft] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  async function handleToggleVoiceInput() {
    if (isListening) {
      setVoiceError("");
      setAiTaskError("");
      setIsGeneratingTask(true);
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setVoiceError(
        "Audio recording is not available in this browser. You can type your task instead.",
      );
      return;
    }

    setVoiceError("");
    setAiTaskError("");
    setVoiceText("");
    setHasGeneratedDraft(false);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;
      let recordingFailed = false;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        recordingFailed = true;
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        setIsGeneratingTask(false);
        setVoiceError("The recording failed. Please try again.");
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);

        if (recordingFailed) {
          setIsGeneratingTask(false);
          return;
        }

        const recordingType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recordingType,
        });

        if (!audioBlob.size) {
          setIsGeneratingTask(false);
          setVoiceError("No speech was recorded. Click Start recording and try again.");
          return;
        }

        try {
          const result = await parseTaskFromAudio(
            audioBlob,
            recordingType.split(";")[0],
          );
          setVoiceText(result.task.transcript || "");
          setForm({
            title: result.task.title,
            description: result.task.description || "",
            status: result.task.status || "todo",
            priority: result.task.priority,
            due_date: result.task.due_date || "",
          });
          setHasGeneratedDraft(true);
        } catch (requestError) {
          setAiTaskError(requestError.message);
        } finally {
          setIsGeneratingTask(false);
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (recordingError) {
      stream?.getTracks().forEach((track) => track.stop());
      setIsListening(false);
      setVoiceError(
        recordingError.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access and try again."
          : "Could not start recording. Check your microphone and try again.",
      );
    }
  }

  async function handleGenerateTaskFromVoice() {
    if (!voiceText) return;

    setIsGeneratingTask(true);
    setAiTaskError("");

    try {
      const result = await parseTaskFromSpeech(voiceText);
      setForm({
        title: result.task.title,
        description: result.task.description || "",
        status: result.task.status || "todo",
        priority: result.task.priority,
        due_date: result.task.due_date || "",
      });
      setHasGeneratedDraft(true);
    } catch (requestError) {
      setAiTaskError(requestError.message);
    } finally {
      setIsGeneratingTask(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, due_date: form.due_date || null });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving &&
          !isGeneratingTask &&
          !isListening
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="create-task-title" className="text-xl font-semibold">
            Create a task
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isGeneratingTask || isListening}
            aria-label="Close dialog"
            className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Task title
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={150}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-500"
              placeholder="What do you need to do?"
            />
          </div>

          <div className="rounded-lg bg-violet-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">
                  Describe your task by voice
                </p>
                <p className="text-sm text-slate-600">
                  For example: “Finish my project report by Friday, high
                  priority.”
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isSaving || isGeneratingTask}
                className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isGeneratingTask
                  ? "Understanding recording…"
                  : isListening
                    ? "Stop and create draft"
                    : "🎙 Start recording"}
              </button>
            </div>

            {voiceText && (
              <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                <label htmlFor="voice-transcript" className="font-medium">
                  Gemini heard this. You can correct it:
                </label>
                <textarea
                  id="voice-transcript"
                  value={voiceText}
                  onChange={(event) => setVoiceText(event.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-slate-300 p-2"
                />

                <button
                  type="button"
                  onClick={handleGenerateTaskFromVoice}
                  disabled={isGeneratingTask || !voiceText.trim()}
                  className="mt-2 rounded-lg bg-violet-600 px-3 py-2 font-medium text-white disabled:opacity-60"
                >
                  {isGeneratingTask
                    ? "Generating task details…"
                    : "Update fields from corrected text"}
                </button>
              </div>
            )}

            {voiceError && (
              <p className="mt-2 text-sm text-red-600" role="status">
                {voiceError}
              </p>
            )}
            {aiTaskError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {aiTaskError}
              </p>
            )}
            {hasGeneratedDraft && (
              <p className="mt-3 text-sm text-violet-800" role="status">
                AI filled in the task details. Review or edit them below, then confirm to save.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-500"
              placeholder="Add details (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium"
            >
              Board column
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="review">Review</option>
              <option value="done">Completed</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="priority"
                className="mb-1 block text-sm font-medium"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="mb-1 block text-sm font-medium"
              >
                Due date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isGeneratingTask || isListening}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isGeneratingTask}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {isSaving
                ? "Saving…"
                : hasGeneratedDraft
                  ? "Confirm and create task"
                  : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
