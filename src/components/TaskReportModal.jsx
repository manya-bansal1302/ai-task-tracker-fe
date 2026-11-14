import { jsPDF } from "jspdf";

export default function TaskReportModal({
  report,
  isLoading,
  error,
  onClose,
  onRetry,
}) {
  function handleDownloadPdf() {
    if (!report) return;

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const bottomMargin = 48;

    let y = margin;

    // Brand label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(124, 58, 237);
    pdf.text("TASKPILOT", margin, y);
    y += 26;

    // Report title
    pdf.setFontSize(22);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Weekly Focus Plan", margin, y);
    y += 22;

    // Date created
    const createdDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Prepared on ${createdDate}`, margin, y);
    y += 18;

    // Divider under the title
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 22;

    const sectionHeadings = [
      "WEEKLY FOCUS",
      "UPCOMING DEADLINES",
      "PROGRESS",
      "NEXT STEP",
    ];

    const reportLines = report
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of reportLines) {
      const heading = sectionHeadings.find(
        (item) => item === line.toUpperCase(),
      );

      if (heading) {
        y += 8;

        if (y > pageHeight - bottomMargin) {
          pdf.addPage();
          y = margin;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(109, 40, 217);
        pdf.text(heading, margin, y);
        y += 18;
        continue;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(51, 65, 85);

      const wrappedLines = pdf.splitTextToSize(line, contentWidth);

      for (const wrappedLine of wrappedLines) {
        if (y > pageHeight - bottomMargin) {
          pdf.addPage();
          y = margin;
        }

        pdf.text(wrappedLine, margin, y);
        y += 16;
      }

      y += 4;
    }

    pdf.save("taskpilot-weekly-focus-plan.pdf");
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-report-title"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="task-report-title"
            className="text-xl font-semibold text-slate-900"
          >
            AI task report
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task report"
            className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <p className="py-8 text-center text-slate-600">
            Generating your report…
          </p>
        )}

        {!isLoading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && report && (
          <>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 leading-7 text-slate-700">
              {report}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
              >
                Download PDF
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
