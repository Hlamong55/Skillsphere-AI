
import { useState } from "react";

import {
  FiCalendar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import useMyEvents from "../../hooks/useMyEvents";
import EventCard from "./EventCard";

const EventsDashboard = ({
  onView,
  refreshKey = 0,
}) => {
  const [activeTab, setActiveTab] = useState("created");

  // Mount only the selected tab's data.
  // This avoids fetching the inactive tab unnecessarily.
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          My Events
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Manage the events you organize and attend.
        </p>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("created")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "created"
              ? "bg-indigo-600 text-white"
              : "bg-[#111827] text-gray-400 border border-white/10 hover:text-white"
          }`}
        >
          <FiCalendar />
          Created Events
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("joined")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "joined"
              ? "bg-indigo-600 text-white"
              : "bg-[#111827] text-gray-400 border border-white/10 hover:text-white"
          }`}
        >
          <FiUsers />
          Joined Events
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <MyEventsTab
        key={`${activeTab}-${refreshKey}`}
        type={activeTab}
        onView={onView}
      />
    </section>
  );
};

// Reusable tab content
const MyEventsTab = ({ type, onView }) => {
  const {
    events,
    page,
    totalPages,
    totalEvents,
    loading,
    error,
    changePage,
  } = useMyEvents(type);

  const emptyMessage =
    type === "created"
      ? "You haven't created any events yet."
      : "You haven't joined any events yet.";

  return (
    <div className="space-y-5">
      {!loading && !error && (
        <p className="text-sm text-gray-400">
          {totalEvents}{" "}
          {type === "created" ? "created" : "joined"}{" "}
          event{totalEvents !== 1 ? "s" : ""}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-indigo-300">
          <FiLoader className="animate-spin" />
          Loading your events...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 py-20 text-red-400"
        >
          <FiAlertCircle />
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111827] px-6 py-16 text-center">
          <FiCalendar
            size={40}
            className="mx-auto mb-4 text-indigo-400"
          />

          <h3 className="text-lg font-semibold text-white">
            No Events Yet
          </h3>

          <p className="text-sm text-gray-400 mt-2">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onView={onView}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 disabled:opacity-30"
          >
            <FiChevronLeft />
            Previous
          </button>

          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => changePage(page + 1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 disabled:opacity-30"
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsDashboard;
