import CreatePost from "./CreatePost";

import PostCard from "./PostCard";

const FeedCenter = () => {
  return (
    <div
      className="
        max-w-180
        mx-auto
        space-y-5
      "
    >

      <CreatePost />

      {/* Posts */}
      <PostCard />

    </div>
  );
};

export default FeedCenter;