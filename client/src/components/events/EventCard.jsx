import {
  FiCalendar,
  FiMapPin,
  FiVideo,
  FiUsers,
  FiArrowRight,
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiLoader,
} from "react-icons/fi";

import { formatEventDate, isUpcomingEvent } from "../../utils/eventHelpers";

const EventCard = ({
  event,
  variant = "explore",
  onView,
  onEdit,
  onDelete,
  onLeave,
  actionLoading = false,
}) => {
  const upcoming = isUpcomingEvent(event.eventDate);
  const online = event.mode === "Online";

  const isCreated = variant === "created";
  const isJoined = variant === "joined";

  const canEdit = isCreated && typeof onEdit === "function";

  const canDelete = isCreated && typeof onDelete === "function";

  const canLeave = isJoined && typeof onLeave === "function";

  const handleView = () => {
    onView?.(event._id);
  };

  const handleEdit = () => {
    onEdit?.(event);
  };

  const handleDelete = () => {
    onDelete?.(event);
  };

  const handleLeave = () => {
    onLeave?.(event);
  };

  const primaryButton =
    "flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all";

  const secondaryButton =
    "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all";

  return (
    <article className="flex flex-col h-full min-h-97.5 rounded-2xl overflow-hidden border border-white/10 bg-[#121A2B] hover:border-indigo-500/40 hover:shadow-[0_15px_40px_rgba(79,70,229,0.12)] transition-all duration-300">
      {/* TOP ACCENT */}
      <div
        className={`h-1.5 shrink-0 ${
          online
            ? "bg-linear-to-r from-indigo-500 to-purple-600"
            : "bg-linear-to-r from-emerald-500 to-teal-500"
        }`}
      />

      <div className="flex flex-col flex-1 p-5 gap-4">
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
        <div className="min-h-25 pb-2">
          <h3 className="text-xl font-bold text-white line-clamp-2">
            {event.title}
          </h3>

          <p className="text-sm text-gray-400 mt-2 line-clamp-3 leading-6">
            {event.description}
          </p>
        </div>

        {/* EVENT INFORMATION */}
        <div className="space-y-2.5">
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

          {/* EXPLORE VARIANT */}
          {!isCreated && !isJoined && (
            <button
              type="button"
              onClick={handleView}
              className={`w-full ${primaryButton}`}
            >
              View Details
              <FiArrowRight size={17} />
            </button>
          )}

          {/* CREATED VARIANT */}
          {isCreated && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleView}
                className={`w-full ${primaryButton}`}
              >
                View Details
                <FiArrowRight size={17} />
              </button>

              {(canEdit || canDelete) && (
                <div className="grid grid-cols-2 gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className={`${secondaryButton} text-indigo-300`}
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className={`${secondaryButton} text-red-400 hover:bg-red-500/10`}
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* JOINED VARIANT */}
          {isJoined && (
            <div className="grid grid-cols-2 gap-3">
              {/* DETAILS BUTTON */}
              <button
                type="button"
                onClick={handleView}
                className=" w-full min-h-11 flex items-center justify-center gap-2  rounded-xl bg-linear-to-r from-indigo-500 to-purple-600  text-sm font-semibold text-white hover:opacity-80 transition-all"
              >
                Details
                <FiArrowRight size={16} />
              </button>

              {/* LEAVE BUTTON */}
              {canLeave && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className=" w-full min-h-11 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-400/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <FiLoader size={16} className="animate-spin" />
                  ) : (
                    <FiLogOut size={16} />
                  )}
                  Leave
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
