
import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiHome,
  FiTrendingUp,
  FiBookmark,
  FiCpu,
  FiSearch,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";

// ========================================
// SIDEBAR NAVIGATION

const menuItems = [
  {
    label: "Feed",
    path: "/feed",
    icon: FiHome,
    available: true,
  },
  {
    label: "Explore",
    path: "/search",
    icon: FiSearch,
    available: true,
  },
  {
    label: "Saved Posts",
    path: "/saved-posts",
    icon: FiBookmark,
    available: true,
  },
  {
    label: "AI Tools",
    path: "/ai-lab",
    icon: FiCpu,
    available: true,
  },
  {
    label: "Trending",
    path: null,
    icon: FiTrendingUp,
    available: false,
  },
];

// ========================================
// LEFT SIDEBAR

const LeftSidebar = () => {
  const { user: authUser } =
    useContext(AuthContext);

  const currentUser =
    authUser?.user || authUser;

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  const profilePath = currentUserId
    ? `/profile/${currentUserId}`
    : "/login";

  const displayName =
    currentUser?.name ||
    "SkillSphere Member";

  const displayUsername =
    currentUser?.username ||
    "community";

  const profilePicture =
    currentUser?.profilePicture || "";

  const firstLetter =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <aside className="sticky top-24 space-y-5">

      {/* ==================================
          PROFILE CARD
      ================================== */}

      <Link
        to={profilePath}
        className="block rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10"
      >

        <div className="flex items-center gap-3">

          {/* PROFILE PICTURE */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-purple-600">

            {/* Fallback Initial */}
            <span className="text-xl font-bold text-white">
              {firstLetter}
            </span>

            {/* Actual Profile Image */}
            {profilePicture && (
              <img
                src={profilePicture}
                alt={displayName}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            )}

          </div>

          {/* PROFILE INFORMATION */}
          <div className="min-w-0 flex-1">

            <h2 className="truncate text-base font-bold text-white">
              {displayName}
            </h2>

            <p className="mt-1 truncate text-xs text-gray-400">
              @{displayUsername}
            </p>

            <p className="mt-2 text-xs font-medium text-indigo-300">
              View My Profile
            </p>

          </div>

          <FiArrowRight
            size={16}
            className="shrink-0 text-gray-500"
          />

        </div>

      </Link>

      {/* ==================================
          NAVIGATION CARD
      ================================== */}

      <nav
        aria-label="Feed sidebar navigation"
        className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
      >

        <div className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            // ==================================
            // NOT IMPLEMENTED YET
            // ==================================

            if (!item.available) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl px-4 py-3 text-gray-500"
                  title={`${item.label} - Coming Soon`}
                  aria-disabled="true"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <Icon
                      size={19}
                      className="shrink-0"
                    />

                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>

                  </div>

                  <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] text-gray-500">
                    Soon
                  </span>

                </div>
              );
            }

            // ==================================
            // ACTIVE FUNCTIONAL LINKS
            // ==================================

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "border border-indigo-500/20 bg-indigo-500/15 text-indigo-300"
                      : "border border-transparent text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >

                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span>{item.label}</span>

              </NavLink>
            );
          })}

        </div>

      </nav>

      {/* ==================================
          AI RECOMMENDATION CARD
      ================================== */}

      <div className="rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/20 to-purple-500/20 p-5">

        <div className="mb-3 flex items-center gap-2">

          <FiZap
            size={18}
            className="text-indigo-300"
          />

          <p className="text-sm font-semibold text-indigo-300">
            AI Recommendation
          </p>

        </div>

        <h3 className="text-lg font-bold leading-relaxed text-white">
          Explore modern AI collaboration
          and real-time networking.
        </h3>

        <p className="mt-3 text-xs leading-5 text-gray-400">
          Discover learning resources,
          build your skills, and connect
          with the community.
        </p>

        <Link
          to="/resources"
          className="mt-5 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/50"
        >
          Explore Learning
          <FiArrowRight size={18} />
        </Link>

      </div>

    </aside>
  );
};

export default LeftSidebar;
