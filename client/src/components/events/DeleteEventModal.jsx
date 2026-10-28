
import { useEffect, useState } from "react";
import {
  FiX,
  FiTrash2,
  FiUsers,
  FiAlertTriangle,
  FiLoader,
  FiCalendar,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";

import {
  getCurrentUserId,
  isEventOrganizer,
  formatEventDate,
} from "../../utils/eventHelpers";

// ========================================
// DELETE EVENT CONFIRMATION MODAL
// Organizer only
// ========================================

const DeleteEventModal = ({
  eventId,
  onClose,
  onDeleted,
}) => {
  const [event, setEvent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // ========================================
  // LOAD EVENT DETAILS
  // ========================================

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const controller = new AbortController();
    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          `/events/${eventId}`,
          {
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        const eventData = data.event || data;

        // Frontend permission check
        // Backend verifies organizer again
        // before actually deleting.
        const currentUserId = getCurrentUserId();

        if (
          !isEventOrganizer(
            eventData,
            currentUserId
          )
        ) {
          setError(
            "Only the organizer can delete this event."
          );
          return;
        }

        setEvent(eventData);

      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err.response?.data?.message ||
          "Failed to load event information."
        );

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEvent();

    return () => {
      controller.abort();
    };
  }, [eventId]);

  // ========================================
  // DERIVED EVENT INFORMATION
  // ========================================

  const participantCount =
    event?.participants?.length ?? 0;

  const hasParticipants =
    participantCount > 0;

  const isConfirmed =
    confirmation.trim() === "DELETE";

  const canDelete =
    Boolean(event) &&
    isConfirmed &&
    !loading &&
    !deleting;


  // DELETE EVENT

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    setError("");

    try {
      const { data } = await api.delete(
        `/events/${eventId}`
      );
      toast.success(
        "Event deleted successfully!"
      );

      // Notify parent to refresh the dashboard
      if (onDeleted) {
        onDeleted(data);
      } else {
        onClose?.();
      }

    } catch (err) {
      console.error(
        "Delete Event Error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Failed to delete event.";

      setError(message);
      toast.error(message);

    } finally {
      setDeleting(false);
    }
  };

 
  // CLOSE MODAL
  const handleClose = () => {
    if (deleting) return;

    onClose?.();
  };


  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-title"
        aria-describedby="delete-event-description"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] shadow-2xl"
      >

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <FiTrash2
                size={22}
                className="text-red-400"
              />
            </div>

            <div>
              <h2
                id="delete-event-title"
                className="text-xl font-bold text-white"
              >
                Delete Event?
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            aria-label="Close Delete Event"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* LOADING */}
        {loading ? (

          <div className="flex items-center justify-center gap-3 py-20 text-indigo-300">
            <FiLoader className="animate-spin" />
            Loading event details...
          </div>

        ) : !event ? (

          /* LOAD / PERMISSION ERROR */
          <div className="px-6 py-8 space-y-5">

            <p
              role="alert"
              className="flex items-center gap-2 text-sm text-red-400"
            >
              <FiAlertTriangle />
              {error || "Event not found."}
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-gray-200 hover:bg-white/10"
            >
              Close
            </button>

          </div>

        ) : (

          <div
            id="delete-event-description"
            className="p-6 space-y-6"
          >

            {/* EVENT SUMMARY */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1120] p-5 space-y-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Event to Delete
                </p>

                <h3 className="mt-2 text-lg font-bold text-white wrap-break-words">
                  {event.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400">
                <FiCalendar
                  size={17}
                  className="shrink-0 text-indigo-400"
                />

                <span>
                  {formatEventDate(
                    event.eventDate
                  )}
                </span>
              </div>

              {/* PARTICIPANT COUNT */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">

                <FiUsers
                  size={20}
                  className={
                    hasParticipants
                      ? "shrink-0 text-amber-400"
                      : "shrink-0 text-indigo-400"
                  }
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {participantCount} Registered{" "}
                    {participantCount === 1
                      ? "Participant"
                      : "Participants"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {hasParticipants
                      ? "These registrations will be removed."
                      : "No participants have joined yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* DELETE WARNING */}
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
            >
              <FiAlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-300">
                  Permanent Deletion
                </p>

                <p className="text-sm leading-6 text-gray-300">
                  This event will be permanently
                  removed from SkillSphere AI.
                  Its participant registrations
                  will also be removed.
                </p>

                {hasParticipants && (
                  <p className="text-sm font-medium text-amber-300">
                    Warning: {participantCount}{" "}
                    {participantCount === 1
                      ? "person has"
                      : "people have"}{" "}
                    already joined this event.
                  </p>
                )}
              </div>
            </div>

            {/* CONFIRMATION INPUT */}
            <div>
              <label
                htmlFor="confirm-delete-event"
                className="mb-2 block text-sm text-gray-300"
              >
                Type{" "}
                <span className="font-bold text-red-400">
                  DELETE
                </span>{" "}
                to confirm
              </label>

              <input
                id="confirm-delete-event"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={confirmation}
                onChange={(e) =>
                  setConfirmation(
                    e.target.value
                  )
                }
                disabled={deleting}
                placeholder="Type DELETE"
                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-red-500 disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter DELETE in capital letters
                to enable the confirmation button.
              </p>
            </div>

            {/* API ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">

              <button
                type="button"
                onClick={handleClose}
                disabled={deleting}
                className="min-h-12 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={17} />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteEventModal;
