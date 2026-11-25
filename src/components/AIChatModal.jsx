import { useEffect, useRef, useState } from "react";
import { chatWithTasks } from "../services/aiService.js";

export default function AIChatModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setIsSending(true);

    try {
      const recentMessages = nextMessages.slice(-12);
      if (recentMessages[0]?.role === "model") recentMessages.shift();
      const result = await chatWithTasks(recentMessages);
      setMessages((current) => [
        ...current,
        { role: "model", text: result.reply },
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end bg-black/40 p-3 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="taskpilot-chat-title"
        className="flex h-[min(680px,calc(100dvh-1.5rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="taskpilot-chat-title" className="font-semibold text-slate-900">
              Ask TaskPilot AI
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Ask about this app or your tasks
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Hi! I can answer questions about TaskPilot and help you understand
              your tasks. I can’t answer unrelated questions or change tasks for
              you.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "ml-auto rounded-br-sm bg-violet-600 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-700"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isSending && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-500">
              Thinking…
            </div>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-200 p-3">
          <label htmlFor="taskpilot-chat-input" className="sr-only">
            Ask a question about TaskPilot or your tasks
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="taskpilot-chat-input"
              rows={1}
              maxLength={1200}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your tasks…"
              className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="h-11 rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Enter to send · Shift+Enter for a new line
          </p>
        </form>
      </section>
    </div>
  );
}
