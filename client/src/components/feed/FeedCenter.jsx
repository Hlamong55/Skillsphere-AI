
import { useEffect, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../../services/api";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

const FeedCenter = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH POSTS WITH PAGINATION
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/posts", {
          params: { page },
        });

        if (cancelled) return;

        setPosts(data.posts || []);
        setTotalPages(Math.max(1, data.pages || 1));
        setTotalPosts(data.totalPosts || 0);
      } catch (err) {
        if (cancelled) return;

        console.error("Fetch posts error:", err);
        setError("Failed to load posts. Please try again.");
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
  }, [page]);

  // ADD NEW POST
  const addNewPost = (newPost) => {
    if (!newPost?._id) return;

    if (page === 1) {
      setPosts((prev) => {
        const updated = [
          newPost,
          ...prev.filter((post) => post._id !== newPost._id),
        ];

        return updated.slice(0, 5);
      });

      setTotalPosts((prev) => {
        const nextTotal = prev + 1;
        setTotalPages(Math.max(1, Math.ceil(nextTotal / 5)));
        return nextTotal;
      });
    } else {
      // Return to first page to display newest post
      setPage(1);
    }
  };

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

  // VISIBLE PAGE NUMBERS
  const getPageNumbers = () => {
    const numbers = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  };

  return (
    <div className="space-y-6">

      {/* CREATE POST */}
      <CreatePost addNewPost={addNewPost} />

      {/* LOADING */}
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
        <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-2xl p-5">
          <FiAlertCircle size={22} />
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-10 rounded-2xl border border-white/10 bg-white/3">
          <p className="text-gray-400">
            No posts found.
          </p>
        </div>
      ) : (
        <>
          {/* POSTS */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
              />
            ))}
          </div>

          {/* PAGINATION */}
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
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={18} />
                <span className="hidden sm:inline">
                  Previous
                </span>
              </button>

              {/* PAGE NUMBERS */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((number) => (
                  <button
                    type="button"
                    key={number}
                    onClick={() => changePage(number)}
                    aria-current={
                      number === page ? "page" : undefined
                    }
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      number === page
                        ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              {/* NEXT */}
              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">
                  Next
                </span>
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedCenter;
