
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  FiCalendar,
  FiChevronDown,
  FiGlobe,
  FiUsers,
} from "react-icons/fi";

const EventsNavDropdown = ({
  isLoggedIn = false,
  mobile = false,
  onNavigate,
}) => {
  const location = useLocation();
  const wrapperRef = useRef(null);

  const [openedAt, setOpenedAt] = useState(null);

  const routeKey = [
    location.key,
    location.pathname,
    location.search,
  ].join(":");

  const isOpen = openedAt === routeKey;

  const isEventsPage =
    location.pathname === "/events";

  const currentView = new URLSearchParams(
    location.search
  ).get("view");

  const allActive =
    isEventsPage && currentView !== "mine";

  const mineActive =
    isEventsPage && currentView === "mine";

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (mobile) return;

    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpenedAt(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenedAt(null);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobile]);

  const closeMenu = () => {
    setOpenedAt(null);
    onNavigate?.();
  };

  const linkClass = (active) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      active
        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
        : "text-gray-300 hover:text-white hover:bg-white/10"
    }`;

  // MOBILE NAVIGATION
  if (mobile) {
    return (
      <div className="space-y-1 border-t border-white/10 pt-3 mt-3">

        <div className="flex items-center gap-3 px-4 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
          <FiCalendar size={17} />
          Events
        </div>

        <NavLink
          to="/events?view=all"
          onClick={closeMenu}
          className={linkClass(allActive)}
        >
          <FiGlobe size={19} />
          Explore Events
        </NavLink>

        {isLoggedIn && (
          <NavLink
            to="/events?view=mine"
            onClick={closeMenu}
            className={linkClass(mineActive)}
          >
            <FiUsers size={19} />
            My Events
          </NavLink>
        )}
      </div>
    );
  }

  // DESKTOP DROPDOWN
  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpenedAt((previous) =>
            previous === routeKey ? null : routeKey
          )
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Events menu"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          isEventsPage || isOpen
            ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        <FiCalendar size={17} />

        <span>Events</span>

        <FiChevronDown
          size={15}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-3 w-60 rounded-2xl border border-white/20 bg-[#111827] p-2 shadow-2xl">

          <NavLink
            to="/events?view=all"
            onClick={closeMenu}
            className={linkClass(allActive)}
          >
            <FiGlobe size={18} />
            Explore Events
          </NavLink>

          {isLoggedIn && (
            <NavLink
              to="/events?view=mine"
              onClick={closeMenu}
              className={linkClass(mineActive)}
            >
              <FiUsers size={18} />
              My Events
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsNavDropdown;
