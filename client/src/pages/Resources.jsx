
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

// -------------------- CONFIG --------------------

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

// -------------------- YOUTUBE HELPER --------------------

const getYoutubeEmbed = (link) => {
  try {
    const url = new URL(link);
    let id = "";

    if (
      ["youtu.be", "www.youtu.be"].includes(url.hostname)
    ) {
      id = url.pathname.split("/")[1];
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
      ].includes(url.hostname)
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

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id || "")) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
};

// -------------------- RATING COMPONENT --------------------

const ResourceRating = ({ resource, onRated }) => {
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratingError, setRatingError] = useState("");

  // Load logged-in user's previous rating
  useEffect(() => {
    let cancelled = false;

    const loadRating = async () => {
      try {
        const { data } = await api.get(
          `/resources/${resource._id}/my-rating`
        );

        if (!cancelled) {
          setMyRating(data.userRating || 0);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.response?.status === 401) {
            setRatingError("Login to rate.");
          } else {
            setRatingError("Could not load your rating.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRating();

    return () => {
      cancelled = true;
    };
  }, [resource._id]);

  const handleRate = async (value) => {
    if (loading || saving) return;

    try {
      setSaving(true);
      setRatingError("");

      const { data } = await api.put(
        `/resources/${resource._id}/rate`,
        { rating: value }
      );

      setMyRating(data.userRating || value);

      onRated(resource._id, data);

      toast.success(`${value}-Star Rating Saved!`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Could not save rating."
      );
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

        <span className="text-xs text-gray-500">
          Average Rating
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="flex items-center "
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
          {saving && (
            <FiLoader className="animate-spin text-indigo-400" />
          )}

          <FiStar className="text-amber-400" />

          <span className="font-bold text-white">
            {Number(resource.averageRating || 0).toFixed(1)}
          </span>

          <span className="text-gray-400">
            ({resource.ratingsCount || 0})
          </span>
        </div>
      </div>

      {ratingError && (
        <p className="text-xs text-amber-400">
          {ratingError}
        </p>
      )}
    </div>
  );
};



// -------------------- MEDIA PREVIEW --------------------

const ResourcePreview = ({ resource }) => {
  const isVideo = resource.type === "video";
  const isPdf = resource.type === "pdf";

  const embedUrl = isVideo
    ? getYoutubeEmbed(resource.url)
    : null;

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
          <p className="text-sm text-purple-200">
            Video Learning Resource
          </p>
        </div>
      ) : isPdf ? (
        <div className="w-full h-full bg-linear-to-br from-blue-950 via-[#16284B] to-[#0B1120] flex flex-col items-center justify-center gap-3">

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-400/20">
            <FiFileText
              size={33}
              className="text-blue-300"
            />
          </div>

          <h4 className="text-blue-100 font-bold">
            PDF Document
          </h4>

          <p className="text-blue-300/70 text-xs">
            Study Notes & Learning Materials
          </p>
        </div>
      ) : (
        <div className="w-full h-full bg-linear-to-br from-emerald-950 via-[#123B3C] to-[#0B1120] flex flex-col items-center justify-center gap-3">

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-400/20">
            <FiBookOpen
              size={33}
              className="text-emerald-300"
            />
          </div>

          <h4 className="text-emerald-100 font-bold">
            Written Tutorial
          </h4>

          <p className="text-emerald-300/70 text-xs">
            Improve Your Skills
          </p>
        </div>
      )}
    </div>
  );
};


// -------------------- RESOURCE CARD --------------------

const ResourceCard = ({ resource, onRated }) => {
  const isVideo = resource.type === "video";
  const isPdf = resource.type === "pdf";
  const isTutorial = resource.type === "tutorial";

  const TypeIcon = isVideo
    ? FiYoutube
    : isPdf
    ? FiFileText
    : FiBookOpen;

  return (
    <article className="flex flex-col h-full min-h-137.5 rounded-2xl overflow-hidden border border-white/10 bg-[#121A2B] hover:border-indigo-500/40 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)] transition-all duration-300">

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <span className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase">
            <TypeIcon size={17} />
            {resource.type}
          </span>

          <span className="px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs truncate max-w-[60%]">
            {resource.category}
          </span>
        </div>

        {/* TITLE */}
        <div className="min-h-18">
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {resource.title}
          </h3>

          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {resource.description}
          </p>
        </div>

        {/* EQUAL MEDIA AREA */}
        <ResourcePreview resource={resource} />

        {/* TUTORIAL SNIPPET / RESOURCE LINK */}
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

              {isPdf
                ? "Open PDF"
                : isVideo
                ? "Watch Video"
                : "Open Tutorial"}
            </a>
          )}
        </div>

        {/* BOTTOM FIXED SECTION */}
        <div className="mt-auto space-y-3">
          <p className="text-xs text-gray-500">
            Shared by{" "}
            <span className="text-gray-200 font-semibold">
              {resource.createdBy?.name || "Unknown User"}
            </span>
          </p>

          <ResourceRating
            resource={resource}
            onRated={onRated}
          />
        </div>
      </div>
    </article>
  );
};


