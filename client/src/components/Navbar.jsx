import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <nav
      className="
        bg-white/10
        backdrop-blur-xl
        border-b border-white/20
        sticky top-0 z-50
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-6 py-4
          flex items-center justify-between
        "
      >
        {/* Logo */}
        <Link
          to="/"
          className="
            text-3xl font-black
            bg-gradient-to-r from-indigo-500 to-purple-500
            bg-clip-text text-transparent
            hover:scale-105
            transition-all duration-300
          "
        >
          SkillSphere AI
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span
                className="
                  text-gray-700 font-semibold
                  hidden md:block
                "
              >
                {user.user.name}
              </span>

              <button
                onClick={handleLogout}
                className="
                  bg-gradient-to-r from-red-500 to-pink-500
                  hover:from-red-600 hover:to-pink-600
                  hover:scale-105
                  transition-all duration-300
                  text-white
                  px-5 py-2
                  rounded-xl
                  shadow-lg
                  font-semibold
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  bg-gradient-to-r from-indigo-500 to-purple-500
                  hover:from-indigo-600 hover:to-purple-600
                  hover:scale-105
                  transition-all duration-300
                  text-white
                  px-5 py-2
                  rounded-xl
                  shadow-lg
                  font-semibold
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  border border-indigo-500
                  text-indigo-600
                  hover:bg-indigo-500
                  hover:text-white
                  hover:scale-105
                  transition-all duration-300
                  px-5 py-2
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
