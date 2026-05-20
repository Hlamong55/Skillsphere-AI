import { useState } from "react";
import { FiImage, FiVideo, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const CreatePost = ({ fetchPosts }) => {
  const [content, setContent] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  // Image Preview
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImagePreview(imageUrl);
  };

  // Create Post
  const handleCreatePost = async () => {
    if (!content.trim()) {
      return toast.error("Write something first");
    }

    try {
      setLoading(true);

      await api.post("/posts", {
        content,
        image: imagePreview,
      });

      toast.success("Post created successfully");

      setContent("");
      setImagePreview("");

      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white/3  border  border-white/10  backdrop-blur-2xl  rounded-2xl  p-4  shadow-[0_10px_60px_rgba(0,0,0,0.45)]"
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shrink-0"
        />

        {/* Input Area */}
        <div className="flex-1 space-y-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your ideas with the AI community..."
            rows={5}
            className="w-full  bg-[#0B1120]  border  border-white/10  rounded-3xl  p-3  text-white   placeholder:text-gray-500  resize-none  outline-none   focus:border-indigo-500  transition-all  duration-300"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt=""
                className="w-full  max-h-112  object-cover  rounded-3xl  border  border-white/10"
              />

              <button
                onClick={() => setImagePreview("")}
                className="
                  absolute top-4 right-4
                  bg-black/60
                  hover:bg-red-500
                  transition-all duration-300
                  p-3
                  rounded-full
                  text-white
                "
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Bottom */}
          <div className="flex items-center justify-between">
            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Image Upload */}
              <label
                className="flex items-center gap-2  bg-white/4  hover:bg-white/8  border  border-white/10  px-2.5 py-1 rounded-xl  cursor-pointer  transition-all  duration-300  text-gray-300  hover:text-white"
              >
                <FiImage size={18} />

                <span>Image</span>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImage}
                />
              </label>

              {/* Video Button */}
              <button
                className="flex  items-center  gap-2  bg-white/4  hover:bg-white/8  border  border-white/10  px-2.5  py-1  rounded-xl  transition-all  duration-300  text-gray-300  hover:text-white"
              >
                <FiVideo size={18} />

                <span>Video</span>
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreatePost}
              disabled={loading}
              className="bg-linear-to-r  from-indigo-500   to-purple-500  hover:from-indigo-600  hover:to-purple-600  hover:scale-105  transition-all duration-300  px-4 py-2  rounded-xl  font-bold  text-white  shadow-[0_0_35px_rgba(139,92,246,0.35)]   disabled:opacity-50
              "
            >
              {loading ? "Posting..." : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
