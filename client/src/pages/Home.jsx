import { useContext, useEffect, useRef } from "react";

import gsap from "gsap";

import { AuthContext } from "../context/AuthContext";

import heroImage from "../assets/hero1.jpg";

const Home = () => {

  const { user } = useContext(AuthContext);

  const heroTextRef = useRef();

  const heroImageRef = useRef();

  const blob1Ref = useRef();

  const blob2Ref = useRef();

  useEffect(() => {

    gsap.fromTo(
      heroTextRef.current,

      {
        opacity: 0,
        y: 100,
      },

      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
      },
    );

    gsap.fromTo(
      heroImageRef.current,

      {
        opacity: 0,
        x: 100,
        scale: 0.8,
      },

      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 1.4,
        ease: "power4.out",
      },
    );

    gsap.to(blob1Ref.current, {
      y: 40,
      x: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(blob2Ref.current, {
      y: -30,
      x: -20,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

  }, []);

  return (
    <div
      className="
        relative
        overflow-hidden
        min-h-screen
        p-6
      "
    >

      {/* Background Glow */}
      <div
        ref={blob1Ref}
        className="
          absolute
          top-20
          left-10
          w-[400px]
          h-[400px]
          bg-indigo-500/20
          blur-[120px]
          rounded-full
        "
      />

      <div
        ref={blob2Ref}
        className="
          absolute
          bottom-10
          right-10
          w-[400px]
          h-[400px]
          bg-purple-500/20
          blur-[120px]
          rounded-full
        "
      />

      <div
        className="
          max-w-7xl
          mx-auto
          relative z-10
        "
      >

        {/* Hero */}
        <div
          className="
            grid lg:grid-cols-2
            gap-20
            items-center
            min-h-[90vh]
          "
        >

          {/* Left */}
          <div
            ref={heroTextRef}
            className="space-y-10"
          >

            {/* Badge */}
            <div
              className="
                inline-flex
                items-center gap-3
                px-5 py-2
                rounded-full
                bg-white/5
                border border-white/10
                backdrop-blur-xl
                text-indigo-300
                font-semibold
              "
            >
              ⚡ AI-Powered Realtime Learning Platform
            </div>

            {/* Heading */}
            <div className="space-y-4">

              <h1
                className="
                  text-6xl md:text-7xl
                  font-black
                  leading-tight
                  tracking-tight
                "
              >
                <span
                  className="
                    bg-gradient-to-r
                    from-indigo-400
                    via-purple-400
                    to-pink-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  Learn.
                </span>

                <br />

                <span className="text-white">
                  Connect.
                </span>

                <br />

                <span className="text-gray-400">
                  Grow.
                </span>
              </h1>

            </div>

            {/* Paragraph */}
            <p
              className="
                text-xl
                text-gray-400
                leading-relaxed
                max-w-2xl
              "
            >
              SkillSphere AI combines realtime collaboration,
              AI-powered recommendations, modern networking,
              TensorFlow intelligence and social learning
              into one futuristic platform.
            </p>

            {/* Buttons */}
            {!user && (
              <div className="flex flex-wrap gap-5">

                <button
                  className="
                    bg-gradient-to-r
                    from-indigo-500
                    to-purple-500
                    hover:scale-105
                    transition-all duration-300
                    text-white
                    px-8 py-4
                    rounded-2xl
                    shadow-lg shadow-indigo-500/30
                    font-bold
                    text-lg
                  "
                >
                  Get Started
                </button>

                <button
                  className="
                    bg-white/5
                    border border-white/10
                    backdrop-blur-xl
                    hover:bg-white/10
                    hover:scale-105
                    transition-all duration-300
                    text-gray-200
                    px-8 py-4
                    rounded-2xl
                    font-bold
                    text-lg
                  "
                >
                  Explore Community
                </button>

              </div>
            )}

          </div>

          {/* Right */}
          <div
            ref={heroImageRef}
            className="relative"
          >

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-indigo-500/20
                to-purple-500/20
                blur-3xl
                rounded-[40px]
              "
            />

            <img
              src={heroImage}
              alt="AI Hero"
              className="
                relative
                rounded-[40px]
                border border-white/10
                shadow-2xl
                object-cover
                w-full
                h-140
              "
            />

          </div>

        </div>

        {/* Stats */}
        <div
          className="
            grid md:grid-cols-3
            gap-8
            py-16
          "
        >

          {[
            {
              title: "Realtime Collaboration",
              desc: "Instant comments, reactions and live communication with Socket.IO.",
            },

            {
              title: "AI Recommendations",
              desc: "TensorFlow-powered smart learning suggestions and predictions.",
            },

            {
              title: "Modern Community",
              desc: "Professional networking and futuristic social learning experience.",
            },
          ].map((item, index) => (

            <div
              key={index}
              className="
                bg-white/5
                border border-white/10
                backdrop-blur-2xl
                rounded-3xl
                p-8
                hover:border-indigo-500/30
                hover:translate-y-[-5px]
                transition-all duration-500
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                  mb-4
                "
              >
                {item.title}
              </h2>

              <p
                className="
                  text-gray-400
                  leading-relaxed
                "
              >
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Home;