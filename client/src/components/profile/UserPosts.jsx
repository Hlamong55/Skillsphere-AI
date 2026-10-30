
import {
  FiFileText,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import PostCard from "../feed/PostCard";

const UserPosts = ({
  posts = [],
  error = "",
  onRetry,
  isOwnProfile = false,
}) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-4 sm:p-6 lg:p-8">

      {/* SECTION HEADER */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
          <FiFileText
            size={21}
            className="text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            {isOwnProfile
              ? "My Posts"
              : "Community Posts"}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Posts, images and videos shared
            with the community.
          </p>
        </div>

      </div>

      {/* ERROR STATE */}
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center"
        >

          <FiAlertCircle
            size={32}
            className="mx-auto mb-3 text-red-400"
          />

          <p className="text-sm text-gray-300">
            {error}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <FiRefreshCw />
              Try Again
            </button>
          )}

        </div>

      ) : posts.length === 0 ? (

        /* EMPTY STATE */
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1120] px-5 py-16 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <FiFileText
              size={28}
              className="text-indigo-400"
            />
          </div>

          <h3 className="text-lg font-bold text-white">
            No Posts Yet
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
            {isOwnProfile
              ? "You haven't shared any posts yet. Your community posts will appear here."
              : "This member hasn't shared any posts yet."}
          </p>

        </div>

      ) : (

        /* EXISTING REUSABLE POST CARDS */
        <div className="mx-auto max-w-5xl space-y-5">

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
            />
          ))}

        </div>

      )}

    </section>
  );
};

export default UserPosts;
