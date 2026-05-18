import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div
      className="
        max-w-7xl mx-auto
        px-6 py-20
      "
    >

      {/* Hero */}
      <div
        className="
          text-center
          space-y-8
        "
      >
        <h1
          className="
            text-6xl md:text-7xl
            font-black
            leading-tight
          "
        >
          <span
            className="
              bg-gradient-to-r
              from-indigo-600
              via-purple-600
              to-pink-500
              bg-clip-text
              text-transparent
            "
          >
            Learn.
          </span>

          <br />

          <span className="text-gray-800">
            Connect. Grow.
          </span>
        </h1>

        <p
          className="
            text-gray-600
            text-xl
            max-w-2xl mx-auto
            leading-relaxed
          "
        >
          AI-powered social learning platform with realtime collaboration,
          smart recommendations, and interactive community engagement.
        </p>

        {!user && (
          <div className="flex items-center justify-center gap-5">

            <button
              className="
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:from-indigo-700 hover:to-purple-700
                hover:scale-105
                transition-all duration-300
                text-white
                px-8 py-4
                rounded-2xl
                shadow-2xl
                font-bold
                text-lg
              "
            >
              Get Started
            </button>

            <button
              className="
                bg-white
                hover:bg-gray-100
                hover:scale-105
                transition-all duration-300
                px-8 py-4
                rounded-2xl
                shadow-xl
                font-bold
                text-lg
              "
            >
              Explore
            </button>

          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className="
          grid md:grid-cols-3
          gap-8
          mt-24
        "
      >

        {[
          {
            title: "Realtime Collaboration",
            desc: "Instant comments, reactions and live interactions.",
          },

          {
            title: "AI Recommendations",
            desc: "TensorFlow-powered personalized learning suggestions.",
          },

          {
            title: "Global Community",
            desc: "Connect with learners and professionals worldwide.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="
              bg-white/50
              backdrop-blur-xl
              border border-white/30
              p-8
              rounded-3xl
              shadow-xl
              hover:scale-105
              hover:shadow-2xl
              transition-all duration-300
            "
          >
            <h2
              className="
                text-2xl font-bold
                mb-4
                text-gray-800
              "
            >
              {item.title}
            </h2>

            <p
              className="
                text-gray-600
                leading-relaxed
              "
            >
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Home;