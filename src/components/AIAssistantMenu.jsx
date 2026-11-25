import { useState } from "react";
import { generateTaskReport } from "../services/aiService.js";
import TaskReportModal from "./TaskReportModal.jsx";
import AIChatModal from "./AIChatModal.jsx";

const aiOptions = [
  { id: "report", label: "Task report", icon: "📊", right: 4, bottom: 99 },
  {
    id: "priority",
    label: "Prioritize tasks",
    icon: "⚡",
    right: 52,
    bottom: 86,
  },
  { id: "plan", label: "Daily plan", icon: "🗓️", right: 86, bottom: 52 },
  { id: "chat", label: "Ask AI", icon: "💬", right: 99, bottom: 4 },
];

export default function AIAssistantMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState("");
  const [reportError, setReportError] = useState("");

  async function handleTaskReport() {
    setIsOpen(false);
    setMessage("");
    setIsReportModalOpen(true);
    setIsGenerating(true);
    setReport("");
    setReportError("");

    try {
      const result = await generateTaskReport();
      setReport(result.report);
    } catch (error) {
      setReportError(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 h-56 w-56">
        {isOpen &&
          aiOptions.map((option) => {
            const labelPosition =
              option.id === "report"
                ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
                : "right-14 top-1/2 -translate-y-1/2";

            return (
              <div
                key={option.id}
                className="group pointer-events-auto absolute z-10 hover:z-50 focus-within:z-50"
                style={{ right: option.right, bottom: option.bottom }}
              >
                <span
                  className={`pointer-events-none absolute whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-focus-within:opacity-100 ${labelPosition}`}
                >
                  {option.label}
                </span>

                <button
                  type="button"
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => {
                    if (option.id === "report") {
                      handleTaskReport();
                    } else if (option.id === "chat") {
                      setIsOpen(false);
                      setMessage("");
                      setIsChatOpen(true);
                    } else {
                      setMessage(
                        `${option.label} will be connected in a later step.`,
                      );
                    }
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white text-xl shadow-lg transition hover:scale-110 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {option.icon}
                </button>
              </div>
            );
          })}

        {message && isOpen && (
          <p className="pointer-events-auto absolute bottom-16 right-0 max-w-48 rounded-2xl bg-white px-3 py-2 text-xs text-slate-600 shadow-lg">
            {message}
          </p>
        )}

        <button
          type="button"
          aria-label={
            isOpen ? "Close AI assistant menu" : "Open AI assistant menu"
          }
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((open) => !open);
            setMessage("");
          }}
          className="pointer-events-auto absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-violet-700"
        >
          🧠
        </button>
      </div>

      {isReportModalOpen && (
        <TaskReportModal
          report={report}
          isLoading={isGenerating}
          error={reportError}
          onClose={() => setIsReportModalOpen(false)}
          onRetry={handleTaskReport}
        />
      )}
      {isChatOpen && <AIChatModal onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
