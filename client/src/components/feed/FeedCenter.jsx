import { useEffect, useState } from "react";

import api from "../../services/api";

import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

const FeedCenter = () => {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/posts");

      setPosts(data.posts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      await fetchPosts();
    };

    loadPosts();
  }, []);

  // ADD NEW POST INSTANTLY
  const addNewPost = (newPost) => {
    setPosts((prev) => [
      newPost,
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <CreatePost
        addNewPost={addNewPost}
      />

      {/* LOADING */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-60
                rounded-2xl
                border border-white/10
                bg-white/[0.03]
                animate-pulse
              "
            />
          ))}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
          />
        ))
      )}
    </div>
  );
};

export default FeedCenter;