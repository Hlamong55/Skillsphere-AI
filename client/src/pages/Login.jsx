import { useState, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";

import { FiMail, FiLock } from "react-icons/fi";

import { BsStars } from "react-icons/bs";

import api from "../services/api";

import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post(
        "/auth/login",
        formData
      );

      login(data);

      navigate("/feed");

    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#0B1120]
        relative
        overflow-hidden
        flex items-center justify-center
        px-6
      "
    >

      {/* Background Glow */}
      <div
        className="
          absolute
          top-[-200px]
          right-[-100px]
          w-[500px]
          h-[500px]
          bg-purple-600/30
          blur-[140px]
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-200px]
          left-[-100px]
          w-[500px]
          h-[500px]
          bg-indigo-600/30
          blur-[140px]
          rounded-full
        "
      />

      {/* Main Container */}
      <div
        className="
          relative z-10
          w-full
          max-w-6xl

          grid
          lg:grid-cols-2
          gap-10
          items-center
        "
      >

        {/* Left Side */}
        <div className="hidden lg:block">

          <div
            className="
              inline-flex
              items-center gap-2
              bg-white/5
              border border-white/10
              backdrop-blur-xl
              px-4 py-2
              rounded-full
              text-indigo-300
              mb-8
            "
          >
            <BsStars />

            AI Powered Social Learning Platform
          </div>

          <h1
            className="
              text-6xl
              font-black
              leading-tight
              text-white
            "
          >
            Connect.
            <br />

            Learn.
            <br />

            Grow.
          </h1>

          <p
            className="
              text-gray-400
              text-lg
              leading-relaxed
              mt-8
              max-w-xl
            "
          >
            SkillSphere AI helps learners, developers,
            and professionals collaborate in realtime
            with AI-powered recommendations,
            networking, and interactive discussions.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-5">

            {[
              "Realtime Community Interaction",
              "AI Powered Recommendations",
              "Modern Social Learning Experience",
            ].map((item, index) => (

              <div
                key={index}
                className="
                  flex items-center gap-4
                "
              >

                <div
                  className="
                    w-3 h-3
                    rounded-full
                    bg-gradient-to-r
                    from-indigo-500
                    to-purple-500
                  "
                />

                <p className="text-gray-300">
                  {item}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Right Side */}
        <div
          className="
            bg-white/5
            border border-white/10
            backdrop-blur-2xl
            rounded-3xl
            p-8 md:p-10
            shadow-2xl
          "
        >

          {/* Header */}
          <div className="mb-8">

            <h2
              className="
                text-4xl
                font-black
                text-white
                mb-3
              "
            >
              Welcome Back
            </h2>

            <p className="text-gray-400">
              Login to continue your AI-powered journey.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                Email Address
              </label>

              <div
                className="
                  flex items-center gap-3
                  bg-[#111827]
                  border border-white/10
                  focus-within:border-indigo-500
                  rounded-2xl
                  px-4
                  transition-all duration-300
                "
              >

                <FiMail className="text-gray-500 text-lg" />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  className="
                    w-full
                    bg-transparent
                    py-4
                    text-white
                    placeholder:text-gray-500
                    outline-none
                  "
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                Password
              </label>

              <div
                className="
                  flex items-center gap-3
                  bg-[#111827]
                  border border-white/10
                  focus-within:border-indigo-500
                  rounded-2xl
                  px-4
                  transition-all duration-300
                "
              >

                <FiLock className="text-gray-500 text-lg" />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  className="
                    w-full
                    bg-transparent
                    py-4
                    text-white
                    placeholder:text-gray-500
                    outline-none
                  "
                />

              </div>

            </div>

            {/* Login Button */}
            <button
              className="
                w-full
                bg-gradient-to-r
                from-indigo-500
                to-purple-500

                hover:from-indigo-600
                hover:to-purple-600

                hover:scale-[1.02]

                transition-all duration-300

                text-white
                py-4
                rounded-2xl

                font-bold
                text-lg

                shadow-lg
                shadow-indigo-500/20
              "
            >
              Login to SkillSphere
            </button>

          </form>

          {/* Footer */}
          <p
            className="
              text-gray-400
              text-center
              mt-8
            "
          >
            Don&apos;t have an account?{" "}

            <Link
              to="/register"
              className="
                text-indigo-400
                hover:text-purple-400
                transition-all duration-300
                font-semibold
              "
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