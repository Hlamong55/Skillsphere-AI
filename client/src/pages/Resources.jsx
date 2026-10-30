
import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiSearch,
  FiPlus,
  FiStar,
  FiYoutube,
  FiFileText,
  FiExternalLink,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import PdfSourceField from "../components/resources/PdfSourceField";

const categories = [
  "All",
  "Web Development",
  "Programming",
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Database",
  "Others",
];

const initialForm = {
  title: "",
  description: "",
  category: "Web Development",
  type: "tutorial",
  url: "",
  content: "",
};

const PDF_PATH_PATTERN = /^\/uploads\/pdf\/[a-f0-9]{32}\.pdf$/i;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const getYoutubeEmbed = (link) => {
  try {
    const url = new URL(link);
    let id = "";

    if (["youtu.be", "www.youtu.be"].includes(url.hostname)) {
      id = url.pathname.split("/")[1];
    } else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
        url.hostname
      )
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else if (
        url.pathname.startsWith("/shorts/") ||
        url.pathname.startsWith("/embed/") ||
        url.pathname.startsWith("/live/")
      ) {
        id = url.pathname.split("/")[2];
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id || "")
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
};

// Existing per-user rating behaviour stays unchanged.
const ResourceRating = ({ resource, onRated }) => {
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadRating = async () => {
      try {
        const { data } = await api.get(
          `/resources/${resource._id}/my-rating`
        );
        if (!cancelled) setMyRating(data.userRating || 0);
      } catch (error) {
        if (!cancelled) {
          setRatingError(
            error.response?.status === 401
              ? "Login to rate."
              : "Could not load your rating."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadRating();
    return () => { cancelled = true; };
  }, [resource._id]);

  const handleRate = async (value) => {
    if (loading || saving) return;
    try {
      setSaving(true);
      setRatingError("");
      const { data } = await api.put(`/resources/${resource._id}/rate`, {
        rating: value,
      });
      setMyRating(data.userRating || value);
      onRated(resource._id, data);
      toast.success(`${value}-Star Rating Saved!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save rating.");
    } finally {
      setSaving(false);
    }
  };

  const activeRating = hoverRating || myRating;

  return (
    <div className="border-t border-white/10 pt-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          {loading
            ? "Loading your rating..."
            : myRating
              ? `Your Rating: ${myRating}/5`
              : "Rate this resource"}
        </span>
        <span className="text-xs text-gray-500">Average Rating</span>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="flex items-center"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={loading || saving}
              onMouseEnter={() => setHoverRating(star)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              title={`Rate ${star} Stars`}
              aria-label={`Rate ${star} Stars`}
              aria-pressed={myRating === star}
              className="p-1 transition-all duration-200 hover:scale-125 disabled:opacity-50"
            >
              <FiStar
                size={20}
                className={
                  star <= activeRating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-500 hover:text-amber-400"
                }
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {saving && <FiLoader className="animate-spin text-indigo-400" />}
          <FiStar className="text-amber-400" />
          <span className="font-bold text-white">
            {Number(resource.averageRating || 0).toFixed(1)}
          </span>
          <span className="text-gray-400">
            ({resource.ratingsCount || 0})
          </span>
        </div>
      </div>
      {ratingError && <p className="text-xs text-amber-400">{ratingError}</p>}
    </div>
  );
};

const ResourcePreview = ({ resource }) => {
  const isVideo = resource.type === "video";
  const isPdf = resource.type === "pdf";
  const embedUrl = isVideo ? getYoutubeEmbed(resource.url) : null;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#0B1120] shrink-0">
      {isVideo && embedUrl ? (
        <iframe
          src={embedUrl}
          title={resource.title}
          loading="lazy"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : isVideo ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-linear-to-br from-purple-950 to-[#0B1120]">
          <FiYoutube size={44} className="text-purple-300" />
          <p className="text-sm text-purple-200">Video Learning Resource</p>
        </div>
      ) : isPdf ? (
        <div className="w-full h-full bg-linear-to-br from-blue-950 via-[#16284B] to-[#0B1120] flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-400/20">
            <FiFileText size={33} className="text-blue-300" />
          </div>
          <h4 className="text-blue-100 font-bold">PDF Document</h4>
          <p className="text-blue-300/70 text-xs">Study Notes & Learning Materials</p>
        </div>
      ) : (
        <div className="w-full h-full bg-linear-to-br from-emerald-950 via-[#123B3C] to-[#0B1120] flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-400/20">
            <FiBookOpen size={33} className="text-emerald-300" />
          </div>
          <h4 className="text-emerald-100 font-bold">Written Tutorial</h4>
          <p className="text-emerald-300/70 text-xs">Improve Your Skills</p>
        </div>
      )}
    </div>
  );
};

const ResourceCard = ({ resource, onRated }) => {
  const isVideo = resource.type === "video";
  const isPdf = resource.type === "pdf";
  const isTutorial = resource.type === "tutorial";
  const TypeIcon = isVideo ? FiYoutube : isPdf ? FiFileText : FiBookOpen;

  return (
    <article className="flex flex-col h-full min-h-137.5 rounded-2xl overflow-hidden border border-white/10 bg-[#121A2B] hover:border-indigo-500/40 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)] transition-all duration-300">
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex items-center justify-between gap-2 pb-1">
          <span className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase">
            <TypeIcon size={17} />
            {resource.type}
          </span>
          <span className="px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs truncate max-w-[60%]">
            {resource.category}
          </span>
        </div>
        <div className="min-h-18">
          <h3 className="text-xl font-bold text-white line-clamp-2">{resource.title}</h3>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {resource.description}
          </p>
        </div>
        <ResourcePreview resource={resource} />
        <div className="min-h-14.5">
          {isTutorial && resource.content && (
            <p className="text-gray-300 text-sm line-clamp-2 bg-white/5 rounded-lg px-3 py-2">
              {resource.content}
            </p>
          )}
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <FiExternalLink size={15} />
              {isPdf ? "Open PDF" : isVideo ? "Watch Video" : "Open Tutorial"}
            </a>
          )}
        </div>
        <div className="mt-auto space-y-3">
          <p className="text-xs text-gray-500">
            Shared by{" "}
            <span className="text-gray-200 font-semibold">
              {resource.createdBy?.name || "Unknown User"}
            </span>
          </p>
          <ResourceRating resource={resource} onRated={onRated} />
        </div>
      </div>
    </article>
  );
};

const AddResourceModal = ({
  form,
  setForm,
  submitting,
  onClose,
  onSubmit,
  pdfMode,
  pdfFile,
  onPdfModeChange,
  onPdfFileChange,
  onResetPdfSource,
  uploadStage,
  uploadProgress,
}) => {
  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Learning Resource"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-white/10 shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#111827] border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Learning Resource</h2>
            <p className="text-sm text-gray-400 mt-1">Share knowledge with the community.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="resource-title" className="block text-sm text-gray-300 mb-2">
              Resource Title
            </label>
            <input
              id="resource-title"
              required
              maxLength={150}
              disabled={submitting}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. React JS Beginner Tutorial"
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="resource-description" className="block text-sm text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="resource-description"
              required
              maxLength={2000}
              rows={3}
              disabled={submitting}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe what students will learn..."
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resource-category" className="block text-sm text-gray-300 mb-2">
                Category
              </label>
              <select
                id="resource-category"
                disabled={submitting}
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white disabled:opacity-50"
              >
                {categories.filter((item) => item !== "All").map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="resource-type" className="block text-sm text-gray-300 mb-2">
                Resource Type
              </label>
              <select
                id="resource-type"
                disabled={submitting}
                value={form.type}
                onChange={(event) => {
                  setForm((previous) => ({
                    ...previous,
                    type: event.target.value,
                    url: "",
                    content: "",
                  }));
                  onResetPdfSource();
                }}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white disabled:opacity-50"
              >
                <option value="tutorial">Tutorial</option>
                <option value="video">YouTube Video</option>
                <option value="pdf">PDF Resource</option>
              </select>
            </div>
          </div>

          {form.type === "pdf" && (
            <PdfSourceField
              mode={pdfMode}
              file={pdfFile}
              onModeChange={onPdfModeChange}
              onFileChange={onPdfFileChange}
              disabled={submitting}
            />
          )}

          {(form.type !== "pdf" || pdfMode === "url") && (
            <div>
              <label htmlFor="resource-url" className="block text-sm text-gray-300 mb-2">
                {form.type === "video"
                  ? "YouTube Video URL"
                  : form.type === "pdf"
                    ? "PDF / Google Drive URL"
                    : "Tutorial URL (Optional)"}
              </label>
              <input
                id="resource-url"
                type="url"
                required={form.type !== "tutorial"}
                disabled={submitting}
                value={form.url}
                onChange={(event) => updateField("url", event.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              {form.type === "pdf" && (
                <p className="text-xs text-gray-500 mt-2">
                  Google Drive sharing must allow anyone with the link to view.
                </p>
              )}
            </div>
          )}

          {form.type === "tutorial" && (
            <div>
              <label htmlFor="resource-content" className="block text-sm text-gray-300 mb-2">
                Tutorial Content
              </label>
              <textarea
                id="resource-content"
                rows={5}
                disabled={submitting}
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                placeholder="Write your tutorial here..."
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
              />
            </div>
          )}

          {submitting && uploadStage && (
            <div role="status" className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                <FiLoader className="animate-spin" />
                {uploadStage === "uploading" ? "Uploading PDF..." : "Publishing Resource..."}
              </div>
              {uploadStage === "uploading" && (
                <>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-indigo-300">{uploadProgress}%</p>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl py-3 text-white font-semibold hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <><FiLoader className="animate-spin" /> Publishing...</>
            ) : (
              <><FiPlus size={19} /> Publish Resource</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [pdfMode, setPdfMode] = useState("url");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStage, setUploadStage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetPdfSource = () => {
    setPdfMode("url");
    setPdfFile(null);
  };

  const changePdfMode = (mode) => {
    setPdfMode(mode);
    if (mode === "url") setPdfFile(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page };
        if (search.trim()) params.search = search.trim();
        if (category !== "All") params.category = category;
        if (type !== "all") params.type = type;

        const { data } = await api.get("/resources", {
          params,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setResources(data.resources || []);
          setTotalPages(data.pages || 0);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Failed to load learning resources.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, type, page, reload]);

  const handleRated = (resourceId, data) => {
    setResources((previous) =>
      previous.map((item) =>
        item._id === resourceId
          ? {
              ...item,
              averageRating: data.averageRating,
              ratingsCount: data.ratingsCount,
            }
          : item
      )
    );
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and Description are required.");
      return;
    }
    if (form.type === "video" && !form.url.trim()) {
      toast.error("Please provide a YouTube Video URL.");
      return;
    }
    if (form.type === "pdf" && pdfMode === "url" && !form.url.trim()) {
      toast.error("Please provide a PDF URL.");
      return;
    }
    if (form.type === "pdf" && pdfMode === "upload" && !pdfFile) {
      toast.error("Please select a PDF file.");
      return;
    }
    if (form.type === "tutorial" && !form.content.trim() && !form.url.trim()) {
      toast.error("Provide tutorial content or a URL.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(0);
      let finalResourceUrl = form.url.trim();

      if (form.type === "pdf" && pdfMode === "upload") {
        if (
          pdfFile.type !== "application/pdf" ||
          !pdfFile.name.toLowerCase().endsWith(".pdf") ||
          pdfFile.size === 0 ||
          pdfFile.size > MAX_PDF_BYTES
        ) {
          throw new Error("Invalid PDF file. Maximum size is 10 MB.");
        }

        const uploadData = new FormData();
        uploadData.append("file", pdfFile);
        setUploadStage("uploading");

        const { data } = await api.post("/uploads/pdf", uploadData, {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(Math.min(percent, 100));
          },
        });

        if (
          typeof data?.filePath !== "string" ||
          !PDF_PATH_PATTERN.test(data.filePath)
        ) {
          throw new Error("Upload API returned an invalid PDF path.");
        }

        // A leading / makes this resolve to the backend origin (port 5001).
        finalResourceUrl = new URL(data.filePath, api.defaults.baseURL).href;
      }

      setUploadStage("publishing");
      await api.post("/resources", {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        url: finalResourceUrl,
        content: form.content.trim(),
      });

      toast.success("Learning resource created!");
      setForm({ ...initialForm });
      resetPdfSource();
      setShowCreate(false);
      setPage(1);
      setSearch("");
      setCategory("All");
      setType("all");
      setReload((value) => value + 1);
    } catch (error) {
      console.error("Create Resource Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create resource."
      );
    } finally {
      setSubmitting(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-9">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2">
              <FiBookOpen size={18} />
              SKILLSPHERE LEARNING
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Learning Resource Hub
            </h1>
            <p className="text-gray-400 mt-3">
              Discover tutorials, YouTube lessons and PDF learning materials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] transition-all rounded-xl px-6 py-3 font-semibold text-white"
          >
            <FiPlus size={20} />
            Add Resource
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111827] rounded-2xl border border-white/10 p-4 mb-8">
          <div className="flex items-center gap-3 bg-[#0B1120] border border-white/10 rounded-xl px-4">
            <FiSearch className="text-indigo-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search resources..."
              className="w-full py-3 bg-transparent outline-none text-white placeholder:text-gray-500"
            />
          </div>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
            className="bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="all">All Resource Types</option>
            <option value="tutorial">Tutorials</option>
            <option value="video">YouTube Videos</option>
            <option value="pdf">PDF Resources</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-indigo-300">
            <FiLoader className="animate-spin" size={24} />
            Loading resources...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-3 py-20 text-red-400">
            <FiAlertCircle size={22} />
            {error}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center bg-[#111827] border border-white/10 rounded-3xl px-5 py-20">
            <FiBookOpen size={44} className="mx-auto text-indigo-400 mb-5" />
            <h2 className="text-xl font-bold text-white">No Resources Found</h2>
            <p className="text-gray-400 mt-2">
              Try another filter or share a learning resource.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onRated={handleRated}
              />
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/10"
            >
              <FiChevronLeft />
              Previous
            </button>
            <span className="text-gray-300 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/10"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <AddResourceModal
          form={form}
          setForm={setForm}
          submitting={submitting}
          onClose={() => {
            if (submitting) return;
            setShowCreate(false);
            resetPdfSource();
          }}
          onSubmit={handleCreate}
          pdfMode={pdfMode}
          pdfFile={pdfFile}
          onPdfModeChange={changePdfMode}
          onPdfFileChange={setPdfFile}
          onResetPdfSource={resetPdfSource}
          uploadStage={uploadStage}
          uploadProgress={uploadProgress}
        />
      )}
    </main>
  );
};

export default Resources;
