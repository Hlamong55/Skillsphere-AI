import { useEffect, useState } from "react";

import api from "../../services/api";

import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

const FeedCenter = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/posts");

      setPosts(data.posts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      <CreatePost fetchPosts={fetchPosts} />

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
        />
      ))}
    </div>
  );
};

export default FeedCenter;