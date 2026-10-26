import { useEffect, useState } from "react";

import {
  FiX,
  FiCalendar,
  FiUsers,
  FiVideo,
  FiMapPin,
  FiBookOpen,
  FiUser,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiLogIn,
  FiExternalLink,
  FiLock
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";
import EventMap from "./EventMap";

import {
  formatEventDate,
  isUpcomingEvent,
  getCurrentUserId,
  isEventOrganizer,
  isEventParticipant,
  getEventSeats,
} from "../../utils/eventHelpers";

const EventDetailsModal = ({ eventId, onClose, onUpdated }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const currentUserId = getCurrentUserId();

  // LOAD EVENT DETAILS
  useEffect(() => {
    if (!eventId) return;

    const controller = new AbortController();

    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/events/${eventId}`, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setEvent(data.event || data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message || "Could not load event details.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEvent();

    return () => controller.abort();
  }, [eventId]);

  // DERIVED EVENT INFORMATION
  const organizer = isEventOrganizer(event, currentUserId);

  const joined = isEventParticipant(event, currentUserId);

  const seats = getEventSeats(event);

  const upcoming = event ? isUpcomingEvent(event.eventDate) : false;

  // JOIN / LEAVE
  const handleParticipation = async () => {
    if (!currentUserId) {
      toast.error("Please login to join an event.");
      return;
    }

    if (!event || working || organizer) return;

    const action = joined ? "leave" : "join";

    setWorking(true);

    try {
      await api.put(`/events/${eventId}/${action}`);

      // Fetch updated participant list from backend
      const { data } = await api.get(`/events/${eventId}`);

      setEvent(data.event || data);

      toast.success(
        action === "join"
          ? "Successfully joined the event!"
          : "Successfully left the event!",
      );

      onUpdated?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update event participation.",
      );

      // Try to sync latest state after a failed request
      try {
        const { data } = await api.get(`/events/${eventId}`);

        setEvent(data.event || data);
      } catch {
        // Keep the currently displayed event.
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Event Details"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-white/10 shadow-2xl"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#111827] border-b border-white/10 px-6 py-5 flex justify-between items-center gap-3">
          <h2 className="text-xl font-bold text-white">Event Details</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="p-2 text-gray-400 hover:text-white"
          >
            <FiX size={23} />
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center gap-3 py-24 text-indigo-300">
            <FiLoader className="animate-spin" />
            Loading Event...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-center justify-center gap-2 px-6 py-20 text-red-400 text-center"
          >
            <FiAlertCircle size={20} />
            {error}
          </div>
        ) : !event ? (
          <p className="py-20 text-center text-gray-400">Event not found.</p>
        ) : (
          <div className="p-6 space-y-6">
            {/* TITLE AND STATUS */}
            <section>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  {event.category}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    upcoming
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {upcoming ? "Upcoming" : "Past Event"}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {event.title}
              </h3>

              <p className="text-gray-400 mt-3 leading-7 whitespace-pre-wrap">
                {event.description}
              </p>
            </section>

            {/* EVENT INFORMATION */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
                  <FiCalendar />
                  Date & Time
                </div>

                <p className="text-sm text-white">
                  {formatEventDate(event.eventDate)}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
                  <FiUsers />
                  Participants
                </div>

                <p className="text-sm text-white font-semibold">
                  {seats.joined} / {seats.total} Joined
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {seats.available} seats available
                </p>
              </div>
            </section>

            {/* LOCATION INFORMATION - OFFLINE ONLY */}
            {event.mode === "Offline" && (
              <section className="flex items-start gap-3">
                <FiMapPin
                  size={20}
                  className="text-emerald-400 shrink-0 mt-1"
                />

                <div>
                  <h4 className="font-semibold text-white">Offline Event</h4>

                  <p className=" text-gray-400 mt-1.5">{event.location}</p>
                </div>
              </section>
            )}

            {/* SECURE ONLINE MEETING LINK */}
            {event.mode === "Online" && (
              <section className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="shrink-0 rounded-xl bg-purple-500/10 p-3">
                  <FiVideo size={22} className="text-purple-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-white">
                    Online Meeting
                  </h4>

                  {event.meetingLink && (organizer || joined) ? (
                    <p className="text-sm text-emerald-400 mt-1">
                      Meeting link unlocked
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">
                      {organizer || joined
                        ? "Meeting link is currently unavailable."
                        : "Join this event to unlock the meeting link."}
                    </p>
                  )}
                </div>

                {event.meetingLink && (organizer || joined) ? (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    <FiExternalLink />
                    <span>Join</span>
                  </a>
                ) : (
                  <FiLock size={18} className="shrink-0 text-gray-500" />
                )}
              </section>
            )}

            {/* GOOGLE MAPS FOR OFFLINE EVENT */}
            {event.mode === "Offline" && <EventMap location={event.location} />}

            {/* AGENDA */}
            {event.agenda?.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <FiBookOpen className="text-indigo-400" />
                  Learning Agenda
                </h4>

                <div className="space-y-3">
                  {event.agenda.map((topic, index) => (
                    <div
                      key={`${index}-${topic}`}
                      className="flex gap-3 text-sm text-gray-300"
                    >
                      <span className="text-indigo-400 font-bold">
                        {index + 1}.
                      </span>

                      <p className="wrap-break-word">{topic}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ORGANIZER */}
            <section className="border-t border-white/10 pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/15 flex items-center justify-center">
                  <FiUser className="text-indigo-300" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Organized by</p>

                  <p className="text-sm text-white font-semibold">
                    {event.organizer?.name || "Unknown Organizer"}
                  </p>
                </div>
              </div>
            </section>

            {/* PARTICIPATION ACTION */}
            <section className="border-t border-white/10 pt-5">
              {organizer ? (
                <div className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-indigo-200 text-sm">
                  <FiCheckCircle className="shrink-0" />
                  You are the organizer of this event.
                </div>
              ) : !currentUserId ? (
                <div className="rounded-xl bg-white/5 p-4 space-y-3">
                  <p className="text-gray-300 text-sm">
                    Login to join this event.
                  </p>

                  <a
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
                  >
                    <FiLogIn />
                    Login
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleParticipation}
                  disabled={working || (!joined && (!upcoming || seats.isFull))}
                  className={`w-full flex justify-center items-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    joined
                      ? "bg-red-500/80 hover:bg-red-500"
                      : "bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90"
                  }`}
                >
                  {working ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Updating...
                    </>
                  ) : joined ? (
                    "Leave Event"
                  ) : !upcoming ? (
                    "Event Ended"
                  ) : seats.isFull ? (
                    "Event Full"
                  ) : (
                    "Join Event"
                  )}
                </button>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;
