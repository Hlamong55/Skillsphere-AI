
import {
  FiCalendar,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import EventCard from "./EventCard";

const EventList = ({
  events = [],
  loading = false,
  error = "",
  onView,
}) => {
  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-indigo-300">
        <FiLoader className="animate-spin" size={24} />
        <span>Loading events...</span>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center justify-center gap-3 py-20 text-red-400"
      >
        <FiAlertCircle size={22} />
        <span>{error}</span>
      </div>
    );
  }

  // EMPTY STATE
  if (events.length === 0) {
    return (
      <div className="text-center rounded-3xl border border-white/10 bg-[#111827] py-20 px-5">
        <FiCalendar
          size={44}
          className="mx-auto text-indigo-400 mb-5"
        />

        <h2 className="text-xl font-bold text-white">
          No Events Found
        </h2>

        <p className="text-gray-400 mt-2">
          Try another filter or create a new event.
        </p>
      </div>
    );
  }

  // EVENT GRID
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default EventList;
