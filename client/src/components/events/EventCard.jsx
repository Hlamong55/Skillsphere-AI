import {
  FiCalendar,
  FiMapPin,
  FiVideo,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";

import { formatEventDate, isUpcomingEvent } from "../../utils/eventHelpers";

const EventCard = ({ event, onView }) => {
  const upcoming = isUpcomingEvent(event.eventDate);
  const online = event.mode === "Online";

  return (
    <article
      className="
        flex flex-col h-full min-h-97.5
        rounded-2xl overflow-hidden
        border border-white/10 bg-[#121A2B]
        hover:border-indigo-500/40
        hover:shadow-[0_15px_40px_rgba(79,70,229,0.12)]
        transition-all duration-300
      "
    >
      {/* ACCENT */}
      <div
        className={`h-1.5 shrink-0 ${
          online
            ? "bg-linear-to-r from-indigo-500 to-purple-600"
            : "bg-linear-to-r from-emerald-500 to-teal-500"
        }`}
      />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* CATEGORY AND STATUS */}
        <div className="flex items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
            {event.category}
          </span>

          <span
            className={`text-xs font-semibold ${
              upcoming ? "text-emerald-400" : "text-gray-500"
            }`}
          >
            {upcoming ? "Upcoming" : "Past Event"}
          </span>
        </div>

        {/* TITLE AND DESCRIPTION */}
        <div className="min-h-25">
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {event.title}
          </h3>

          <p className="text-sm text-gray-400 mt-2 line-clamp-3 leading-6">
            {event.description}
          </p>
        </div>

        {/* EVENT INFORMATION */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-gray-300">
            <FiCalendar size={17} className="text-indigo-400 shrink-0 mt-0.5" />

            <span>{formatEventDate(event.eventDate)}</span>
          </div>

          <div className="flex items-start gap-3 text-sm text-gray-300">
            {online ? (
              <FiVideo size={17} className="text-purple-400 shrink-0 mt-0.5" />
            ) : (
              <FiMapPin
                size={17}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
            )}

            <span className="line-clamp-2">
              {online ? "Online Event" : event.location}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <FiUsers size={17} className="text-indigo-400 shrink-0" />

            <span>Capacity: {event.maxParticipants} participants</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-4 border-t border-white/10 space-y-4">
          <p className="text-xs text-gray-500">
            Organized by{" "}
            <span className="text-gray-200 font-semibold">
              {event.organizer?.name || "Unknown User"}
            </span>
          </p>

          <button
            type="button"
            onClick={() => onView(event._id)}
            className="
              w-full flex items-center justify-center gap-2
              bg-linear-to-r from-indigo-500 to-purple-600
              hover:opacity-90 transition-all
              text-white font-semibold
              rounded-xl py-3
            "
          >
            View Details
            <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
