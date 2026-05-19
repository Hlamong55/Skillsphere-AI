import { useState } from "react";

import axios from "axios";

const CreatePost = () => {
  const [content, setContent] = useState("");

  const [image, setImage] = useState("");

  const [video, setVideo] = useState("");

  const [showMedia, setShowMedia] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) return;

    try {
      await axios.post("http://localhost:5001/api/posts", {
        content,
        image,
        video,
      });

      setContent("");
      setImage("");
      setVideo("");
      setShowMedia(false);

      window.location.reload();

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="
        bg-white/5
        border border-white/10
        backdrop-blur-xl
        rounded-3xl
        p-5
      "
    >

      {/* Top */}
      <div className="flex gap-4">

        {/* Avatar */}
        <div className="w-12 ">
            <img
              src={ "https://i.pravatar.cc/100?img=2"}
              alt="user"
              className="rounded-full"
            />
          </div>

        {/* Input */}
        <div className="flex-1">

          <textarea
            rows={3}
            placeholder="Share something with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="
              w-full
              bg-[#0F172A]
              border border-white/10
              rounded-2xl
              px-5 py-4
              text-white
              placeholder:text-gray-500
              resize-none
              outline-none
              focus:border-indigo-500
              transition-all duration-300
            "
          />

          {/* Media Inputs */}
          {showMedia && (
            <div className="mt-4 space-y-3">

              <input
                type="text"
                placeholder="Image URL..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="
                  w-full
                  bg-[#0F172A]
                  border border-white/10
                  rounded-xl
                  px-4 py-3
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  focus:border-indigo-500
                "
              />

              <input
                type="text"
                placeholder="Video URL..."
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                className="
                  w-full
                  bg-[#0F172A]
                  border border-white/10
                  rounded-xl
                  px-4 py-3
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  focus:border-indigo-500
                "
              />

            </div>
          )}

        </div>

      </div>

      {/* Bottom Actions */}
      <div
        className="
          flex items-center justify-between
          mt-5
          pl-16
        "
      >

        {/* Left Actions */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => setShowMedia(!showMedia)}
            className="
              bg-white/5
              hover:bg-white/10
              border border-white/10
              transition-all duration-300
              px-3 py-1.5
              rounded-xl
              text-sm
              text-gray-300
              hover:text-white
            "
          >
            <span className="text-lg font-semibold">+</span> Media
          </button>

          <button
            className="
              bg-white/5
              hover:bg-white/10
              border border-white/10
              transition-all duration-300
              px-2.5 py-2
              rounded-xl
              text-sm
              text-gray-300
              hover:text-white
            "
          >
           ⚡ AI Tag
          </button>

        </div>

        {/* Post Button */}
        <button
          onClick={handleCreatePost}
          className="
            bg-linear-to-r
            from-indigo-500
            to-purple-500
            hover:scale-105
            transition-all duration-300
            px-6 py-3
            rounded-xl
            font-semibold
            shadow-lg shadow-indigo-500/20
          "
        >
          Create Post
        </button>

      </div>

    </div>
  );
};

export default CreatePost;