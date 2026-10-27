
import { useContext, useEffect, useState } from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiHome,
  FiGrid,
  FiSearch,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiZap,
  FiBookOpen,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";

import EventsNavDropdown from "./EventsNavDropdown";

// Events is handled separately through dropdown
const navItems = [
  { label: "Home", path: "/", icon: FiHome },
  { label: "Feed", path: "/feed", icon: FiGrid },
  { label: "Explore", path: "/search", icon: FiSearch },
  { label: "Learn", path: "/resources", icon: FiBookOpen },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const currentUser = user?.user || user;

  const isLoggedIn = Boolean(currentUser?._id);

  const profilePath = currentUser?._id
    ? `/profile/${currentUser._id}`
    : "/login";

  const isProfilePage =
    location.pathname.startsWith("/profile/");

  // Close menus whenever navigation changes
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    setMobileOpen(false);
    setProfileOpen(false);

    logout();
    navigate("/login");
  };

  const initials = (currentUser?.name || "User")
    .trim()
    .charAt(0)
    .toUpperCase();

  const Avatar = ({ size = "small" }) => {
    const dimension =
      size === "small" ? "w-10 h-10" : "w-12 h-12";

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D1B]/90 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]">

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-20 flex items-center justify-between gap-4">

          {/* BRAND LOGO */}
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

          {/* DESKTOP NAVIGATION */}
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

          {/* RIGHT ACTIONS */}
          <div className="hidden lg:flex items-center gap-3">

            {isLoggedIn ? (
              <>
                {/* PROFILE MENU */}
                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setProfileOpen((previous) => !previous)
                    }
                    aria-expanded={profileOpen}
                    aria-label="Open profile menu"
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 border transition-all duration-300 ${
                      isProfilePage || profileOpen
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Avatar />

                    <div className="text-left max-w-32">
                      <p className="text-sm font-semibold text-white truncate">
                        {currentUser?.name || "User"}
                      </p>
                    </div>

                    <FiChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* PROFILE DROPDOWN */}
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

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen((previous) => !previous)
            }
            aria-label={
              mobileOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileOpen}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            {mobileOpen ? (
              <FiX size={23} />
            ) : (
              <FiMenu size={23} />
            )}
          </button>

        </div>

        {/* MOBILE NAVIGATION */}
        {mobileOpen && (
          <div className="lg:hidden pb-5 pt-3 border-t border-white/10 space-y-2">

            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                      : "text-gray-300 hover:bg-white/10"
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}

            {/* MOBILE EVENTS NAVIGATION */}
            <EventsNavDropdown
              mobile
              isLoggedIn={isLoggedIn}
              onNavigate={() =>
                setMobileOpen(false)
              }
            />

            {isLoggedIn ? (
              <>
                <Link
                  to={profilePath}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10"
                >
                  <FiUser size={20} />
                  My Profile
                </Link>

                <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10">

                  <Avatar />

                  <div>
                    <p className="font-semibold text-white text-sm">
                      {currentUser?.name}
                    </p>

                    <p className="text-gray-400 text-xs">
                      @{currentUser?.username}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold"
                >
                  <FiLogOut size={20} />
                  Logout
                </button>

              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3">

                <Link
                  to="/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="text-center py-3 border border-white/10 rounded-xl text-white font-semibold"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="text-center py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold"
                >
                  Register
                </Link>

              </div>
            )}

          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;
