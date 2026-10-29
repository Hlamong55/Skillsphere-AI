import { useState, useEffect } from "react";

import {
  FiHeart,
  FiThumbsDown,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
} from "react-icons/fi";

import CommentModal from "./CommentModal";
import api from "../../services/api";
import socket from "../../socket/socket";

// Get currently logged-in user's ID
const getCurrentUserId = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("userInfo") || "null");

    return String(
      stored?.user?._id || stored?._id || stored?.user?.id || stored?.id || "",
    );
  } catch (error) {
    console.error("User info error:", error);
    return "";
  }
};

// Check whether a user ID exists in an array
const hasReaction = (array, userId) => {
  if (!userId || !Array.isArray(array)) {
    return false;
  }

  return array.some((id) => String(id?._id || id) === userId);
};

const PostCard = ({ post }) => {
  const currentUserId = getCurrentUserId();

  const [openComments, setOpenComments] = useState(false);

  // INITIAL REACTION
  const getInitialReaction = () => {
    if (hasReaction(post?.likes, currentUserId)) {
      return "like";
    }

    if (hasReaction(post?.dislikes, currentUserId)) {
      return "dislike";
    }

    return null;
  };

  const [reaction, setReaction] = useState(getInitialReaction);

  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);

  const [dislikesCount, setDislikesCount] = useState(
    post?.dislikes?.length || 0,
  );

  const [commentsCount, setCommentsCount] = useState(post?.commentsCount ?? 0);

  const [reactionLoading, setReactionLoading] = useState(false);
  const [reactionError, setReactionError] = useState("");

  // REALTIME REACTION LISTENER
  useEffect(() => {
    if (!post?._id) return;

    const postId = String(post._id);

    // Join post room for realtime updates
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

      // Sync current user's reaction when IDs are available
      if (Array.isArray(data.likes) && Array.isArray(data.dislikes)) {
        if (hasReaction(data.likes, currentUserId)) {
          setReaction("like");
        } else if (hasReaction(data.dislikes, currentUserId)) {
          setReaction("dislike");
        } else {
          setReaction(null);
        }
      }
    };

    socket.on("receiveLike", handleReceiveLike);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receiveLike", handleReceiveLike);
    };
  }, [post?._id, currentUserId]);

  // HANDLE LIKE / DISLIKE
  const handleReaction = async (type) => {
    if (reactionLoading || !post?._id) {
      return;
    }

    setReactionLoading(true);
    setReactionError("");

    try {
      const { data } = await api.put(`/posts/${post._id}/${type}`);

      // Update counts
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);

      // Calculate selected reaction from backend response
      let newReaction = null;

      if (hasReaction(data.likes, currentUserId)) {
        newReaction = "like";
      } else if (hasReaction(data.dislikes, currentUserId)) {
        newReaction = "dislike";
      }

      setReaction(newReaction);

      // Broadcast reaction counts to other users
      socket.emit("sendLike", {
        postId: post._id,
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount,
        likes: data.likes,
        dislikes: data.dislikes,
      });
    } catch (error) {
      console.error("Reaction error:", error);

      setReactionError("Unable to update reaction. Please try again.");
    } finally {
      setReactionLoading(false);
    }
  };

  return (
    <>
      {/* POST CARD */}
      <div className="bg-white/3 border border-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.45)] hover:border-indigo-500/20 transition-all duration-500">
        {/* HEADER */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              <div className="w-14 h-14 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg shrink-0" />

              {/* USER */}
              <div>
                <h2 className="text-xl font-semibold text-white leading-none">
                  {post?.user?.name || "Unknown User"}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  @{post?.user?.username || "anonymous"}
                </p>
              </div>
            </div>

            {/* MORE */}
            <button
              type="button"
              className="text-gray-500 hover:text-white transition-all duration-300"
            >
              <FiMoreHorizontal size={20} />
            </button>
          </div>

          {/* CONTENT */}
          <p className="text-gray-200 text-[16px] leading-7 mt-5 whitespace-pre-wrap">
            {post?.content}
          </p>
        </div>

        {/* POST IMAGE */}
        {post?.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full max-h-125 object-cover"
          />
        )}

        {/* POST VIDEO */}
        {post?.video && (
          <div className="w-full bg-black border-t border-white/10">
            <video
              key={post.video}
              src={post.video}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-125 object-contain bg-black"
              aria-label="Post video attachment"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* BOTTOM ACTIONS */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-5 sm:gap-7">
            {/* LIKE BUTTON */}
            <button
              type="button"
              onClick={() => handleReaction("like")}
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

              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* DISLIKE BUTTON */}
            <button
              type="button"
              onClick={() => handleReaction("dislike")}
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

              <span className="text-sm font-medium">{dislikesCount}</span>
            </button>

            {/* COMMENT BUTTON */}
            <button
              type="button"
              onClick={() => setOpenComments(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-500 transition-all duration-300"
            >
              <FiMessageCircle size={21} />

              <span className="text-sm font-medium">{commentsCount}</span>
            </button>

            {/* SHARE BUTTON */}
            <button
              type="button"
              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-300"
            >
              <FiShare2 size={21} />

              <span className="hidden sm:inline text-sm font-medium">
                Share
              </span>
            </button>
          </div>

          <p className="hidden md:block text-gray-500 text-xs">
            AI Community Post
          </p>
        </div>

        {/* REACTION ERROR */}
        {reactionError && (
          <p role="alert" className="px-6 pb-4 text-red-400 text-sm">
            {reactionError}
          </p>
        )}
      </div>

      {/* COMMENT MODAL */}
      <CommentModal
        post={post}
        isOpen={openComments}
        onClose={() => setOpenComments(false)}
        onCommentAdded={() => {
          setCommentsCount((prev) => prev + 1);
        }}
      />
    </>
  );
};

export default PostCard;
