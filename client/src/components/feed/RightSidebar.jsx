import SuggestedUsers from "./SuggestedUsers";
import ActiveCommunity from "./ActiveCommunity";

const RightSidebar = () => {
  return (
    <div
      className="sticky top-24 space-y-5"
    >
      {/* Suggested Users */}
      <SuggestedUsers />

      {/* Trending Topics */}
      <div
        className=" bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 "
      >
        <h2
          className=" text-white text-lg font-bold mb-5 "
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
            className=" py-3 border-b border-white/5 text-gray-300 hover:text-white transition-all duration-300 cursor-pointer "
          >
            {topic}
          </div>
        ))}
      </div>

      {/* Active Community */}
      <ActiveCommunity></ActiveCommunity>

    </div>
  );
};

export default RightSidebar;