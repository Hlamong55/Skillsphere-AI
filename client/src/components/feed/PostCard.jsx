
import { useState, useEffect } from "react";

import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
} from "react-icons/fi";

import CommentModal from "./CommentModal";
import api from "../../services/api";
import socket from "../../socket/socket";

const PostCard = ({ post }) => {
  const [openComments, setOpenComments] = useState(false);

  // Read logged-in user ID
  let currentUserId = "";

  try {
    const stored = JSON.parse(
      localStorage.getItem("userInfo") || "null"
    );

    currentUserId = String(
      stored?.user?._id ||
      stored?._id ||
      stored?.user?.id ||
      stored?.id ||
      ""
    );
  } catch (error) {
    console.error("User info error:", error);
  }

  // Check if current user liked this post
  const checkIsLiked = (likes) => {
    if (!currentUserId || !Array.isArray(likes)) {
      return false;
    }

    return likes.some(
      (id) =>
        String(id?._id || id) === currentUserId
    );
  };

  const [liked, setLiked] = useState(() =>
    checkIsLiked(post?.likes)
  );

  const [likesCount, setLikesCount] = useState(
    post?.likes?.length || 0
  );

  const [commentsCount, setCommentsCount] = useState(
    post?.commentsCount ?? 0
  );

  // Update count only when another user likes
  useEffect(() => {
    const handleReceiveLike = (data) => {
      if (String(data.postId) === String(post?._id)) {
        setLikesCount(data.likesCount);
      }
    };

    socket.on("receiveLike", handleReceiveLike);

    return () => {
      socket.off("receiveLike", handleReceiveLike);
    };
  }, [post?._id]);

  // Like / Unlike
  const handleLike = async () => {
    try {
      const { data } = await api.put(
        `/posts/${post._id}/like`
      );

      setLiked(Boolean(data.isLiked));
      setLikesCount(data.likesCount);

      socket.emit("sendLike", {
        postId: post._id,
        likesCount: data.likesCount,
      });
    } catch (error) {
      console.error("Like error:", error);
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
              <div className="w-14 h-14 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg shrink-0" />

              <div>
                <h2 className="text-xl font-semibold text-white leading-none">
                  {post?.user?.name || "Unknown User"}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  @{post?.user?.username || "anonymous"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-gray-500 hover:text-white transition-all duration-300"
            >
              <FiMoreHorizontal size={20} />
            </button>
          </div>

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

        {/* BOTTOM ACTIONS */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-7">

            {/* LIKE */}
            <button
              type="button"
              onClick={handleLike}
              className={`group flex items-center gap-2 transition-all duration-300 ${
                liked
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              <FiHeart
                size={21}
                className={`transition-all duration-300 ${
                  liked
                    ? "text-red-400 scale-105"
                    : "group-hover:text-red-500 group-hover:scale-105"
                }`}
              />

              <span className="text-sm font-medium">
                {likesCount}
              </span>
            </button>

            {/* COMMENTS */}
            <button
              type="button"
              onClick={() => setOpenComments(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-500 transition-all duration-300"
            >
              <FiMessageCircle size={21} />

              <span className="text-sm font-medium">
                {commentsCount}
              </span>
            </button>

            {/* SHARE */}
            <button
              type="button"
              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-300"
            >
              <FiShare2 size={21} />
              <span className="text-sm font-medium">
                Share
              </span>
            </button>
          </div>

          <p className="text-gray-500 text-xs">
            AI Community Post
          </p>
        </div>
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
