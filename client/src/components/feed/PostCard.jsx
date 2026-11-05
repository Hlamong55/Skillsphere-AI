
import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  FiHeart,
  FiThumbsDown,
  FiMessageCircle,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import CommentModal from "./CommentModal";
import BookmarkButton from "./BookmarkButton";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";

import api from "../../services/api";
import socket from "../../socket/socket";

// ========================================
// CURRENT LOGGED-IN USER
// ========================================

const getCurrentUserId = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem("userInfo") || "null"
    );

    return String(
      stored?.user?._id ||
        stored?._id ||
        stored?.user?.id ||
        stored?.id ||
        ""
    );
  } catch (error) {
    console.error("User info error:", error);
    return "";
  }
};

// ========================================
// REACTION HELPER
// ========================================

const hasReaction = (array, userId) => {
  if (!userId || !Array.isArray(array)) {
    return false;
  }

  return array.some(
    (id) => String(id?._id || id) === userId
  );
};

// ========================================
// PROFILE IMAGE HELPER
// ========================================

const getProfileImageUrl = (profilePicture) => {
  if (
    typeof profilePicture !== "string" ||
    !profilePicture.trim()
  ) {
    return "";
  }

  const imagePath = profilePicture.trim();

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  try {
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    const backendBase = new URL(
      api.defaults.baseURL || "/",
      window.location.origin
    );

    return new URL(
      normalizedPath,
      backendBase.origin
    ).href;
  } catch {
    return "";
  }
};

// ========================================
// POST CARD COMPONENT
// ========================================

