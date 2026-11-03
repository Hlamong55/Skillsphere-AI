import { useContext, useEffect, useState } from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiGrid,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiZap,
  FiBookOpen,
  FiCpu,
  FiSearch,
  FiChevronRight,
  FiGlobe,
  FiUsers,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";

import EventsNavDropdown from "./EventsNavDropdown";

// ========================================
// SIDEBAR / NAVBAR NAVIGATION

const navItems = [
  {
    label: "Feed",
    path: "/feed",
    icon: FiGrid,
  },
  {
    label: "AI Quiz",
    path: "/ai-lab",
    icon: FiCpu,
  },
  {
    label: "Learn",
    path: "/resources",
    icon: FiBookOpen,
  },
];

// ========================================
// MOBILE MENU HELPERS
// (kept outside Navbar so they are not re-mounted on every render)
// ========================================

const SectionLabel = ({ children }) => (
  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
    {children}
  </p>
);

// Active state is decided by the parent (`active` prop), not by NavLink,
// because "/events" and "/events?view=mine" share the same pathname.
const MobileLink = ({ to, icon: Icon, label, onClick, active }) => (
  <Link
    to={to}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 ${
      active
        ? "bg-linear-to-r from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/30"
        : "hover:bg-white/5 active:bg-white/10"
    }`}
  >
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
        active
          ? "bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
          : "bg-white/5 text-gray-400 group-hover:text-white"
      }`}
    >
      <Icon size={18} />
    </span>

    <span
      className={`flex-1 text-[15px] font-semibold ${
        active ? "text-white" : "text-gray-300"
      }`}
    >
      {label}
    </span>

    <FiChevronRight
      size={16}
      className={active ? "text-indigo-300" : "text-gray-600"}
    />
  </Link>
);

