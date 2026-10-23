
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
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

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

const emptyForm = {
  title: "",
  description: "",
  category: "Web Development",
  type: "tutorial",
  url: "",
  content: "",
};

const getYoutubeEmbed = (link) => {
  try {
    const url = new URL(link);

    let id = "";

    if (
      url.hostname === "youtu.be" ||
      url.hostname === "www.youtu.be"
    ) {
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
        url.pathname.startsWith("/embed/")
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

const ResourceCard = ({ resource, onRated }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const average = resource.averageRating || 0;
  const count = resource.ratingsCount || 0;

  const handleRate = async (value) => {
    if (saving) return;

    try {
      setSaving(true);

      const { data } = await api.put(
        `/resources/${resource._id}/rate`,
        { rating: value }
      );

      setSelectedRating(data.userRating);

      toast.success("Rating saved successfully!");
      onRated?.(resource._id, data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Please log in to rate this resource."
      );
    } finally {
      setSaving(false);
    }
  };

  const youtubeEmbed =
    resource.type === "video"
      ? getYoutubeEmbed(resource.url)
      : null;

  const Icon =
    resource.type === "video"
      ? FiYoutube
      : resource.type === "pdf"
      ? FiFileText
      : FiBookOpen;

  return (
    <article className="rounded-2xl overflow-hidden border border-white/10 bg-[#121A2B] hover:border-indigo-500/30 transition-all shadow-xl">
      <div className="p-5 space-y-4">

        {/* TYPE AND CATEGORY */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase">
            <Icon size={17} />
            {resource.type}
          </span>

          <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {resource.category}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {resource.title}
          </h3>

          <p className="text-gray-400 text-sm mt-2 line-clamp-3">
            {resource.description}
          </p>
        </div>

        {/* YOUTUBE EMBED */}
        {youtubeEmbed && (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={youtubeEmbed}
              title={resource.title}
              loading="lazy"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}

        {/* TUTORIAL CONTENT */}
        {resource.type === "tutorial" && resource.content && (
          <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-5 bg-white/5 rounded-xl p-3">
            {resource.content}
          </p>
        )}

        {/* EXTERNAL LINK */}
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
          >
            <FiExternalLink />
            {resource.type === "pdf"
              ? "Open PDF"
              : resource.type === "video"
              ? "Watch Video"
              : "Open Tutorial"}
          </a>
        )}


        <div className="pt-4 border-t border-white/10">

          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">
            {selectedRating
              ? `Your rating: ${selectedRating}/5`
              : "Select a star to rate this resource"}
            </p>

            <p className="text-xs text-gray-500">
            Shared by{" "}
            <span className="text-gray-300">
              {resource.createdBy?.name || "Unknown User"}
            </span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={saving}
                  onClick={() => handleRate(star)}
                  aria-label={`Rate ${star} stars`}
                  title={`Rate ${star} stars`}
                  className="p-1 transition-transform hover:scale-125 disabled:opacity-50"
                >
                  <FiStar
                    size={21}
                    className={
                      star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-500 hover:text-amber-400"
                    }
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              {saving && <FiLoader className="animate-spin" />}
              <FiStar className="text-amber-400" />
              <span className="font-semibold text-white">
                {Number(average).toFixed(1)}
              </span>
              <span>({count})</span>
            </div>
          </div>

        </div>
      </div>
    </article>
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
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();

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
      toast.error("Please provide tutorial content or URL.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/resources", form);

      toast.success("Learning resource created!");

      setForm({ ...emptyForm });
      setShowCreate(false);

      setPage(1);
      setSearch("");
      setCategory("All");
      setType("all");
      setReload((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
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
              <FiBookOpen />
              SKILLSPHERE LEARNING
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Learning Resource Hub
            </h1>

            <p className="text-gray-400 mt-3">
              Discover tutorials, YouTube lessons and PDF materials.
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

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111827] rounded-2xl border border-white/10 p-4 mb-8">

          <div className="flex items-center gap-3 bg-[#0B1120] border border-white/10 rounded-xl px-4">
            <FiSearch className="text-indigo-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search learning resources..."
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
                {item === "All" ? "All Categories" : item}
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

        {/* RESOURCE RESULTS */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-indigo-300">
            <FiLoader className="animate-spin" size={24} />
            Loading resources...
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-20">
            {error}
          </p>
        ) : resources.length === 0 ? (
          <div className="text-center bg-[#111827] border border-white/10 rounded-3xl px-5 py-20">
            <FiBookOpen
              size={44}
              className="mx-auto text-indigo-400 mb-5"
            />

            <h2 className="text-xl font-bold text-white">
              No resources found
            </h2>

            <p className="text-gray-400 mt-2">
              Try another filter or share a learning resource.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onRated={(resourceId, ratingData) => {
                  setResources((prev) =>
                    prev.map((item) =>
                      item._id === resourceId
                        ? {
                            ...item,
                            averageRating: ratingData.averageRating,
                            ratingsCount: ratingData.ratingsCount,
                          }
                        : item
                    )
                  );
                }}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => p + 1)}
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add Learning Resource"
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-white/10 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                Add Learning Resource
              </h2>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <FiX size={23} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Resource Title
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. React JS Beginner Tutorial"
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

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
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Briefly describe what users will learn..."
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        category: e.target.value,
                      }))
                    }
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white"
                  >
                    {categories.filter((x) => x !== "All").map((x) => (
                      <option key={x} value={x}>{x}</option>
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
                      setForm((p) => ({
                        ...p,
                        type: e.target.value,
                        url: "",
                        content: "",
                      }))
                    }
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="video">YouTube Video</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  {form.type === "video"
                    ? "YouTube Video URL"
                    : form.type === "pdf"
                    ? "PDF URL"
                    : "Tutorial URL (optional)"}
                </label>

                <input
                  type="url"
                  required={form.type !== "tutorial"}
                  value={form.url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              {form.type === "tutorial" && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Tutorial Content
                  </label>
                  <textarea
                    rows={5}
                    value={form.content}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your tutorial here..."
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Publish Resource
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You must be logged in to publish resources.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Resources;
