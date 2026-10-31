
import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Link,
  Navigate,
} from "react-router-dom";

import {
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";

import api from "../services/api";

import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/feed/PostCard";

const SavedPosts = () => {
  const { user: authUser } =
    useContext(AuthContext);

  const currentUser =
    authUser?.user || authUser;

  const currentUserId = String(
    currentUser?._id ||
    currentUser?.id ||
    ""
  );

  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // ========================================
  // FETCH SAVED POSTS
  // ========================================

  useEffect(() => {
    if (!currentUserId) return;

    const controller =
      new AbortController();

    const loadSavedPosts = async () => {
      try {
        const { data } = await api.get(
          "/saved-posts",
          {
            params: {
              page,
            },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) {
          return;
        }

        setPosts(
          Array.isArray(data.posts)
            ? data.posts
            : []
        );

        setTotalPages(data.pages || 0);
        setTotal(data.total || 0);

        setError("");

      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(
            "Saved Posts Fetch Error:",
            err
          );

          setError(
            err.response?.data?.message ||
            "Unable to load saved posts."
          );
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadSavedPosts();

    return () => {
      controller.abort();
    };

  }, [currentUserId, page, reloadKey]);

  // ========================================
  // REFRESH SAVED POSTS
  // ========================================

  const handleRefresh = () => {
    setLoading(true);
    setError("");

    setReloadKey(
      (previous) => previous + 1
    );
  };

  // ========================================
  // PAGINATION
  // ========================================

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setLoading(true);
    setError("");

    setPage(newPage);
  };

  // ========================================
  // POST BOOKMARK CHANGE
  // ========================================

  const handleBookmarkChange = (
    isSaved
  ) => {
    // Save actions elsewhere do not require
    // changes on this page.
    if (isSaved) return;

    // If last post on a page was removed,
    // navigate to previous page.
    if (
      posts.length === 1 &&
      page > 1
    ) {
      handlePageChange(page - 1);
      return;
    }

    // Reload current page so the removed
    // post disappears from the saved list.
    handleRefresh();
  };

  // ========================================
  // AUTHENTICATION
  // ========================================

  if (!currentUserId) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ========================================
  // PAGE UI
  // ========================================

  return (
    <main className="min-h-screen bg-[#0B1120] text-white">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* BACK NAVIGATION */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-300 hover:underline transition"
        >
          <FiArrowLeft size={17} />
          Back to Feed
        </Link>

        {/* HEADER */}
        <div className="mt-7  rounded-3xl border border-white/10 bg-[#111827] p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                <FiBookmark
                  size={27}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  My Saved Posts
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                  Your bookmarked community posts.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 disabled:opacity-50"
            >
              <FiRefreshCw
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

          </div>

          {!loading && !error && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm text-gray-400">
                Total Saved Posts
              </p>

              <p className="mt-1 text-3xl font-bold text-indigo-300">
                {total}
              </p>
            </div>
          )}

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#111827] py-24 text-indigo-300">
            <FiLoader className="animate-spin" size={23} />
            Loading saved posts...
          </div>

        ) : error ? (

          /* ERROR */
          <div
            role="alert"
            className="rounded-2xl border border-red-500/20 bg-[#111827] px-6 py-14 text-center"
          >
            <FiAlertCircle
              size={33}
              className="mx-auto text-red-400"
            />

            <h2 className="mt-4 text-lg font-bold">
              Unable to Load Saved Posts
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500"
            >
              Try Again
            </button>
          </div>

        ) : posts.length === 0 ? (

          /* EMPTY STATE */
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <FiBookmark
                size={30}
                className="text-indigo-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              No Saved Posts Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-400">
              Find interesting community posts and use
              the Save Post button to bookmark them.
            </p>

            <Link
              to="/feed"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
            >
              Explore Community Feed
            </Link>

          </div>

        ) : (

          /* SAVED POST LIST */
          <>
            <div className="mx-auto max-w-5xl mt-3 space-y-6">

              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onBookmarkChange={
                    handleBookmarkChange
                  }
                />
              ))}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(page - 1)
                  }
                  disabled={page <= 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(page + 1)
                  }
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                  <FiChevronRight />
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
};

export default SavedPosts;
