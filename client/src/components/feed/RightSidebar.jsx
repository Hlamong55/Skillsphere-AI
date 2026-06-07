import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  return (
    <div
      className="
        sticky top-24
        space-y-5
      "
    >
      {/* Suggested Users */}
      <SuggestedUsers />

      {/* Trending Topics */}
      <div
        className="
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          rounded-2xl
          p-5
        "
      >
        <h2
          className="
            text-white
            text-lg
            font-bold
            mb-5
          "
        >
          Trending Topics
        </h2>

        {[
          "#ArtificialIntelligence",
          "#MachineLearning",
          "#WebDevelopment",
          "#RealtimeApps",
          "#TensorFlow",
        ].map((topic, index) => (
          <div
            key={index}
            className="
              py-3
              border-b border-white/5
              text-gray-300
              hover:text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            {topic}
          </div>
        ))}
      </div>

      {/* Active Community */}
      <div
        className="
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          rounded-2xl
          p-5
        "
      >
        <h2
          className="
            text-white
            text-lg
            font-bold
            mb-5
          "
        >
          Active Community
        </h2>

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="
              flex items-center gap-4
              py-3
            "
          >
            <div className="relative">
              <div
                className="
                  w-12 h-12
                  rounded-full
                  bg-linear-to-r
                  from-indigo-500
                  to-purple-500
                "
              />

              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  w-3 h-3
                  rounded-full
                  bg-green-500
                  border-2
                  border-[#0B1120]
                "
              />
            </div>

            <div>
              <h3
                className="
                  text-white
                  font-semibold
                "
              >
                Community Member
              </h3>

              <p
                className="
                  text-gray-400
                  text-sm
                "
              >
                Online now
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Stats */}
      <div
        className="
          bg-white/5
          border border-white/10
          backdrop-blur-xl
          rounded-2xl
          p-5
        "
      >
        <h2
          className="
            text-white
            text-lg
            font-bold
            mb-5
          "
        >
          Platform Stats
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">
              Members
            </span>

            <span className="text-white font-semibold">
              10K+
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Posts
            </span>

            <span className="text-white font-semibold">
              25K+
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Skills Shared
            </span>

            <span className="text-white font-semibold">
              50K+
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;