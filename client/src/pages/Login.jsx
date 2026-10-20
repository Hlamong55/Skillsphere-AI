
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

import { BsStars } from "react-icons/bs";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setLoginError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      login(data);
      navigate("/feed");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setLoginError(message);
      console.error("Login error:", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-6 overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-purple-600/20 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10 w-full">

        {/* LEFT SIDE */}
        <div className="space-y-10">

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-4 py-2.5 rounded-full text-indigo-300">
            <BsStars className="text-yellow-300 text-lg" />
            <span className="font-medium">
              AI Powered Collaboration Platform
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="text-6xl font-black leading-tight">

              <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Build.
              </span>

              <br />
              Collaborate.
              <br />
              Innovate.
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              Join the next-generation AI learning network where developers,
              creators and innovators collaborate in realtime.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {[
              "Realtime AI-powered discussions",
              "Professional developer community",
              "Interactive collaboration ecosystem",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500" />
                <p className="text-gray-300 text-lg">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white/4 border border-white/10 backdrop-blur-2xl rounded-4xl p-10 shadow-2xl">

          <div className="mb-10">
            <h2 className="text-5xl font-black mb-4">
              Welcome Back 👋
            </h2>

            <p className="text-gray-400 text-lg">
              Login to continue your SkillSphere AI journey.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* EMAIL */}
            <div className="space-y-3">
              <label
                htmlFor="login-email"
                className="text-gray-300 font-medium"
              >
                Email Address
              </label>

              <div className="flex items-center bg-[#0B1120] border border-white/20 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all duration-300">

                <div className="px-4 text-gray-400">
                  <FiMail size={22} />
                </div>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full min-w-0 bg-transparent rounded-2xl text-white placeholder:text-gray-500 py-4 pl-2 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-3">
              <label
                htmlFor="login-password"
                className="text-gray-300 font-medium"
              >
                Password
              </label>

              <div className="flex items-center bg-[#0B1120] border border-white/20 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all duration-300">

                <div className="px-4 text-gray-400">
                  <FiLock size={22} />
                </div>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full min-w-0 bg-transparent text-white placeholder:text-gray-500 py-4 pl-2 outline-none rounded-xl"
                />

                {/* Eye Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="px-4 text-gray-400 hover:text-white transition-all duration-300"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <FiEyeOff size={22} />
                  ) : (
                    <FiEye size={22} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {loginError && (
              <div
                role="alert"
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
              >
                <FiAlertCircle size={20} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:scale-[1.02] transition-all duration-300 py-4 font-bold text-xl rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <FiLoader className="animate-spin" size={22} />
                  Logging in...
                </span>
              ) : (
                "Login to SkillSphere"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-gray-400 mt-5">
            Don&apos;t have an account?{" "}

            <Link
              to="/register"
              className="text-indigo-400 hover:text-purple-400 font-semibold transition-all duration-300"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
