import { useEffect, useState } from "react";

import {
  FiX,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";

import api from "../../services/api";
import socket from "../../socket/socket";

const CommentModal = ({
  post,
  isOpen,
  onClose,
}) => {
  const [comments, setComments] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // LOAD COMMENTS
  useEffect(() => {
    if (!isOpen || !post?._id) return;

    const loadComments = async () => {
      try {
        const { data } = await api.get(
          `/comments/${post._id}`
        );

        setComments(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadComments();
  }, [isOpen, post?._id]);

  // REALTIME SOCKET
  useEffect(() => {
    if (!post?._id) return;

    socket.emit(
      "joinPost",
      post._id
    );

    const handleReceiveComment = (
      newComment
    ) => {
      setComments((prev) => {
        const exists = prev.find(
          (comment) =>
            comment._id ===
            newComment._id
        );

        if (exists) return prev;

        return [
          ...prev,
          newComment,
        ];
      });
    };

    socket.on(
      "receiveComment",
      handleReceiveComment
    );

    return () => {
      socket.off(
        "receiveComment",
        handleReceiveComment
      );
    };
  }, [post?._id]);

  // ADD COMMENT
  const handleComment =
    async () => {
      if (
        !text.trim() ||
        loading
      )
        return;

      try {
        setLoading(true);

        const { data } =
          await api.post(
            `/comments/${post._id}`,
            {
              text,
            }
          );

        socket.emit(
          "sendComment",
          {
            postId: post._id,
            comment: data,
          }
        );

        setText("");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  // ENTER SEND
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleComment();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0
        z-50

        flex items-center justify-center

        bg-black/70
        backdrop-blur-md

        p-4
      "
    >
      <div
        className="
          w-full
          max-w-xl

          h-[70vh]

          bg-[#0B1120]

          border
          border-white/10

          rounded-xl

          overflow-hidden

          shadow-[0_20px_80px_rgba(0,0,0,0.6)]

          flex flex-col
        "
      >
        {/* HEADER */}
        <div
          className="
            flex items-center justify-between

            px-5 py-4

            border-b
            border-white/10
          "
        >
          <div className="flex items-center gap-3">
            <FiMessageCircle
              size={22}
              className="text-indigo-400"
            />

            <h2
              className="
                text-lg
                font-semibold
                text-white
              "
            >
              Comments
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              text-gray-500
              hover:text-white
              transition-all duration-300
            "
          >
            <FiX size={22} />
          </button>
        </div>

        {/* COMMENTS */}
        <div
          className="
            flex-1

            overflow-y-auto

            px-4
            py-2
          "
        >
          {comments.length ===
          0 ? (
            <div
              className="
                h-full

                flex items-center justify-center

                text-gray-500
              "
            >
              No comments yet
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map(
                (comment) => (
                  <div
                    key={
                      comment._id
                    }
                    className="
                      flex gap-3

                      py-3

                      border-b
                      border-white/5
                    "
                  >
                    {/* Avatar */}
                    <div
                      className="
                        w-10 h-10

                        rounded-full

                        bg-gradient-to-r
                        from-indigo-500
                        to-purple-500

                        shrink-0
                      "
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div
                        className="
                          flex items-center gap-2
                        "
                      >
                        <h3
                          className="
                            text-white
                            font-medium
                            text-sm
                          "
                        >
                          {comment
                            ?.user
                            ?.name ||
                            "Unknown User"}
                        </h3>

                        <span
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          @
                          {comment
                            ?.user
                            ?.username ||
                            "anonymous"}
                        </span>
                      </div>

                      <p
                        className="
                          mt-1

                          text-gray-300

                          text-sm

                          leading-6
                        "
                      >
                        {
                          comment.text
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* INPUT */}
        <div
          className="
            border-t
            border-white/10

            p-3
          "
        >
          <div
            className="
              flex items-center gap-3

              bg-white/5

              border
              border-white/10

              rounded-xl

              px-3 py-2
            "
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) =>
                setText(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              className="
                flex-1

                bg-transparent

                outline-none

                text-white

                placeholder:text-gray-500
              "
            />

            <button
              onClick={
                handleComment
              }
              disabled={
                loading ||
                !text.trim()
              }
              className="
                bg-gradient-to-r
                from-indigo-500
                to-purple-500

                hover:scale-105

                transition-all duration-300

                p-3

                rounded-lg

                text-white

                disabled:opacity-50
                disabled:hover:scale-100
              "
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;