// -------------------- ADD RESOURCE MODAL --------------------

const AddResourceModal = ({
  form,
  setForm,
  submitting,
  onClose,
  onSubmit,
}) => {
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Learning Resource"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-white/10 shadow-2xl"
      >

        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#111827] border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Add Learning Resource
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Share knowledge with the community.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">

          {/* TITLE */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Resource Title
            </label>

            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(e) =>
                updateField("title", e.target.value)
              }
              placeholder="e.g. React JS Beginner Tutorial"
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Description
            </label>

            <textarea
              required
              maxLength={2000}
              rows={3}
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Describe what students will learn..."
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* CATEGORY & TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white"
              >
                {categories
                  .filter((item) => item !== "All")
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Resource Type
              </label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                    url: "",
                    content: "",
                  }))
                }
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white"
              >
                <option value="tutorial">Tutorial</option>
                <option value="video">YouTube Video</option>
                <option value="pdf">PDF Resource</option>
              </select>
            </div>
          </div>

          {/* RESOURCE URL */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              {form.type === "video"
                ? "YouTube Video URL"
                : form.type === "pdf"
                ? "PDF / Google Drive URL"
                : "Tutorial URL (Optional)"}
            </label>

            <input
              type="url"
              required={form.type !== "tutorial"}
              value={form.url}
              onChange={(e) =>
                updateField("url", e.target.value)
              }
              placeholder="https://..."
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
            />

            {form.type === "pdf" && (
              <p className="text-xs text-gray-500 mt-2">
                Google Drive sharing must allow anyone
                with the link to view.
              </p>
            )}
          </div>

          {/* TUTORIAL CONTENT */}
          {form.type === "tutorial" && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Tutorial Content
              </label>

              <textarea
                rows={5}
                value={form.content}
                onChange={(e) =>
                  updateField("content", e.target.value)
                }
                placeholder="Write your tutorial here..."
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl py-3 text-white font-semibold hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <FiPlus size={19} />
                Publish Resource
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------- MAIN RESOURCES PAGE --------------------

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



  // LOAD RESOURCES
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (category !== "All") {
          params.category = category;
        }

        if (type !== "all") {
          params.type = type;
        }

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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, type, page, reload]);

  // UPDATE RATINGS IN STATE
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

  // CREATE RESOURCE
  const handleCreate = async (event) => {
    event.preventDefault();

    if (
      (form.type === "video" || form.type === "pdf") &&
      !form.url.trim()
    ) {
      toast.error("Please provide a resource URL.");
      return;
    }

    if (
      form.type === "tutorial" &&
      !form.content.trim() &&
      !form.url.trim()
    ) {
      toast.error("Provide tutorial content or a URL.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/resources", {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        content: form.content.trim(),
      });

      toast.success("Learning resource created!");

      setForm({ ...initialForm });
      setShowCreate(false);

      setPage(1);
      setSearch("");
      setCategory("All");
      setType("all");
      setReload((value) => value + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to create resource."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1120]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* PAGE HEADER */}
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
              Discover tutorials, YouTube lessons
              and PDF learning materials.
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

        {/* SEARCH AND FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111827] rounded-2xl border border-white/10 p-4 mb-8">

          <div className="flex items-center gap-3 bg-[#0B1120] border border-white/10 rounded-xl px-4">
            <FiSearch className="text-indigo-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search resources..."
              className="w-full py-3 bg-transparent outline-none text-white placeholder:text-gray-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All Categories"
                  : item}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
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

        {/* LOADING / ERROR / EMPTY */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-indigo-300">
            <FiLoader
              className="animate-spin"
              size={24}
            />
            Loading resources...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-3 py-20 text-red-400">
            <FiAlertCircle size={22} />
            {error}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center bg-[#111827] border border-white/10 rounded-3xl px-5 py-20">
            <FiBookOpen
              size={44}
              className="mx-auto text-indigo-400 mb-5"
            />

            <h2 className="text-xl font-bold text-white">
              No Resources Found
            </h2>

            <p className="text-gray-400 mt-2">
              Try another filter or share a learning resource.
            </p>
          </div>
        ) : (
          /* EQUAL HEIGHT GRID */
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

        {/* PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
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
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/10"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* CREATE RESOURCE MODAL */}
      {showCreate && (
        <AddResourceModal
          form={form}
          setForm={setForm}
          submitting={submitting}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
};

export default Resources;
