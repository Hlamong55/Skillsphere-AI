import { useState } from "react";

import api from "../services/api";

const CreatePost = ({ fetchPosts }) => {

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setLoading(true);

      await api.post("/posts", {
        content,
      });

      setContent("");

      fetchPosts();

    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        bg-white/5
        border border-white/10
        backdrop-blur-2xl
        rounded-3xl
        p-8
        shadow-2xl
      "
    >

      <form onSubmit={handleCreatePost}>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts with the community..."
          rows="5"
          className="
            w-full
            bg-black/20
            border border-white/10
            rounded-2xl
            p-5
            text-lg
            text-white
            placeholder:text-gray-500
            outline-none
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-500/30
            resize-none
            transition-all duration-300
          "
        />

        <div
          className="
            flex items-center justify-between
            mt-6
          "
        >

          <p
            className="
              text-gray-500
              font-medium
            "
          >
            AI-powered realtime interaction ⚡
          </p>

          <button
            type="submit"
            disabled={loading}
            className="
              bg-gradient-to-r
              from-indigo-500
              to-purple-500
              hover:scale-105
              transition-all duration-300
              text-white
              px-8 py-3
              rounded-2xl
              shadow-lg shadow-indigo-500/30
              font-bold
              disabled:opacity-50
            "
          >
            {loading ? "Posting..." : "Create Post"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreatePost;