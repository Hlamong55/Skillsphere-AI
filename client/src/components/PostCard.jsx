const PostCard = ({ post }) => {
  return (
    <div
      className="
        bg-white/5
        border border-white/10
        backdrop-blur-2xl
        rounded-3xl
        p-8
        shadow-2xl
        hover:border-indigo-500/30
        hover:translate-y-[-5px]
        transition-all duration-500
      "
    >

      {/* User */}
      <div className="flex items-center gap-5 mb-6">

        <div
          className="
            w-14 h-14
            rounded-full
            bg-gradient-to-r
            from-indigo-500
            to-purple-500
            shadow-lg shadow-indigo-500/30
          "
        />

        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            {post.user?.name}
          </h2>

          <p
            className="
              text-gray-400
            "
          >
            @{post.user?.username}
          </p>
        </div>

      </div>

      {/* Content */}
      <p
        className="
          text-gray-200
          text-lg
          leading-relaxed
        "
      >
        {post.content}
      </p>

      {/* Image */}
      {post.image && (
        <div className="overflow-hidden rounded-3xl mt-6">

          <img
            src={post.image}
            alt="post"
            className="
              w-full
              max-h-[500px]
              object-cover
              hover:scale-105
              transition-all duration-700
            "
          />

        </div>
      )}

      {/* Actions */}
      <div
        className="
          flex items-center gap-8
          mt-8 pt-6
          border-t border-white/10
        "
      >

        <button
          className="
            flex items-center gap-2
            text-indigo-400
            font-semibold
            hover:text-indigo-300
            hover:scale-110
            transition-all duration-300
          "
        >
          👍 {post.likes?.length || 0}
        </button>

        <button
          className="
            flex items-center gap-2
            text-red-400
            font-semibold
            hover:text-red-300
            hover:scale-110
            transition-all duration-300
          "
        >
          👎 {post.dislikes?.length || 0}
        </button>

        <button
          className="
            flex items-center gap-2
            text-gray-300
            font-semibold
            hover:text-white
            hover:scale-110
            transition-all duration-300
          "
        >
          💬 {post.commentsCount || 0}
        </button>

      </div>

    </div>
  );
};

export default PostCard;