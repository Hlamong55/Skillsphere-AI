import { Link } from "react-router-dom";

const LeftSidebar = () => {
  return (
    <div
      className="
        sticky top-24
        space-y-5
      "
    >

      {/* Profile Card */}
      <div
        className="
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          rounded-2xl
          p-5
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              w-14 h-14
              rounded-full
              bg-gradient-to-r
              from-indigo-500
              to-purple-500
            "
          />

          <div>
            <h2
              className="
                text-lg
                font-bold
                text-white
              "
            >
              Rifat
            </h2>

            <p className="text-gray-400 text-sm">
              AI Enthusiast
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}
      <div
        className="
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          rounded-2xl
          p-3
        "
      >

        {[
          "Feed",
          "Trending",
          "Saved Posts",
          "AI Tools",
          "Messages",
        ].map((item, index) => (

          <Link
            key={index}
            to="/feed"
            className="
              flex items-center
              px-4 py-3
              rounded-xl
              text-gray-300
              hover:bg-white/10
              hover:text-white
              transition-all duration-300
              font-medium
            "
          >
            {item}
          </Link>

        ))}

      </div>

      {/* AI Box */}
      <div
        className="
          bg-gradient-to-br
          from-indigo-500/20
          to-purple-500/20
          border border-indigo-500/20
          rounded-2xl
          p-5
        "
      >

        <p
          className="
            text-indigo-300
            font-semibold
            text-sm
            mb-2
          "
        >
          AI Recommendation
        </p>

        <h2
          className="
            text-white
            font-bold
            text-lg
            leading-relaxed
          "
        >
          Explore modern AI collaboration and realtime networking.
        </h2>

      </div>

    </div>
  );
};

export default LeftSidebar;