const PostCard = ({
  post,
  onBookmarkChange,
  onDeleted,
}) => {
  const currentUserId = getCurrentUserId();


  const [openComments, setOpenComments] =
    useState(false);

  const [editMenuOpen, setEditMenuOpen] =
    useState(false);

  const editMenuRef = useRef(null);

  const [editModalOpen, setEditModalOpen] =
    useState(false);

  const [editedPost, setEditedPost] =
    useState(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [isDeleted, setIsDeleted] =
    useState(false);

  // ======================================
  // CURRENT DISPLAY POST
  // ======================================

  // Use updated post data immediately
  // after a successful edit.

  const displayPost =
    editedPost &&
    String(editedPost._id) === String(post?._id)
      ? editedPost
      : post;

  // ======================================
  // POST OWNER VERIFICATION
  // ======================================

  const postOwnerId = String(
    displayPost?.user?._id ||
      displayPost?.user?.id ||
      displayPost?.user ||
      ""
  );

  const isPostOwner = Boolean(
    currentUserId &&
      postOwnerId &&
      currentUserId === postOwnerId
  );

  // ======================================
  // DYNAMIC POST AUTHOR
  // ======================================

  const author = displayPost?.user;

  const authorName =
    author?.name ||
    author?.username ||
    "Unknown User";

  const authorUsername =
    author?.username || "anonymous";

  const authorInitial =
    authorName.trim().charAt(0).toUpperCase() || "U";

  const avatarUrl = getProfileImageUrl(
    author?.profilePicture
  );

  const [
    failedAvatarUrl,
    setFailedAvatarUrl,
  ] = useState("");

  const showAvatarImage =
    Boolean(avatarUrl) &&
    failedAvatarUrl !== avatarUrl;

  // ======================================
  // CLOSE POST OPTIONS MENU
  // ======================================

  useEffect(() => {
    if (!editMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (
        editMenuRef.current &&
        !editMenuRef.current.contains(event.target)
      ) {
        setEditMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setEditMenuOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [editMenuOpen]);

  // ======================================
  // OPEN EDIT MODAL
  // ======================================

  const handleOpenEdit = () => {
    if (!isPostOwner) return;

    setEditMenuOpen(false);
    setEditModalOpen(true);
  };

  // ======================================
  // HANDLE EDIT SUCCESS
  // ======================================

  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost?._id) return;

    setEditedPost(updatedPost);

    setEditModalOpen(false);
    setEditMenuOpen(false);
  };

  // ======================================
  // NEW: OPEN DELETE MODAL
  // ======================================

  const handleOpenDelete = () => {
    if (!isPostOwner) return;

    setEditMenuOpen(false);
    setDeleteModalOpen(true);
  };

  // ======================================
  // NEW: HANDLE DELETE SUCCESS
  // ======================================

  const handlePostDeleted = (deletedPostId) => {
    if (
      String(deletedPostId) !==
      String(displayPost?._id)
    ) {
      return;
    }

    // Hide this card immediately.
    setIsDeleted(true);

    // Close all post action dialogs.
    setDeleteModalOpen(false);
    setEditModalOpen(false);
    setEditMenuOpen(false);

    // Optional callback for parent Feed.
    // Parent integration will be handled
    // separately if needed.
    onDeleted?.(deletedPostId);
  };

  // ======================================
  // INITIAL REACTION
  // ======================================

  const getInitialReaction = () => {
    if (hasReaction(post?.likes, currentUserId)) {
      return "like";
    }

    if (hasReaction(post?.dislikes, currentUserId)) {
      return "dislike";
    }

    return null;
  };

  const [reaction, setReaction] =
    useState(getInitialReaction);

  const [likesCount, setLikesCount] =
    useState(post?.likes?.length || 0);

  const [dislikesCount, setDislikesCount] =
    useState(post?.dislikes?.length || 0);

  const [commentsCount, setCommentsCount] =
    useState(post?.commentsCount ?? 0);

  const [reactionLoading, setReactionLoading] =
    useState(false);

  const [reactionError, setReactionError] =
    useState("");

  // ======================================
  // REALTIME REACTION LISTENER
  // ======================================

  useEffect(() => {
    if (!post?._id) return;

    const postId = String(post._id);

    const joinRoom = () => {
      socket.emit("joinPost", postId);
    };

    joinRoom();

    socket.on("connect", joinRoom);

    const handleReceiveLike = (data) => {
      if (String(data.postId) !== postId) {
        return;
      }

      if (typeof data.likesCount === "number") {
        setLikesCount(data.likesCount);
      }

      if (typeof data.dislikesCount === "number") {
        setDislikesCount(data.dislikesCount);
      }

      if (
        Array.isArray(data.likes) &&
        Array.isArray(data.dislikes)
      ) {
        if (
          hasReaction(data.likes, currentUserId)
        ) {
          setReaction("like");
        } else if (
          hasReaction(data.dislikes, currentUserId)
        ) {
          setReaction("dislike");
        } else {
          setReaction(null);
        }
      }
    };

    socket.on(
      "receiveLike",
      handleReceiveLike
    );

    return () => {
      socket.off("connect", joinRoom);

      socket.off(
        "receiveLike",
        handleReceiveLike
      );
    };
  }, [post?._id, currentUserId]);

  // ======================================
  // HANDLE LIKE / DISLIKE
  // ======================================

  const handleReaction = async (type) => {
    if (
      reactionLoading ||
      !post?._id
    ) {
      return;
    }

    setReactionLoading(true);
    setReactionError("");

    try {
      const { data } = await api.put(
        `/posts/${post._id}/${type}`
      );

      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);

      let newReaction = null;

      if (
        hasReaction(data.likes, currentUserId)
      ) {
        newReaction = "like";
      } else if (
        hasReaction(data.dislikes, currentUserId)
      ) {
        newReaction = "dislike";
      }

      setReaction(newReaction);

      socket.emit("sendLike", {
        postId: post._id,
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount,
        likes: data.likes,
        dislikes: data.dislikes,
      });

    } catch (error) {
      console.error(
        "Reaction error:",
        error
      );

      setReactionError(
        "Unable to update reaction. Please try again."
      );

    } finally {
      setReactionLoading(false);
    }
  };

  // ======================================
  // HIDE SUCCESSFULLY DELETED POST
  // ======================================

  // All React Hooks run before this return.
  // The card disappears immediately
  // after successful backend deletion.

  if (isDeleted) {
    return null;
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <>
      {/* ==================================
          POST CARD
      ================================== */}

      <div className="bg-white/3 border border-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.45)] hover:border-indigo-500/20 transition-all duration-500">

        {/* ==================================
            POST HEADER
        ================================== */}

        <div className="p-6">

          <div className="flex items-start justify-between gap-3">

            <div className="flex items-center gap-4 min-w-0">

              {/* ==================================
                  DYNAMIC AUTHOR AVATAR
              ================================== */}

              <div
                className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg shrink-0 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/10"
                title={authorName}
              >

                {showAvatarImage ? (

                  <img
                    src={avatarUrl}
                    alt={`${authorName} profile`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setFailedAvatarUrl(avatarUrl);
                    }}
                  />

                ) : (

                  <span>
                    {authorInitial}
                  </span>

                )}

              </div>

              {/* ==================================
                  POST AUTHOR
              ================================== */}

              <div className="min-w-0">

                <h2 className="text-xl font-semibold text-white leading-tight truncate">
                  {authorName}
                </h2>

                <p className="text-gray-400 text-sm mt-1 truncate">
                  @{authorUsername}
                </p>

              </div>

            </div>

            {/* ==================================
                OWNER-ONLY POST OPTIONS
            ================================== */}

            {isPostOwner && (

              <div
                ref={editMenuRef}
                className="relative shrink-0"
              >

                {/* THREE-DOT BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setEditMenuOpen(
                      (previous) => !previous
                    )
                  }
                  aria-label="Post options"
                  aria-haspopup="menu"
                  aria-expanded={editMenuOpen}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                    editMenuOpen
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-gray-500 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <FiMoreHorizontal size={21} />
                </button>

                {/* ==================================
                    POST OPTIONS DROPDOWN
                ================================== */}

                {editMenuOpen && (

                  <div
                    role="menu"
                    aria-label="Post actions"
                    className="absolute right-0 top-full mt-2 z-30 w-44 rounded-xl border border-white/10 bg-[#111827] p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                  >

                    {/* EDIT POST */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleOpenEdit}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                    >
                      <FiEdit2 size={17} />

                      <span>
                        Edit Post
                      </span>
                    </button>

                    {/* SEPARATOR */}

                    <div className="my-1 border-t border-white/10" />

                    {/* NEW: DELETE POST */}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleOpenDelete}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                      <FiTrash2 size={17} />

                      <span>
                        Delete Post
                      </span>
                    </button>

                  </div>

                )}

              </div>

            )}

          </div>

          {/* ==================================
              POST CONTENT
          ================================== */}

          <p className="text-gray-200 text-[16px] leading-7 mt-5 whitespace-pre-wrap">
            {displayPost?.content}
          </p>

        </div>

        {/* ==================================
            POST IMAGE
        ================================== */}

        {displayPost?.image && (

          <img
            src={displayPost.image}
            alt="Post attachment"
            className="w-full max-h-125 object-cover"
          />

        )}

        {/* ==================================
            POST VIDEO
        ================================== */}

        {displayPost?.video && (

          <div className="w-full bg-black border-t border-white/10">

            <video
              key={displayPost.video}
              src={displayPost.video}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-125 object-contain bg-black"
              aria-label="Post video attachment"
            >
              Your browser does not support
              video playback.
            </video>

          </div>

        )}

        {/* ==================================
            BOTTOM ACTIONS
        ================================== */}

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">

          <div className="flex items-center gap-5 sm:gap-7">

            {/* ==================================
                LIKE BUTTON
            ================================== */}

            <button
              type="button"
              onClick={() =>
                handleReaction("like")
              }
              disabled={reactionLoading}
              aria-label="Like post"
              aria-pressed={reaction === "like"}
              className={`group flex items-center gap-2 transition-all duration-300 disabled:opacity-60 ${
                reaction === "like"
                  ? "text-red-400"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >

              <FiHeart
                size={21}
                className={`transition-all duration-300 ${
                  reaction === "like"
                    ? "text-red-400 scale-105"
                    : "group-hover:scale-105"
                }`}
              />

              <span className="text-sm font-medium">
                {likesCount}
              </span>

            </button>

            {/* ==================================
                DISLIKE BUTTON
            ================================== */}

            <button
              type="button"
              onClick={() =>
                handleReaction("dislike")
              }
              disabled={reactionLoading}
              aria-label="Dislike post"
              aria-pressed={reaction === "dislike"}
              className={`group flex items-center gap-2 transition-all duration-300 disabled:opacity-60 ${
                reaction === "dislike"
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-purple-400"
              }`}
            >

              <FiThumbsDown
                size={21}
                className={`transition-all duration-300 ${
                  reaction === "dislike"
                    ? "text-purple-400 scale-105"
                    : "group-hover:scale-105"
                }`}
              />

              <span className="text-sm font-medium">
                {dislikesCount}
              </span>

            </button>

            {/* ==================================
                COMMENT BUTTON
            ================================== */}

            <button
              type="button"
              onClick={() =>
                setOpenComments(true)
              }
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-500 transition-all duration-300"
            >

              <FiMessageCircle size={21} />

              <span className="text-sm font-medium">
                {commentsCount}
              </span>

            </button>

            {/* ==================================
                BOOKMARK BUTTON
            ================================== */}

            <BookmarkButton
              postId={displayPost._id}
              onSavedChange={onBookmarkChange}
            />

          </div>

          <p className="hidden md:block text-gray-500 text-xs">
            AI Community Post
          </p>

        </div>

        {/* ==================================
            REACTION ERROR
        ================================== */}

        {reactionError && (

          <p
            role="alert"
            className="px-6 pb-4 text-red-400 text-sm"
          >
            {reactionError}
          </p>

        )}

      </div>

      {/* ==================================
          EXISTING COMMENT MODAL
      ================================== */}

      <CommentModal
        post={displayPost}
        isOpen={openComments}
        onClose={() =>
          setOpenComments(false)
        }
        onCommentAdded={() => {
          setCommentsCount(
            (previous) => previous + 1
          );
        }}
      />

      {/* ==================================
          EXISTING EDIT POST MODAL
      ================================== */}

      {editModalOpen && isPostOwner && (

        <EditPostModal
          key={displayPost._id}
          post={displayPost}
          isOpen={editModalOpen}
          onClose={() =>
            setEditModalOpen(false)
          }
          onUpdated={handlePostUpdated}
        />

      )}

      {/* ==================================
          NEW: DELETE POST MODAL
      ================================== */}

      {deleteModalOpen && isPostOwner && (

        <DeletePostModal
          post={displayPost}
          isOpen={deleteModalOpen}
          onClose={() =>
            setDeleteModalOpen(false)
          }
          onDeleted={handlePostDeleted}
        />

      )}

    </>
  );
};

export default PostCard;
