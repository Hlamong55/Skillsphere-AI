const RightSidebar = () => {
  return (
    <div
      className="
        sticky top-24
        space-y-5
      "
    >

      {/* Trending */}
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

      {/* Active Users */}
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

            <div
              className="
                w-12 h-12
                rounded-full
                bg-linear-to-r
                from-indigo-500
                to-purple-500
              "
            />

            <div>
              <h3 className="text-white font-semibold">
                Community Member
              </h3>

              <p className="text-gray-400 text-sm">
                Online now
              </p>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default RightSidebar;