// ========================================
// NAVBAR COMPONENT
// ========================================

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Navbar glass effect after scrolling
  const [isScrolled, setIsScrolled] = useState( () =>
    typeof window !== "undefined" &&
    window.scrollY > 20
  );

  const currentUser = user?.user || user;

  const isLoggedIn = Boolean(currentUser?._id);

  const profilePath = currentUser?._id
    ? `/profile/${currentUser._id}`
    : "/login";

  const isProfilePage =
    location.pathname.startsWith("/profile/");

  // ========================================
  // ACTIVE STATE FOR MOBILE MENU
  // ========================================

  const isPathActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const onEventsPage = isPathActive("/events");

  const isMyEventsActive =
    onEventsPage &&
    new URLSearchParams(location.search).get("view") === "mine";

  const isExploreActive = onEventsPage && !isMyEventsActive;

  // ========================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // ========================================

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);


  // ========================================
  // NAVBAR GLASSMORPHISM ON SCROLL
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    setMobileOpen(false);
    setProfileOpen(false);

    logout();
    navigate("/login");
  };

  // ========================================
  // USER AVATAR
  // ========================================

  const initials = (currentUser?.name || "User")
    .trim()
    .charAt(0)
    .toUpperCase();

  const Avatar = ({ size = "small" }) => {
    const dimension =
      size === "small"
        ? "w-10 h-10"
        : "w-12 h-12";

    return (
      <div
        className={`${dimension} rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold ring-2 ring-white/10`}
      >
        {currentUser?.profilePicture && !avatarError ? (
          <img
            src={currentUser.profilePicture}
            alt={currentUser.name || "Profile"}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  };

  // ========================================
  // NAVBAR UI
  // ========================================

  return (
    <>
      {/* FIXED + GLASS HEADER */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-in-out ${
          isScrolled
            ? "border-white/15 bg-[#080D1B]/50 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            : "border-white/10 bg-[#080D1B]/95 backdrop-blur-sm shadow-none"
        }`}
      >

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between gap-4">

            {/* ==================================
                BRAND LOGO
            ================================== */}

            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 group"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-300">
                <FiZap size={24} className="text-white" />
              </div>

              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-tight">

                  <span className="text-white">
                    SkillSphere
                  </span>

                  <span className="bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    {" "}AI
                  </span>

                </span>

                <span className="hidden sm:block text-[10px] tracking-[0.22em] uppercase text-gray-500 font-semibold">
                  Learn • Share • Grow
                </span>
              </div>
            </Link>

            {/* ==================================
                DESKTOP NAVIGATION
            ================================== */}

            <div className="hidden lg:flex items-center gap-1 bg-white/3 border border-white/6 p-1.5 rounded-2xl">

              {navItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}

              {/* EVENTS DROPDOWN */}

              <EventsNavDropdown
                isLoggedIn={isLoggedIn}
              />

            </div>

            {/* ==================================
                DESKTOP RIGHT ACTIONS
            ================================== */}

            <div className="hidden lg:flex items-center gap-3">

              {isLoggedIn ? (
                <>

                  {/* ==================================
                      Visible after login.
                      Opens Explore Page.
                      Icon only, no text.
                  ================================== */}

                  <NavLink
                    to="/search"
                    aria-label="Explore"
                    title="Explore"
                    className={({ isActive }) =>
                      `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isActive
                          ? " bg-indigo-500/35 text-indigo-300"
                          : " hover:border-indigo-500/30 hover:bg-indigo-500/10 "
                      }`
                    }
                  >
                    <FiSearch
                      size={25}
                      aria-hidden="true"
                    />
                  </NavLink>

                  {/* ==================================
                      EXISTING PROFILE MENU
                  ================================== */}

                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setProfileOpen(
                          (previous) => !previous
                        )
                      }
                      aria-expanded={profileOpen}
                      aria-label="Open profile menu"
                      className={`flex items-center gap-2 rounded-2xl p-2  transition-all duration-300 ${
                        isProfilePage || profileOpen
                          ? "border-indigo-500/40 bg-indigo-500/10"
                          : "border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <Avatar />

                      {/* Existing profile name is hidden */}

                      <FiChevronDown
                        size={18}
                        className={`text-gray-200  transition-transform ${
                          profileOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {/* ==================================
                        PROFILE DROPDOWN
                    ================================== */}

                    {profileOpen && (
                      <>

                        <button
                          type="button"
                          aria-label="Close profile menu"
                          onClick={() =>
                            setProfileOpen(false)
                          }
                          className="fixed inset-0 z-40 cursor-default"
                        />

                        <div className="absolute right-0 top-full mt-3 w-64 z-50 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">

                          <div className="px-3 py-3 border-b border-white/10 mb-2">

                            <p className="text-white font-bold truncate">
                              {currentUser?.name}
                            </p>

                            <p className="text-gray-400 text-xs truncate mt-1">
                              {currentUser?.email}
                            </p>

                          </div>

                          <Link
                            to={profilePath}
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <FiUser size={18} />
                            My Profile
                          </Link>

                          <Link
                            to="/feed"
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <FiGrid size={18} />
                            Community Feed
                          </Link>

                          <div className="border-t border-white/10 my-2" />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-left"
                          >
                            <FiLogOut size={18} />
                            Logout
                          </button>

                        </div>

                      </>
                    )}

                  </div>

                </>
              ) : (
                <>

                  {/* EXISTING LOGIN + REGISTER */}

                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-300 hover:text-white font-semibold transition-all"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                  >
                    Get Started
                  </Link>

                </>
              )}

            </div>

            {/* ==================================
                MOBILE RIGHT ACTIONS

                Search icon beside
                Hamburger Menu.
            ================================== */}

            <div className="flex lg:hidden items-center gap-2">

              {/* ==================================
                  MOBILE SEARCH ICON

                  Always visible after login,
                  even when menu is closed.
              ================================== */}

              {isLoggedIn && (

                <NavLink
                  to="/search"
                  aria-label="Explore"
                  title="Explore"
                  className={({ isActive }) =>
                    `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                    }`
                  }
                >
                  <FiSearch
                    size={21}
                    aria-hidden="true"
                  />
                </NavLink>

              )}

              {/* ==================================
                  EXISTING MOBILE MENU BUTTON
              ================================== */}

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    (previous) => !previous
                  )
                }
                aria-label={
                  mobileOpen
                    ? "Close menu"
                    : "Open menu"
                }
                aria-expanded={mobileOpen}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                {mobileOpen ? (
                  <FiX size={23} />
                ) : (
                  <FiMenu size={23} />
                )}
              </button>

            </div>

          </div>

          {/* ==================================
              MOBILE NAVIGATION (REDESIGNED)
          ================================== */}

          {mobileOpen && (
            <div className="lg:hidden max-h-[calc(100vh-5rem)] space-y-5 overflow-y-auto border-t border-white/10 pb-6 pt-4 scrollbar-none [&::-webkit-scrollbar]:hidden">

              {/* USER CARD */}
              {isLoggedIn && (
                <Link
                  to={profilePath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-linear-to-br from-indigo-500/15 via-purple-500/5 to-transparent p-3"
                >
                  <Avatar size="large" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">
                      {currentUser?.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      @{currentUser?.username}
                    </p>
                  </div>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                    View
                  </span>
                </Link>
              )}

              {/* MAIN */}
              <div>
                <SectionLabel>Menu</SectionLabel>

                <div className="space-y-1">
                  {navItems.map(({ label, path, icon }) => (
                    <MobileLink
                      key={path}
                      to={path}
                      icon={icon}
                      label={label}
                      active={isPathActive(path)}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* EVENTS */}
              <div>
                <SectionLabel>Events</SectionLabel>

                <div className="space-y-1">
                  <MobileLink
                    to="/events"
                    icon={FiGlobe}
                    label="Explore Events"
                    active={isExploreActive}
                    onClick={() => setMobileOpen(false)}
                  />

                  {isLoggedIn && (
                    <MobileLink
                      to="/events?view=mine"
                      icon={FiUsers}
                      label="My Events"
                      active={isMyEventsActive}
                      onClick={() => setMobileOpen(false)}
                    />
                  )}
                </div>
              </div>

              {/* ACCOUNT */}
              {isLoggedIn ? (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]"
                  >
                    <FiLogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-white/10 py-3 text-center font-semibold text-white hover:bg-white/5"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-500/20"
                  >
                    Register
                  </Link>
                </div>
              )}

            </div>
          )}

        </nav>

      </header>

      {/* SPACER: keeps page content below the fixed navbar (h-20 = navbar height) */}
      <div aria-hidden="true" className="h-20" />
    </>
  );
};

export default Navbar;