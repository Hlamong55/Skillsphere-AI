import { useContext } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {

  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const location = useLocation();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <nav
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-black/20
        backdrop-blur-2xl
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          p-6
          flex items-center justify-between
        "
      >

        {/* Logo */}
        <Link
          to="/"
          className="
            text-4xl
            font-black
            tracking-tight
            bg-gradient-to-r
            from-indigo-400
            via-purple-400
            to-pink-400
            bg-clip-text
            text-transparent
            hover:scale-105
            transition-all duration-300
          "
        >
          SkillSphere AI
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">

          {user ? (
            <>

              {/* Feed */}
              <Link
                to="/feed"
                className={`
                  px-5 py-2
                  rounded-xl
                  font-semibold
                  transition-all duration-300
                  hover:scale-105

                  ${
                    location.pathname === "/feed"
                      ? `
                        bg-gradient-to-r
                        from-indigo-500
                        to-purple-500
                        text-white
                        shadow-lg shadow-indigo-500/30
                      `
                      : `
                        text-gray-300
                        hover:text-white
                        hover:bg-white/10
                      `
                  }
                `}
              >
                Feed
              </Link>

              {/* User */}
              <div
                className="
                  hidden md:flex
                  items-center gap-3
                  px-4 py-2
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                "
              >

                <div
                  className="
                    w-10 h-10
                    rounded-full
                    bg-gradient-to-r
                    from-indigo-500
                    to-purple-500
                  "
                />

                <span
                  className="
                    text-gray-200
                    font-semibold
                  "
                >
                  {user.user.name}
                </span>

              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="
                  bg-red-500/20
                  border border-red-500/30
                  hover:bg-red-500
                  hover:text-white
                  hover:scale-105
                  transition-all duration-300
                  text-red-300
                  px-5 py-2
                  rounded-xl
                  font-semibold
                "
              >
                Logout
              </button>

            </>
          ) : (
            <>

              {/* Login */}
              <Link
                to="/login"
                className="
                  bg-gradient-to-r
                  from-indigo-500
                  to-purple-500
                  hover:scale-105
                  transition-all duration-300
                  text-white
                  px-6 py-2
                  rounded-xl
                  shadow-lg shadow-indigo-500/30
                  font-semibold
                "
              >
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="
                  border border-white/10
                  bg-white/5
                  hover:bg-white/10
                  hover:scale-105
                  transition-all duration-300
                  text-gray-200
                  px-6 py-2
                  rounded-xl
                  font-semibold
                "
              >
                Register
              </Link>

            </>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;