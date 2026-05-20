import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
} from "react-icons/fi";

const PostCard = ({ post }) => {
  return (
    <div
      className="
        bg-white/[0.03]
        border border-white/10
        backdrop-blur-2xl
        rounded-[28px]
        overflow-hidden
        shadow-[0_10px_50px_rgba(0,0,0,0.45)]
        hover:border-indigo-500/20
        transition-all duration-500
      "
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="
                w-14 h-14
                rounded-full
                bg-gradient-to-r
                from-indigo-500
                to-purple-500
                shadow-lg
                shrink-0
              "
            />

            {/* User Info */}
            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                  leading-none
                "
              >
                {post?.user?.name || "Unknown User"}
              </h2>

              <p
                className="
                  text-gray-400
                  text-sm
                  mt-1
                "
              >
                @{post?.user?.username || "anonymous"}
              </p>
            </div>
          </div>

          {/* More */}
          <button
            className="
              text-gray-500
              hover:text-white
              transition-all duration-300
            "
          >
            <FiMoreHorizontal size={20} />
          </button>
        </div>

        {/* Content */}
        <p
          className="
            text-gray-200
            text-[17px]
            leading-8
            mt-6
          "
        >
          {post?.content}
        </p>
      </div>

      {/* Image */}
      {post?.image && (
        <img
          src={post.image}
          alt=""
          className="
            w-full
            max-h-[500px]
            object-cover
          "
        />
      )}

      {/* Bottom */}
      <div
        className="
          px-6 py-4
          border-t border-white/10
          flex items-center justify-between
        "
      >
        {/* Actions */}
        <div className="flex items-center gap-7">
          <button
            className="
              flex items-center gap-2
              text-gray-400
              hover:text-pink-500
              transition-all duration-300
            "
          >
            <FiHeart size={21} />

            <span className="text-sm font-medium">
              {post?.likes?.length || 0}
            </span>
          </button>

          <button
            className="
              flex items-center gap-2
              text-gray-400
              hover:text-indigo-400
              transition-all duration-300
            "
          >
            <FiMessageCircle size={21} />

            <span className="text-sm font-medium">
              {post?.commentsCount || 0}
            </span>
          </button>

          <button
            className="
              flex items-center gap-2
              text-gray-400
              hover:text-green-400
              transition-all duration-300
            "
          >
            <FiShare2 size={21} />

            <span className="text-sm font-medium">
              Share
            </span>
          </button>
        </div>

        {/* Right */}
        <p className="text-gray-500 text-xs">
          AI Community Post
        </p>
      </div>
    </div>
  );
};

export default PostCard;