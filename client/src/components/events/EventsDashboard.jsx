
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
  FiPlus,
  FiCompass,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";

import useMyEvents from "../../hooks/useMyEvents";
import EventCard from "./EventCard";

// PERIOD FILTER OPTIONS
const PERIOD_OPTIONS = [
  {
    value: "upcoming",
    label: "Upcoming",
  },
  {
    value: "past",
    label: "Past",
  },
  {
    value: "all",
    label: "All",
  },
];

// =====================================
// MAIN DASHBOARD
// =====================================

const EventsDashboard = ({
  onView,
  onEdit,
  onDelete,
  onCreate,
  refreshKey = 0,
}) => {
  const [activeTab, setActiveTab] =
    useState("created");

  const [period, setPeriod] =
    useState("upcoming");

  return (
    <section className="space-y-6">

      {/* CREATED / JOINED TABS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("created")}
          aria-pressed={activeTab === "created"}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "created"
              ? "bg-indigo-600 text-white"
              : "bg-[#111827] border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          <FiCalendar size={17} />
          Created Events
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("joined")}
          aria-pressed={activeTab === "joined"}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "joined"
              ? "bg-indigo-600 text-white"
              : "bg-[#111827] border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          <FiUsers size={17} />
          Joined Events
        </button>
      </div>

      {/* UPCOMING / PAST / ALL FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiClock className="text-indigo-400" />
          Filter My Events
        </div>

        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-[#111827] p-1.5 w-full sm:w-auto">

          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={
                period === option.value
              }
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                period === option.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}

        </div>
      </div>

      {/* ACTIVE TAB DATA */}
      <MyEventsTab
        key={`${activeTab}-${period}-${refreshKey}`}
        type={activeTab}
        period={period}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreate={onCreate}
      />

    </section>
  );
};

// =====================================
// REUSABLE TAB CONTENT
// =====================================

const MyEventsTab = ({
  type,
  period,
  onView,
  onEdit,
  onDelete,
  onCreate,
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
  } = useMyEvents(type, period);

  const [leavingId, setLeavingId] =
    useState(null);

  const variant =
    type === "created" ? "created" : "joined";

  const isCreated = type === "created";

  // =====================================
  // JOINED EVENT LEAVE
  // =====================================

  const handleLeave = async (event) => {
    if (leavingId) return;

    setLeavingId(event._id);

    try {
      await api.put(
        `/events/${event._id}/leave`
      );

      toast.success(
        "Successfully left the event!"
      );

      // Prevent an empty final page
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

  // =====================================
  // EMPTY STATE TEXT
  // =====================================

  const getEmptyMessage = () => {
    if (isCreated) {
      if (period === "upcoming") {
        return "You have no upcoming created events.";
      }

      if (period === "past") {
        return "You have no past created events.";
      }

      return "You haven't created any events yet.";
    }

    if (period === "upcoming") {
      return "You haven't joined any upcoming events.";
    }

    if (period === "past") {
      return "You have no past joined events.";
    }

    return "You haven't joined any events yet.";
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-5">

      {/* EVENT COUNT */}
      {!loading && !error && (
        <p className="text-sm text-gray-400">
          {totalEvents}{" "}
          {period === "all" ? "" : `${period} `}
          {isCreated ? "created" : "joined"}{" "}
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

        /* EMPTY STATE */
        <div className="rounded-2xl border border-white/10 bg-[#111827] px-6 py-16 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            {isCreated ? (
              <FiCalendar
                size={30}
                className="text-indigo-400"
              />
            ) : (
              <FiUsers
                size={30}
                className="text-indigo-400"
              />
            )}
          </div>

          <h3 className="text-xl font-bold text-white">
            No Events Found
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
            {getEmptyMessage()}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            {period !== "all"
              ? "Try the All filter to view your other events."
              : isCreated
                ? "Start by organizing your first learning event."
                : "Explore community events and join one."}
          </p>

          {/* CREATED EMPTY ACTION */}
          {isCreated && (
            <button
              type="button"
              onClick={onCreate}
              disabled={!onCreate}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              <FiPlus size={18} />
              Create Event
            </button>
          )}

          {/* JOINED EMPTY ACTION */}
          {!isCreated && (
            <Link
              to="/events?view=all"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <FiCompass size={18} />
              Explore Events
            </Link>
          )}
        </div>

      ) : (

        /* REUSABLE EVENT CARDS */
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
              actionLoading={
                leavingId === event._id
              }
            />
          ))}

        </div>
      )}

      {/* PAGINATION */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-5">

          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              changePage(page - 1)
            }
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
            onClick={() =>
              changePage(page + 1)
            }
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
