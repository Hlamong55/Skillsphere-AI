import { useState } from "react";

import { FiImage, FiVideo, FiX, FiSend } from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";

const CreatePost = ({ fetchPosts, addNewPost }) => {
  const [content, setContent] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  // IMAGE PREVIEW
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImagePreview(imageUrl);
  };

  // CREATE POST
  const handleCreatePost = async () => {
    if (!content.trim()) {
      return toast.error("Write something first");
    }

    try {
      setLoading(true);

      const { data } = await api.post("/posts", {
        content,
        image: imagePreview,
      });

      toast.success("Post created successfully");

      // INSTANT UI UPDATE
      if (addNewPost) {
        addNewPost(data.post);
      }

      setContent("");
      setImagePreview("");

      // OPTIONAL REFRESH
      if (fetchPosts) {
        fetchPosts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // ENTER SUBMIT
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleCreatePost();
    }
  };

  return (
    <div
      className="
        bg-white/3
        border border-white/10
        backdrop-blur-2xl
        rounded-2xl
        p-4
        shadow-[0_10px_60px_rgba(0,0,0,0.45)]
      "
    >
      {/* TOP */}
      <div className="flex items-start gap-4">
        {/* AVATAR */}
        <div
          className="
            w-12 h-12
            rounded-full
            bg-linear-to-r
            from-indigo-500
            to-purple-500
            shrink-0
          "
        />

        {/* INPUT AREA */}
        <div className="flex-1 space-y-1">
          {/* TEXTAREA */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your ideas with the AI community..."
            rows={4}
            className="
              w-full
              bg-[#0B1120]
              border border-white/10
              rounded-2xl
              p-4
              text-white
              placeholder:text-gray-500
              resize-none
              outline-none
              focus:border-indigo-500/40
              transition-all duration-300
              leading-7
            "
          />

          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt=""
                className="
                  w-full
                  max-h-105
                  object-cover
                  rounded-2xl
                  border border-white/10
                "
              />

              {/* REMOVE BUTTON */}
              <button
                onClick={() => setImagePreview("")}
                className="
                  absolute top-3 right-3
                  bg-black/60
                  hover:bg-red-500
                  transition-all duration-300
                  p-2.5
                  rounded-full
                  text-white
                "
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          {/* BOTTOM */}
          <div
            className="
              flex items-center justify-between
            "
          >
            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {/* IMAGE */}
              <label
                className="
                  flex items-center gap-2
                  bg-white/3
                  hover:bg-white/6
                  border border-white/10
                  px-3 py-1.5
                  rounded-xl
                  cursor-pointer
                  transition-all duration-300
                  text-gray-300
                  hover:text-white
                "
              >
                <FiImage size={18} />

                <span className="text-sm">Image</span>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImage}
                />
              </label>

              {/* VIDEO */}
              <button
                className="
                  flex items-center gap-2
                  bg-white/3
                  hover:bg-white/6
                  border border-white/10
                  px-3 py-1.5
                  rounded-xl
                  transition-all duration-300
                  text-gray-300
                  hover:text-white
                "
              >
                <FiVideo size={18} />

                <span className="text-sm">Video</span>
              </button>
            </div>

            {/* POST BUTTON */}
            <button
              onClick={handleCreatePost}
              disabled={loading}
              className={`
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    font-semibold
    transition-all duration-300
    shadow-[0_0_30px_rgba(139,92,246,0.25)]

    ${
      loading || !content.trim()
        ? "bg-linear-to-r from-indigo-500/50 to-purple-500/50 text-white/70 cursor-not-allowed"
        : "bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:scale-105"
    }
  `}
            >
              <FiSend size={17} />

              {loading ? "Posting..." : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
