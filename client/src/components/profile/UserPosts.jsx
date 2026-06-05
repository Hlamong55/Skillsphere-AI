import {
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

import PostCard from "../feed/PostCard";

const UserPosts = ({
  userId,
}) => {
  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchPosts =
      async () => {
        try {
          const { data } =
            await api.get(
              `/posts/user/${userId}`
            );

          setPosts(data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchPosts();
  }, [userId]);

  if (loading) {
    return (
      <div
        className="
          mt-8
          text-center
          text-gray-400
        "
      >
        Loading posts...
      </div>
    );
  }

  return (
    <div
      className="
        mt-8
        space-y-6
      "
    >
      {posts.length ===
      0 ? (
        <div
          className="
            bg-white/3
            border border-white/10
            rounded-2xl
            p-10

            text-center
            text-gray-400
          "
        >
          No posts yet
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

export default UserPosts;