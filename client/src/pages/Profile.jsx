
import {
  useContext,
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";
import { FiAlertCircle, FiLoader, FiRefreshCw } from "react-icons/fi";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import UserPosts from "../components/profile/UserPosts";

const Profile = () => {
  const { id } = useParams();

  const { user: authUser } = useContext(AuthContext);

  const currentUser = authUser?.user || authUser;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // ========================================
  // FETCH PROFILE AND POSTS
  // ========================================

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid profile.");
      return;
    }

    const controller = new AbortController();

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setPostsError("");
      setUser(null);
      setPosts([]);

      const results = await Promise.allSettled([
        api.get(`/users/${id}`, {
          signal: controller.signal,
        }),

        api.get(`/posts/user/${id}`, {
          signal: controller.signal,
        }),
      ]);

      if (controller.signal.aborted) return;

      const [profileResult, postsResult] = results;

      if (profileResult.status === "fulfilled") {
        setUser(profileResult.value.data);
      } else {
        setError(
          profileResult.reason?.response?.data?.message ||
          "Unable to load this profile."
        );
      }

      if (postsResult.status === "fulfilled") {
        const data = postsResult.value.data;

        setPosts(Array.isArray(data) ? data : []);
      } else {
        setPostsError("Unable to load user posts.");
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      controller.abort();
    };
  }, [id, reloadKey]);

  const handleRetry = () => {
    setReloadKey((previous) => previous + 1);
  };

  const isOwnProfile =
    Boolean(currentUser?._id && user?._id) &&
    String(currentUser._id) === String(user._id);

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B1120] px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-5 animate-pulse">

          <div className="h-96 rounded-3xl bg-white/5 border border-white/10" />

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white/5 border border-white/10"
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-5 text-indigo-300 text-sm">
            <FiLoader className="animate-spin" />
            Loading profile...
          </div>

        </div>
      </main>
    );
  }

  // ========================================
  // PROFILE ERROR
  // ========================================

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-8 text-center">

          <FiAlertCircle
            size={36}
            className="mx-auto mb-4 text-red-400"
          />

          <h2 className="text-xl font-bold text-white">
            Profile Unavailable
          </h2>

          <p className="mt-3 text-sm text-gray-400">
            {error || "User not found."}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <FiRefreshCw />
            Try Again
          </button>

        </div>
      </main>
    );
  }

  // ========================================
  // PROFILE PAGE
  // ========================================

  return (
    <main className="min-h-screen bg-[#0B1120] text-white">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">

        {/* COVER, AVATAR AND INFO */}
        <ProfileHeader
          user={user}
          setUser={setUser}
          currentUser={currentUser}
        />

        {/* SINGLE STATISTICS SECTION */}
        <ProfileStats
          user={user}
          postsCount={
            postsError ? null : posts.length
          }
        />

        {/* USER POSTS */}
        <UserPosts
          posts={posts}
          error={postsError}
          onRetry={handleRetry}
          isOwnProfile={isOwnProfile}
        />

      </div>
    </main>
  );
};

export default Profile;
