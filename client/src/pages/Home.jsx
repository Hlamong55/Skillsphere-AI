import { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiBookmark,
  FiBookOpen,
  FiCamera,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiCode,
  FiCpu,
  FiCompass,
  FiGlobe,
  FiHeart,
  FiLayers,
  FiMessageCircle,
  FiPlayCircle,
  FiRadio,
  FiSend,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FiMessageCircle,
    number: "01",
    tag: "COMMUNITY",
    title: "Share your ideas",
    description:
      "Start conversations, publish updates, and exchange feedback with a community of learners and builders.",
    path: "/feed",
    action: "Explore feed",
    accent: "violet",
  },
  {
    icon: FiBookOpen,
    number: "02",
    tag: "LEARNING",
    title: "Learn something new",
    description:
      "Discover tutorials, learning videos, and PDF resources collected in one organized space.",
    path: "/resources",
    action: "Browse resources",
    accent: "cyan",
  },
  {
    icon: FiCalendar,
    number: "03",
    tag: "COLLABORATION",
    title: "Make things happen",
    description:
      "Find events, join activities, and connect around shared projects and interests.",
    path: "/events",
    action: "View events",
    accent: "pink",
  },
  {
    icon: FiUsers,
    number: "04",
    tag: "CONNECTIONS",
    title: "Meet your people",
    description:
      "Discover community members, visit profiles, and build meaningful connections through follows.",
    path: "/feed",
    action: "Meet the community",
    accent: "pink",
  },
  {
    icon: FiBookmark,
    number: "05",
    tag: "YOUR LIBRARY",
    title: "Keep what inspires you",
    description:
      "Bookmark posts worth revisiting. Your saved ideas stay organized and available when you need them.",
    path: "/saved-posts",
    action: "Saved posts",
    accent: "violet",
  },
  {
    icon: FiCpu,
    number: "06",
    tag: "AI TOOLS",
    title: "Explore AI-powered tools",
    description:
      "Try interactive AI experiences, including our TensorFlow Lite gesture-controlled quiz.",
    path: "/ai-lab",
    action: "Explore AI Lab",
    accent: "cyan",
  },
];

const steps = [
  {
    number: "01",
    icon: FiCompass,
    title: "Find your space",
    body: "Create your profile and discover people and topics that match your interests.",
  },
  {
    number: "02",
    icon: FiCode,
    title: "Learn out loud",
    body: "Explore resources, publish what you're building, and exchange ideas.",
  },
  {
    number: "03",
    icon: FiZap,
    title: "Grow together",
    body: "Join events, build connections, and turn conversations into progress.",
  },
];

function PlatformPreview() {
  return (
    <div className="ss-preview-wrap" aria-label="Illustration of the SkillSphere platform">
      <div className="ss-preview-halo" aria-hidden="true" />
      <div className="ss-preview ss-hero-visual">
        <div className="ss-preview-topbar">
          <div className="ss-preview-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="ss-preview-address">skillsphere / your space</span>
          <div className="ss-preview-mini-icon"><FiZap size={15} /></div>
        </div>
        <div className="ss-preview-body">
          <aside className="ss-preview-rail" aria-hidden="true">
            <div className="ss-rail-logo"><FiZap size={18} /></div>
            <div className="ss-rail-item ss-rail-item-active"><FiLayers size={17} /></div>
            <div className="ss-rail-item"><FiBookOpen size={17} /></div>
            <div className="ss-rail-item"><FiCalendar size={17} /></div>
            <div className="ss-rail-item"><FiUsers size={17} /></div>
            <div className="ss-rail-spacer" />
            <div className="ss-rail-avatar">S</div>
          </aside>
          <div className="ss-preview-content">
            <div className="ss-preview-welcome">
              <span className="ss-preview-overline">YOUR SPACE TO GROW</span>
              <div className="ss-preview-welcome-row">
                <h3>Big ideas start small<span>.</span></h3>
                <span className="ss-preview-sparkle"><FiZap size={19} /></span>
              </div>
              <p>Discover. Create. Connect.</p>
            </div>
            <div className="ss-preview-composer">
              <span className="ss-preview-avatar">S</span>
              <span>What are you working on today?</span>
              <span className="ss-preview-send"><FiArrowUpRight size={15} /></span>
            </div>
            <div className="ss-preview-post">
              <div className="ss-preview-post-head">
                <div className="ss-preview-post-avatar"><FiCode size={17} /></div>
                <div>
                  <strong>Build. Share. Repeat.</strong>
                  <small>A community-driven journey</small>
                </div>
                <span className="ss-preview-post-more">•••</span>
              </div>
              <p>Every new skill begins with curiosity. What will you create next?</p>
              <div className="ss-preview-post-art" aria-hidden="true">
                <div className="ss-art-code">
                  <span className="ss-art-line long" />
                  <span className="ss-art-line medium" />
                  <span className="ss-art-line short" />
                  <span className="ss-art-line medium dim" />
                </div>
                <div className="ss-art-orb"><FiZap size={28} /></div>
                <span className="ss-art-tag">idea → impact</span>
              </div>
              <div className="ss-preview-post-actions">
                <span><FiHeart size={14} /> Connect</span>
                <span><FiMessageCircle size={14} /> Discuss</span>
                <span><FiBookmark size={14} /> Save</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ss-float-card ss-float-card-top ss-orbit-card" aria-hidden="true">
        <span className="ss-float-icon"><FiRadio size={18} /></span>
        <div><strong>Stay connected</strong><span>Community in real time</span></div>
      </div>
      <div className="ss-float-card ss-float-card-bottom ss-orbit-card" aria-hidden="true">
        <span className="ss-float-icon secondary"><FiBookOpen size={18} /></span>
        <div><strong>Keep learning</strong><span>Resources for every step</span></div>
      </div>
      <div className="ss-preview-caption">INTERFACE CONCEPT · ILLUSTRATIVE PREVIEW</div>
    </div>
  );
}

