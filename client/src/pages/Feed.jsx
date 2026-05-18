import LeftSidebar from "../components/feed/LeftSidebar";

import FeedCenter from "../components/feed/FeedCenter";

import RightSidebar from "../components/feed/RightSidebar";

const Feed = () => {
  return (
    <div
      className="
        min-h-screen
        bg-[#0B1120]
        text-white
      "
    >

      <div
        className="
          max-w-[1450px]
          mx-auto
          px-5
          py-8

          grid
          grid-cols-1
          lg:grid-cols-[260px_1fr]
          xl:grid-cols-[260px_1fr_320px]
          gap-6
        "
      >

        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Feed */}
        <div>
          <FeedCenter />
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>

      </div>

    </div>
  );
};

export default Feed;