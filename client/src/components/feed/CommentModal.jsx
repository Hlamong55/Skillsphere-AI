import { useEffect, useState } from "react";

import {
  FiX,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";

import api from "../../services/api";

const CommentModal = ({
  post,
  isOpen,
  onClose,
}) => {
  const [comments, setComments] = useState([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);

  // FETCH COMMENTS
  const fetchComments = async () => {
    try {
      const { data } = await api.get(
        `/comments/${post._id}`
      );

      setComments(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isOpen && post?._id) {
      fetchComments();
    }
  }, [isOpen, post]);

  // ADD COMMENT
  const handleComment = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const { data } = await api.post(
        `/comments/${post._id}`,
        {
          text,
        }
      );

      setComments((prev) => [...prev, data]);

      setText("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ENTER TO SEND
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleComment();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0
        bg-black/70
        backdrop-blur-sm
        z-50
        flex items-center justify-center
        p-3
      "
    >
      {/* MODAL */}
      <div
        className="
          w-full max-w-2xl
          h-[82vh]
          bg-[#0B1120]
          border border-white/10
          rounded-2xl
          overflow-hidden
          shadow-2xl
          flex flex-col
        "
      >
        {/* HEADER */}
        <div
          className="
            px-4 py-3
            border-b border-white/20
            flex items-center justify-between
          "
        >
          <div className="flex items-center gap-3">
            <FiMessageCircle
              className="text-indigo-400"
              size={24}
            />

            <h2 className="text-2xl font-bold text-white">
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
            <FiX size={26} />
          </button>
        </div>

        {/* COMMENTS */}
        <div
          className="flex-1  overflow-y-auto  px-6 "
        >
          {comments.length === 0 ? (
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
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="
                    flex gap-4
                    py-4
                    border-b border-white/5
                  "
                >
                  {/* AVATAR */}
                  <div
                    className="
                      w-11 h-11
                      rounded-full
                      bg-linear-to-r
                      from-indigo-500
                      to-purple-500
                      shrink-0
                    "
                  />

                  {/* CONTENT */}
                  <div className="flex-1">
                    {/* TOP */}
                    <div className="flex items-center gap-3">
                      <h3
                        className="
                          text-white
                          font-semibold
                          text-[14px]
                        "
                      >
                        {comment.user?.name}
                      </h3>

                      <p
                        className="text-gray-500 text-sm"
                      >
                        @{comment.user?.username}
                      </p>
                    </div>

                    {/* COMMENT */}
                    <p
                      className="
                        text-gray-300
                        text-[15px]
                        leading-7
                    
                      "
                    >
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INPUT */}
        <div
          className="
            border-t border-white/20
            p-3
          "
        >
          <div
            className="
              flex items-center gap-3
              bg-white/3
              border border-white/10
              rounded-xl
              px-4 py-2
            "
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="
                flex-1
                bg-transparent
                outline-none
                text-white
                placeholder:text-gray-500
                text-[15px]
              "
            />

            <button
              onClick={handleComment}
              disabled={loading}
              className="bg-linear-to-r  from-indigo-500   to-purple-500  hover:scale-105  transition-all duration-300  px-4  p-3   rounded-xl  text-white  shadow-lg"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;