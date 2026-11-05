
import { useEffect, useState } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../../services/api";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

// ========================================
// FEED CONFIGURATION
// ========================================

const POSTS_PER_PAGE = 5;

// ========================================
// FEED CENTER
// ========================================

const FeedCenter = () => {
  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalPosts, setTotalPosts] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================
  // NEW: REFRESH TRIGGER
  // ======================================

  // Refresh the current page without
  // changing the selected page number.

  const [refreshKey, setRefreshKey] =
    useState(0);

  // ======================================
  // FETCH POSTS WITH PAGINATION
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          "/posts",
          {
            params: { page },
          }
        );

        if (cancelled) return;

        // --------------------------------
        // BACKEND PAGINATION DATA
        // --------------------------------

        const fetchedPosts =
          data.posts || [];

        const fetchedTotal =
          data.totalPosts || 0;

        const calculatedPages = Math.max(
          1,
          Math.ceil(
            fetchedTotal / POSTS_PER_PAGE
          )
        );

        const fetchedTotalPages = Math.max(
          1,
          data.pages || calculatedPages
        );

        // --------------------------------
        // HANDLE INVALID PAGE
        // --------------------------------

        // Example:
        // Current page = 3
        // Delete last post on page 3
        // Available pages become 2
        //
        // Automatically return to page 2.

        if (page > fetchedTotalPages) {
          setTotalPosts(fetchedTotal);
          setTotalPages(fetchedTotalPages);
          setPage(fetchedTotalPages);
          return;
        }

        // --------------------------------
        // UPDATE FEED STATE
        // --------------------------------

        setPosts(fetchedPosts);

        setTotalPages(
          fetchedTotalPages
        );

        setTotalPosts(
          fetchedTotal
        );

      } catch (err) {
        if (cancelled) return;

        console.error(
          "Fetch posts error:",
          err
        );

        setError(
          "Failed to load posts. Please try again."
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };

  }, [page, refreshKey]);

  // ======================================
  // ADD NEW POST
  // ======================================

  const addNewPost = (newPost) => {
    if (!newPost?._id) return;

    if (page === 1) {
      // Show newly created post instantly.

      setPosts((prev) => {
        const updated = [
          newPost,
          ...prev.filter(
            (post) =>
              post._id !== newPost._id
          ),
        ];

        return updated.slice(
          0,
          POSTS_PER_PAGE
        );
      });

      // Update total posts and pages.
      setTotalPosts((prev) => {
        const nextTotal = prev + 1;

        setTotalPages(
          Math.max(
            1,
            Math.ceil(
              nextTotal / POSTS_PER_PAGE
            )
          )
        );

        return nextTotal;
      });

    } else {
      // Return to first page to
      // display the newest post.

      setPage(1);
    }
  };

  // ======================================
  // NEW: HANDLE DELETED POST
  // ======================================

  const handlePostDeleted = (
    deletedPostId
  ) => {
    if (!deletedPostId) return;

    // ------------------------------------
    // STEP 1: REMOVE POST INSTANTLY
    // ------------------------------------

    setPosts((previousPosts) =>
      previousPosts.filter(
        (post) =>
          String(post._id) !==
          String(deletedPostId)
      )
    );

    // ------------------------------------
    // STEP 2: UPDATE TOTAL COUNT
    // ------------------------------------

    const nextTotalPosts = Math.max(
      0,
      totalPosts - 1
    );

    const nextTotalPages = Math.max(
      1,
      Math.ceil(
        nextTotalPosts / POSTS_PER_PAGE
      )
    );

    setTotalPosts(nextTotalPosts);

    setTotalPages(nextTotalPages);

    // ------------------------------------
    // STEP 3: FIX PAGE AFTER DELETION
    // ------------------------------------

    if (page > nextTotalPages) {
      // Last page is no longer valid.
      // Changing page triggers fetch.

      setPage(nextTotalPages);

    } else {
      // Stay on the current page.
      // Fetch again to fill empty space
      // and synchronize backend totals.

      setRefreshKey(
        (previous) => previous + 1
      );
    }
  };

  // ======================================
  // CHANGE PAGE
  // ======================================

  const changePage = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // VISIBLE PAGE NUMBERS
  // ======================================

  const getPageNumbers = () => {
    const numbers = [];

    const start = Math.max(
      1,
      page - 2
    );

    const end = Math.min(
      totalPages,
      page + 2
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      numbers.push(i);
    }

    return numbers;
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="space-y-6">

      {/* ==================================
          CREATE POST
      ================================== */}

      <CreatePost
        addNewPost={addNewPost}
      />

      {/* ==================================
          LOADING
      ================================== */}

      {loading ? (

        <div className="space-y-5">

          {[1, 2, 3].map((item) => (

            <div
              key={item}
              className="h-60 rounded-2xl border border-white/10 bg-white/3 animate-pulse"
            />

          ))}

        </div>

      ) : error ? (

        /* ==================================
            ERROR
        ================================== */

        <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-2xl p-5">

          <FiAlertCircle size={22} />

          <p>
            {error}
          </p>

        </div>

      ) : posts.length === 0 ? (

        /* ==================================
            EMPTY FEED
        ================================== */

        <div className="text-center p-10 rounded-2xl border border-white/10 bg-white/3">

          <p className="text-gray-400">
            No posts found.
          </p>

        </div>

      ) : (

        <>
          {/* ==================================
              POSTS
          ================================== */}

          <div className="space-y-6">

            {posts.map((post) => (

              <PostCard
                key={post._id}
                post={post}
                onDeleted={
                  handlePostDeleted
                }
              />

            ))}

          </div>

          {/* ==================================
              PAGINATION
          ================================== */}

          <div className="bg-[#111827] border border-white/10 rounded-2xl px-4 py-5 space-y-4">

            {/* PAGE INFO */}

            <div className="flex items-center justify-between text-xs text-gray-400">

              <span>
                Page {page} of {totalPages}
              </span>

              <span>
                {totalPosts} Total Posts
              </span>

            </div>

            {/* PAGE BUTTONS */}

            <div className="flex items-center justify-between gap-2">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  changePage(page - 1)
                }
                disabled={
                  page === 1
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >

                <FiChevronLeft
                  size={18}
                />

                <span className="hidden sm:inline">
                  Previous
                </span>

              </button>

              {/* PAGE NUMBERS */}

              <div className="flex items-center gap-1">

                {getPageNumbers().map(
                  (number) => (

                    <button
                      type="button"
                      key={number}
                      onClick={() =>
                        changePage(number)
                      }
                      aria-current={
                        number === page
                          ? "page"
                          : undefined
                      }
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                        number === page
                          ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {number}
                    </button>

                  )
                )}

              </div>

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  changePage(page + 1)
                }
                disabled={
                  page === totalPages
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >

                <span className="hidden sm:inline">
                  Next
                </span>

                <FiChevronRight
                  size={18}
                />

              </button>

            </div>

          </div>

        </>
      )}

    </div>
  );
};

export default FeedCenter;