const Home = () => {
  const rootRef = useRef(null);
  const { user: authUser } = useContext(AuthContext);
  const currentUser = authUser?.user || authUser;
  const isLoggedIn = Boolean(currentUser?._id || currentUser?.id);

  useEffect(() => {
    // Respect the user's OS accessibility preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const context = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });

      hero
        .from(".ss-hero-kicker", { y: 22, autoAlpha: 0, duration: 0.65 })
        .from(".ss-hero-heading", { y: 42, autoAlpha: 0, duration: 0.85 }, "-=0.35")
        .from(".ss-hero-description", { y: 24, autoAlpha: 0, duration: 0.75 }, "-=0.5")
        .from(".ss-hero-buttons", { y: 20, autoAlpha: 0, duration: 0.7 }, "-=0.45")
        .from(".ss-hero-footnote", { y: 12, autoAlpha: 0, duration: 0.55 }, "-=0.35")
        .from(".ss-hero-visual", { x: 55, y: 20, autoAlpha: 0, rotation: 2, duration: 1.15 }, 0.2)
        .from(".ss-float-card", { y: 25, autoAlpha: 0, duration: 0.65, stagger: 0.16 }, "-=0.6");

      gsap.to(".ss-orbit-card", {
        y: -12,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.45,
      });

      gsap.utils.toArray("[data-ss-reveal]").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 44,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            once: true,
          },
        });
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <main className="ss-home" ref={rootRef}>
      <div className="ss-home-grid" aria-hidden="true" />
      <div className="ss-home-glow ss-home-glow-one" aria-hidden="true" />
      <div className="ss-home-glow ss-home-glow-two" aria-hidden="true" />

      {/* Hero Section */}
      <section className="ss-hero ss-container" aria-labelledby="ss-home-title">
        <div className="ss-hero-copy">
          <div className="ss-hero-kicker"><span className="ss-status-dot" /> THE FUTURE OF LEARNING IS SOCIAL</div>
          <h1 id="ss-home-title" className="ss-hero-heading">
            Learn together.<br />
            <span>Build what&apos;s next.</span>
          </h1>
          <p className="ss-hero-description">
            One space to share ideas, discover resources, connect with inspiring people,
            and turn curiosity into real progress.
          </p>
          <div className="ss-hero-buttons">
            <Link className="ss-button ss-button-primary" to={isLoggedIn ? "/feed" : "/register"}>
              {isLoggedIn ? "Enter the Community" : "Get Started Free"}
              <FiArrowUpRight size={19} />
            </Link>
            <Link className="ss-button ss-button-outline" to="/resources">
              <FiPlayCircle size={19} /> Explore Learning
            </Link>
          </div>
          <div className="ss-hero-footnote">
            <span className="ss-footnote-icons"><FiUsers /><FiBookOpen /><FiGlobe /></span>
            <span>Learn · Share · Collaborate · Grow</span>
          </div>
        </div>
        <PlatformPreview />
        <a href="#discover" className="ss-scroll-cue" aria-label="Scroll to explore features">
          <FiArrowDown size={17} /> <span>SCROLL TO EXPLORE</span>
        </a>
      </section>

      {/* 2nd Hero Section */}
      <section className="ss-value-band" aria-label="Platform values">
        <div className="ss-container ss-value-inner">
          <span>DESIGNED FOR PEOPLE WHO</span>
          <div><FiCode /> <strong>BUILD</strong></div>
          <span className="ss-band-separator" aria-hidden="true" />
          <div><FiBookOpen /> <strong>LEARN</strong></div>
          <span className="ss-band-separator" aria-hidden="true" />
          <div><FiUsers /> <strong>CONNECT</strong></div>
          <span className="ss-band-separator" aria-hidden="true" />
          <div><FiZap /> <strong>GROW</strong></div>
        </div>
      </section>

      {/* All in One */}
      <section id="discover" className="ss-section ss-container" aria-labelledby="ss-features-title">
        <div className="ss-section-head" data-ss-reveal>
          <div>
            <div className="ss-section-eyebrow"><span className="ss-small-line" /> EVERYTHING IN ONE PLACE</div>
            <h2 id="ss-features-title">More than a platform.<br /><span>A place to progress.</span></h2>
          </div>
          <p>Everything you need to move from learning something new to making something meaningful—with people alongside you.</p>
        </div>
        <div className="ss-features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link to={feature.path} className={`ss-feature-card ss-accent-${feature.accent}`} key={feature.number} data-ss-reveal>
                <div className="ss-feature-top"><span>{feature.number} / {feature.tag}</span><FiArrowUpRight size={19}/></div>
                <div className="ss-feature-icon"><Icon size={27} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="ss-feature-cta">{feature.action} <FiArrowRight size={16} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Journey Section */}
      <section className="ss-section ss-journey-section" aria-labelledby="ss-journey-title">
        <div className="ss-container">
          <div className="ss-section-head ss-section-head-centered" data-ss-reveal>
            <div>
              <div className="ss-section-eyebrow"><span className="ss-small-line" /> THREE SIMPLE STEPS</div>
              <h2 id="ss-journey-title">Your journey starts <span>here.</span></h2>
            </div>
            <p>Less friction. More momentum. A simple way to learn and grow with a community.</p>
          </div>
          <div className="ss-steps">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div className="ss-step" key={step.number} data-ss-reveal>
                  <div className="ss-step-icon"><Icon size={26} /></div>
                  <span className="ss-step-number">STEP {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Build Around Card */}
      <section className="ss-section ss-container" aria-labelledby="ss-experience-title">
        <div className="ss-spotlight" data-ss-reveal>
          <div className="ss-spotlight-copy">
            <div className="ss-section-eyebrow"><span className="ss-small-line" /> BUILT AROUND YOU</div>
            <h2 id="ss-experience-title">Better ideas happen <span>together.</span></h2>
            <p>Save discoveries, stay connected with your community, and come back to the conversations that matter.</p>
            <div className="ss-spotlight-points">
              <div><FiCheck size={16} /> Real-time community conversations</div>
              <div><FiCheck size={16} /> Resources worth keeping</div>
              <div><FiCheck size={16} /> Events that bring people together</div>
            </div>
            <Link to="/feed" className="ss-text-link">Discover the community <FiArrowRight size={18} /></Link>
          </div>
          <div className="ss-spotlight-art" aria-hidden="true">
            <div className="ss-spotlight-ring ring-one" />
            <div className="ss-spotlight-ring ring-two" />
            <div className="ss-spotlight-ring ring-three" />
            <div className="ss-spotlight-center"><FiZap size={35}/><strong>SkillSphere</strong><span>Ideas in motion</span></div>
            <div className="ss-spotlight-node node-a"><FiBookOpen size={23} /></div>
            <div className="ss-spotlight-node node-b"><FiMessageCircle size={23} /></div>
            <div className="ss-spotlight-node node-c"><FiCalendar size={23} /></div>
          </div>
        </div>
      </section>

      {/* AI LEARNING LAB  */}
      <section
        className="ss-container ss-lab-section"
        aria-labelledby="ss-lab-title"
      >
        <div className="ss-lab-studio">
          <div className="ss-lab-top">
            <span className="ss-lab-label">
              SKILLSPHERE EXPERIMENTS / 001
            </span>
            <span className="ss-lab-live">NOW LIVE</span>
          </div>

          <div className="ss-lab-heading-row">
            <h2 id="ss-lab-title" className="ss-lab-heading">
              Learning you can
              <br />
              <em>interact with.</em>
            </h2>
            <p className="ss-lab-intro">
              No keyboard. No clicking. Just hand gestures and a little
              curiosity. Meet our interactive AI-powered learning experiment.
            </p>
          </div>

          <div className="ss-lab-main">
            {/* Illustrative scanner — the webcam starts only in the AI Lab. */}
            <div className="ss-lab-console">
              <div className="ss-lab-console-head">
                <span className="ss-lab-console-title">
                  <FiCamera size={16} />
                  GESTURE DETECTION
                </span>
                <small>LiteRT.js</small>
              </div>

              <div
                className="ss-lab-camera"
                role="img"
                aria-label="Illustration of a hand gesture being recognized by AI"
              >
                <span className="ss-lab-camera-label" aria-hidden="true">
                  INPUT / 02
                </span>
                <div className="ss-lab-gesture" aria-hidden="true">
                  <span className="ss-lab-hand">✌️</span>
                  <span className="ss-lab-detected">
                    DETECTED: OPTION 02
                  </span>
                </div>
                <span className="ss-lab-scan" aria-hidden="true" />
              </div>

              <div className="ss-lab-console-bottom">
                <div className="ss-lab-progress-head">
                  <span>GESTURE HOLD TIMER</span>
                  <strong>2-SECOND AUTO-SUBMIT</strong>
                </div>
                <div className="ss-lab-track" aria-hidden="true">
                  <div className="ss-lab-track-fill" />
                </div>
                <div className="ss-lab-console-meta">
                  <span>4 Answer Gestures + No Hand</span>
                  <span>VISUAL DEMO</span>
                </div>
              </div>
            </div>

            <div className="ss-lab-info">
              <div className="ss-lab-info-top">
                <span className="ss-lab-info-kicker">
                  EXPERIMENT 01 / GESTURE QUIZ
                </span>
                <h3>A new way to answer questions.</h3>
                <div className="ss-lab-step">
                  <span className="ss-lab-step-num">01</span>
                  <div>
                    <strong>Enable your camera</strong>
                    <p>Allow camera access inside the AI Learning Lab.</p>
                  </div>
                </div>
                <div className="ss-lab-step">
                  <span className="ss-lab-step-num">02</span>
                  <div>
                    <strong>Show a hand gesture</strong>
                    <p>Choose an MCQ answer using gestures 1–4.</p>
                  </div>
                </div>
                <div className="ss-lab-step">
                  <span className="ss-lab-step-num">03</span>
                  <div>
                    <strong>Let AI submit</strong>
                    <p>Hold a recognized gesture for two seconds to submit.</p>
                  </div>
                </div>
              </div>
              <Link to="/ai-lab" className="ss-lab-cta">
                <div>
                  <strong>Try the AI Learning Lab</strong>
                  <span>Explore gesture-powered learning</span>
                </div>
                <FiArrowRight size={23} />
              </Link>
            </div>
          </div>
          <p className="ss-lab-preview-note">
            Concept preview only — live camera recognition runs inside the AI Lab.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ss-container ss-final-section" data-ss-reveal>
        <div className="ss-final-card">
          <span className="ss-final-kicker"><FiZap /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Ready to make your<br /><span>next big move?</span></h2>
          <p>Bring your curiosity. Find your people. Build something that matters.</p>
          <Link className="ss-button ss-button-primary ss-final-button" to={isLoggedIn ? "/feed" : "/register"}>
            {isLoggedIn ? "Go to Your Feed" : "Join SkillSphere AI"} <FiArrowUpRight size={19}/>
          </Link>
          <div className="ss-final-deco ss-final-deco-one" aria-hidden="true" />
          <div className="ss-final-deco ss-final-deco-two" aria-hidden="true" />
        </div>
      </section>

      {/* Footer */}
      <footer className="ss-footer">
        <div className="ss-container ss-footer-inner">
          <Link to="/" className="ss-footer-brand"><span><FiZap size={19} /></span> SkillSphere <em>AI</em></Link>
          <p>Learn together. Build what&apos;s next.</p>
          <div className="ss-footer-links">
            <Link to="/feed">Community <FiChevronRight size={13}/></Link>
            <Link to="/resources">Learn <FiChevronRight size={13}/></Link>
            <Link to="/events">Events <FiChevronRight size={13}/></Link>
          </div>
          <span className="ss-footer-signature">MADE FOR CURIOUS MINDS <FiSend size={13}/></span>
        </div>
      </footer>
    </main>
  );
};

export default Home;
