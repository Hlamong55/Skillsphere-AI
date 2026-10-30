
import {
  FiFileText,
  FiLink,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import toast from "react-hot-toast";

const MAX_PDF_SIZE = 10 * 1024 * 1024;

const PdfSourceField = ({
  mode,
  onModeChange,
  file,
  onFileChange,
  disabled = false,
}) => {
  // ========================================
  // SELECT AND VALIDATE PDF
  // ========================================

  const handleFileSelect = (event) => {
    const selectedFile =
      event.target.files?.[0];

    // Allow selecting the same file again
    event.target.value = "";

    if (!selectedFile || disabled) return;

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      toast.error(
        "Only valid PDF files are allowed."
      );
      return;
    }

    if (selectedFile.size === 0) {
      toast.error(
        "Cannot upload an empty PDF."
      );
      return;
    }

    if (selectedFile.size > MAX_PDF_SIZE) {
      toast.error(
        "PDF must be 10 MB or smaller."
      );
      return;
    }

    onFileChange(selectedFile);
  };

  return (
    <div className="space-y-3">

      {/* PDF SOURCE LABEL */}
      <label className="block text-sm font-semibold text-gray-300">
        PDF Source *
      </label>

      {/* SOURCE OPTIONS */}
      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onModeChange("upload")
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${
            mode === "upload"
              ? "bg-indigo-600 text-white"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FiUploadCloud size={17} />
          Upload PDF
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onModeChange("url")
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${
            mode === "url"
              ? "bg-indigo-600 text-white"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FiLink size={17} />
          Use URL
        </button>
      </div>

      {/* LOCAL PDF FILE INPUT */}
      {mode === "upload" ? (
        <div className="rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <FiFileText
                size={25}
                className="text-indigo-300"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Choose PDF from Computer
              </p>

              <p className="mt-1 text-xs text-gray-400">
                PDF only · Maximum 10 MB
              </p>
            </div>
          </div>

          <input
            id="resource-pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            disabled={disabled}
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:cursor-pointer disabled:opacity-50"
          />

          {/* SELECTED FILE DETAILS */}
          {file && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">

              <div className="min-w-0 flex-1">

                <p className="break-all text-sm font-medium text-emerald-300">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {(
                    file.size /
                    (1024 * 1024)
                  ).toFixed(2)} MB
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  onFileChange(null)
                }
                disabled={disabled}
                aria-label="Remove selected PDF"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Enter a PDF or Google Drive URL below.
        </p>
      )}

    </div>
  );
};

export default PdfSourceField;
