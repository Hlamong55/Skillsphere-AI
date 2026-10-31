
import {
  useContext,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FiBookmark,
  FiCheck,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

// Cache saved IDs separately for each user.
const savedIdsCache = new Map();
const pendingRequests = new Map();

// ========================================
// LOAD SAVED POST IDS
// ========================================

const getSavedIds = (userId) => {
  if (savedIdsCache.has(userId)) {
    return Promise.resolve(
      savedIdsCache.get(userId)
    );
  }

  if (pendingRequests.has(userId)) {
    return pendingRequests.get(userId);
  }

  const request = api
    .get("/saved-posts/ids")
    .then(({ data }) => {
      const savedIds = new Set(
        (data.postIds || []).map(String)
      );

      savedIdsCache.set(userId, savedIds);

      return savedIds;
    })
    .finally(() => {
      pendingRequests.delete(userId);
    });

  pendingRequests.set(userId, request);

  return request;
};

// ========================================
// UPDATE LOCAL CACHE
// ========================================

const updateSavedIdsCache = (
  userId,
  postId,
  saved
) => {
  const previous =
    savedIdsCache.get(userId) ||
    new Set();

  const next = new Set(previous);

  if (saved) {
    next.add(postId);
  } else {
    next.delete(postId);
  }

  savedIdsCache.set(userId, next);
};

// ========================================
// BOOKMARK BUTTON COMPONENT
// ========================================

const BookmarkButton = ({
  postId,
  onSavedChange,
}) => {
  const { user: authUser } =
    useContext(AuthContext);

  const currentUser =
    authUser?.user || authUser;

  const currentUserId = String(
    currentUser?._id ||
    currentUser?.id ||
    ""
  );

  const normalizedPostId =
    String(postId || "");

  const [status, setStatus] = useState({
    userId: "",
    postId: "",
    saved: false,
    ready: false,
    error: "",
  });

  const [pending, setPending] =
    useState(false);

  const isReady =
    status.ready &&
    status.userId === currentUserId &&
    status.postId === normalizedPostId;

  const isSaved =
    isReady && status.saved;

  // ======================================
  // CHECK EXISTING BOOKMARK
  // ======================================

  useEffect(() => {
    if (
      !currentUserId ||
      !normalizedPostId
    ) {
      return;
    }

    let cancelled = false;

    getSavedIds(currentUserId)
      .then((ids) => {
        if (cancelled) return;

        setStatus({
          userId: currentUserId,
          postId: normalizedPostId,
          saved: ids.has(normalizedPostId),
          ready: true,
          error: "",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(
          "Bookmark Status Error:",
          error
        );

        setStatus({
          userId: currentUserId,
          postId: normalizedPostId,
          saved: false,
          ready: false,
          error: "Unable to load bookmark status.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, normalizedPostId]);

  // ======================================
  // SAVE / UNSAVE POST
  // ======================================

  const handleToggle = async () => {
    if (
      !currentUserId ||
      !normalizedPostId ||
      !isReady ||
      pending
    ) {
      return;
    }

    const nextSaved = !isSaved;

    try {
      setPending(true);

      if (nextSaved) {
        await api.post(
          `/saved-posts/${normalizedPostId}`
        );
      } else {
        await api.delete(
          `/saved-posts/${normalizedPostId}`
        );
      }

      // Only update after successful API call.
      updateSavedIdsCache(
        currentUserId,
        normalizedPostId,
        nextSaved
      );

      setStatus((previous) => ({
        ...previous,
        saved: nextSaved,
      }));

      toast.success(
        nextSaved
          ? "Post saved successfully!"
          : "Post removed from saved posts."
      );

      // Optional callback for Saved Posts page.
      onSavedChange?.(
        nextSaved,
        normalizedPostId
      );

    } catch (error) {
      console.error(
        "Bookmark Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update bookmark."
      );

    } finally {
      setPending(false);
    }
  };

  // ======================================
  // NOT LOGGED IN
  // ======================================

  if (!currentUserId) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-lg p-2 text-sm text-gray-400 hover:bg-white/5 hover:text-indigo-200"
      >
        <FiBookmark size={21} />
        Save Post
      </Link>
    );
  }

  // ======================================
  // BUTTON
  // ======================================

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={
        pending ||
        !isReady
      }
      title={
        status.error ||
        (isSaved
          ? "Remove saved post"
          : "Save this post")
      }
      aria-label={
        isSaved
          ? "Remove saved post"
          : "Save post"
      }
      aria-pressed={isSaved}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
        isSaved
          ? "bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
          : "text-gray-400 hover:bg-white/5 hover:text-indigo-300"
      }`}
    >
      {pending || !isReady ? (
        <FiLoader
          size={17}
          className="animate-spin"
        />
      ) : isSaved ? (
        <FiCheck size={17} />
      ) : (
        <FiBookmark size={17} />
      )}

      <span>
        {pending
          ? "Updating..."
          : !isReady
            ? status.error
              ? "Unavailable"
              : "Loading..."
            : isSaved
              ? "Saved"
              : "Save Post"}
      </span>
    </button>
  );
};

export default BookmarkButton;
