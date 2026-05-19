import { useEffect, useState } from "react";

import axios from "axios";

const PostCard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/posts"
        );

        setPosts(res.data.posts);

      } catch (error) {
        console.log(error);
      }
    };

    fetchPosts();

  }, []);

  return (
    <div className="space-y-5">

      {posts.map((post) => (

        <div
          key={post._id}
          className="
            bg-white/5
            border border-white/10
            backdrop-blur-xl
            rounded-3xl
            p-6
          "
        >

          {/* Top */}
          <div className="flex items-center gap-4">

            {/* Avatar */}
            <div
              className="
                w-14 h-14
                rounded-full
                bg-linear-to-r
                from-indigo-500
                to-purple-500
                shadow-lg shadow-indigo-500/20
              "
            />

            {/* User */}
            <div>

              <h2
                className="
                  text-white
                  text-xl
                  font-bold
                "
              >
                {post.user?.name}
              </h2>

              <p className="text-gray-400">
                @{post.user?.username}
              </p>

            </div>

          </div>

          {/* Content */}
          <div className="mt-5">

            <p
              className="
                text-gray-200
                text-lg
                leading-relaxed
              "
            >
              {post.content}
            </p>

          </div>

          {/* Image */}
          {post.image && (
            <img
              src={post.image}
              alt="post"
              className="
                mt-5
                w-full
                rounded-2xl
                object-cover
                max-h-125
              "
            />
          )}

          {/* Video */}
          {post.video && (
            <div className="mt-5">

              <iframe
                src={post.video}
                title="video"
                className="
                  w-full
                  h-100
                  rounded-2xl
                "
                allowFullScreen
              />

            </div>
          )}

          {/* Divider */}
          <div
            className="
              border-t border-white/10
              my-5
            "
          />

          {/* Actions */}
          <div
            className="
              flex items-center gap-8
            "
          >

            <button
              className="
                flex items-center gap-2
                text-gray-400
                hover:text-indigo-400
                transition-all duration-300
                font-medium
              "
            >
              👍
              <span>{post.likes?.length || 0}</span>
            </button>

            <button
              className="
                flex items-center gap-2
                text-gray-400
                hover:text-red-400
                transition-all duration-300
                font-medium
              "
            >
              👎
              <span>{post.dislikes?.length || 0}</span>
            </button>

            <button
              className="
                flex items-center gap-2
                text-gray-400
                hover:text-white
                transition-all duration-300
                font-medium
              "
            >
              💬
              <span>{post.commentsCount || 0}</span>
            </button>

          </div>

        </div>

      ))}

    </div>
  );
};

export default PostCard;