
import { useState } from "react";

import {
  FiCalendar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";

import useMyEvents from "../../hooks/useMyEvents";
import EventCard from "./EventCard";

const EventsDashboard = ({
  onView,
  onEdit,
  onDelete,
  refreshKey = 0,
}) => {
  const [activeTab, setActiveTab] = useState("created");

  return (
    <section className="space-y-6">

      {/* DASHBOARD TABS */}
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

      {/* ACTIVE TAB */}
      <MyEventsTab
        key={`${activeTab}-${refreshKey}`}
        type={activeTab}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />

    </section>
  );
};

// REUSABLE TAB CONTENT
const MyEventsTab = ({
  type,
  onView,
  onEdit,
  onDelete,
}) => {
  const {
    events,
    page,
    totalPages,
    totalEvents,
    loading,
    error,
    changePage,
    refresh,
  } = useMyEvents(type);

  const [leavingId, setLeavingId] = useState(null);

  const handleLeave = async (event) => {
    if (leavingId) return;

    setLeavingId(event._id);

    try {
      await api.put(`/events/${event._id}/leave`);

      toast.success("Successfully left the event!");

      // If the last card on a later page was removed,
      // return to the previous page.
      if (events.length === 1 && page > 1) {
        changePage(page - 1);
      } else {
        refresh();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Could not leave this event."
      );
    } finally {
      setLeavingId(null);
    }
  };

  const variant =
    type === "created" ? "created" : "joined";

  const emptyMessage =
    type === "created"
      ? "You haven't created any events yet."
      : "You haven't joined any events yet.";

  return (
    <div className="space-y-5">

      {/* TOTAL COUNT */}
      {!loading && !error && (
        <p className="text-sm text-gray-400">
          {totalEvents}{" "}
          {type === "created" ? "created" : "joined"}{" "}
          event{totalEvents !== 1 ? "s" : ""}
        </p>
      )}

      {/* LOADING */}
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
              variant={variant}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onLeave={
                type === "joined"
                  ? handleLeave
                  : undefined
              }
              actionLoading={leavingId === event._id}
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
