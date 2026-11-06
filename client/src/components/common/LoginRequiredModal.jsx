
import {
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

// ========================================
// REUSABLE LOGIN REQUIRED MODAL
// ========================================

const LoginRequiredModal = ({
  isOpen,
  onClose,
  actionName = "perform this action",
}) => {
  const location = useLocation();

  const closeButtonRef = useRef(null);

  // Save the page where login
  // was requested.
  const returnPath =
    location.pathname + location.search;

  // ======================================
  // KEYBOARD AND FOCUS HANDLING
  // ======================================

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  // ======================================
  // MODAL VISIBILITY
  // ======================================

  if (!isOpen) {
    return null;
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        aria-describedby="login-required-description"
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1120] p-6 sm:p-8 shadow-[0_25px_100px_rgba(0,0,0,0.65)]"
      >
        {/* CLOSE BUTTON */}

        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close login required dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/10 hover:text-white"
        >
          <FiX size={20} />
        </button>

        {/* ICON */}

        <div className="mb-5 flex justify-center">
          <div className="flex h-17 w-17 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <FiLock size={30} />
          </div>
        </div>

        {/* TITLE */}

        <h2
          id="login-required-title"
          className="text-center text-2xl font-bold text-white"
        >
          Login Required
        </h2>

        {/* DESCRIPTION */}

        <p
          id="login-required-description"
          className="mt-3 text-center text-sm leading-7 text-gray-400"
        >
          You need to login to{" "}
          <span className="font-semibold text-indigo-300">
            {actionName}
          </span>
          {" "}on SkillSphere.
        </p>

        <p className="mt-5 text-center text-xs leading-6 text-gray-500">
          Join our community to share,
          learn, and collaborate.
        </p>

        {/* ACTION BUTTONS */}

        <div className="mt-7 space-y-3">

          {/* LOGIN */}

          <Link
            to="/login"
            state={{ from: returnPath }}
            onClick={() => onClose?.()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-purple-700"
          >
            <FiLogIn size={19} />

            Login to Continue
          </Link>

          {/* REGISTER */}

          <Link
            to="/register"
            state={{ from: returnPath }}
            onClick={() => onClose?.()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-gray-200 transition-all hover:border-indigo-500/30 hover:bg-white/10"
          >
            <FiUserPlus size={19} />

            Create Account
          </Link>

          {/* CANCEL */}

          <button
            type="button"
            onClick={() => onClose?.()}
            className="w-full rounded-xl px-5 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
