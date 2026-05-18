/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

import api from "../services/api";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

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
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div
        className="
          flex items-center justify-center
          py-20
        "
      >
        <div
          className="
            w-14 h-14
            border-4
            border-indigo-500
            border-t-transparent
            rounded-full
            animate-spin
          "
        />
      </div>
    );
  }

  return (
    <div
      className="
        max-w-4xl
        mx-auto
        space-y-8
      "
    >
        <CreatePost fetchPosts={fetchPosts} />

      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
          />
        ))
      ) : (
        <div
          className="
            bg-white/50
            backdrop-blur-xl
            border border-white/30
            rounded-3xl
            p-10
            text-center
            shadow-xl
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-gray-700
            "
          >
            No posts available yet.
          </h2>
        </div>
      )}
    </div>
  );
};

export default Feed;