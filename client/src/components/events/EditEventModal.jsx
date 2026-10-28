
import { useEffect, useState } from "react";

import {
  FiX,
  FiEdit2,
  FiCalendar,
  FiUsers,
  FiVideo,
  FiMapPin,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";
import EventAgenda from "./EventAgenda";

import {
  EVENT_CATEGORIES,
  EVENT_MODES,
  EVENT_INPUT_CLASS,
  getCurrentUserId,
  isEventOrganizer,
} from "../../utils/eventHelpers";

// Convert API date to local datetime input format
const toLocalDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) =>
    String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
};

// Validate HTTP/HTTPS meeting URL
const isValidMeetingUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      ["https:", "http:"].includes(url.protocol) &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

// Remove empty agenda topics
const cleanAgenda = (agenda) =>
  agenda.map((topic) => topic.trim()).filter(Boolean);

const EditEventModal = ({
  eventId,
  onClose,
  onUpdated,
}) => {
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD EVENT DATA
  useEffect(() => {
    if (!eventId) return;

    const controller = new AbortController();

    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          `/events/${eventId}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        const event = data.event || data;

        // Frontend permission check
        // Backend also verifies organizer on PUT.
        const currentUserId = getCurrentUserId();

        if (
          !isEventOrganizer(event, currentUserId)
        ) {
          setError(
            "Only the organizer can edit this event."
          );
          return;
        }

        const initialForm = {
          title: event.title || "",
          description: event.description || "",
          category: event.category || "Workshop",
          eventDate: toLocalDateTime(
            event.eventDate
          ),
          mode: event.mode || "Online",
          location: event.location || "",
          meetingLink: event.meetingLink || "",
          maxParticipants:
            event.maxParticipants ?? 20,
          agenda: Array.isArray(event.agenda)
            ? [...event.agenda]
            : [],
        };

        setForm(initialForm);
        setOriginal(initialForm);

        setParticipantCount(
          event.participants?.length || 0
        );
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

    return () => controller.abort();
  }, [eventId]);

  // CHANGE FORM FIELD
  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SWITCH ONLINE / OFFLINE
  const handleModeChange = (newMode) => {
    setForm((previous) => ({
      ...previous,
      mode: newMode,

      location:
        newMode === "Online"
          ? "Online"
          : previous.location === "Online"
            ? ""
            : previous.location,

      meetingLink:
        newMode === "Online"
          ? previous.meetingLink
          : "",
    }));
  };

  // SAVE CHANGES
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form || !original || saving) return;

    const title = form.title.trim();
    const description = form.description.trim();
    const location = form.location.trim();
    const meetingLink = form.meetingLink.trim();

    const capacity = Number(
      form.maxParticipants
    );

    const selectedDate = new Date(form.eventDate);

    // BASIC VALIDATION
    if (!title || title.length > 150) {
      toast.error("Enter a valid event title.");
      return;
    }

    if (
      !description ||
      description.length > 2000
    ) {
      toast.error("Enter a valid description.");
      return;
    }

    if (
      !form.eventDate ||
      Number.isNaN(selectedDate.getTime())
    ) {
      toast.error("Enter a valid event date.");
      return;
    }

    // Backend requires future date only
    // if the date is actually being changed.
    const dateChanged =
      form.eventDate !== original.eventDate;

    if (
      dateChanged &&
      selectedDate.getTime() <= Date.now()
    ) {
      toast.error(
        "New event date must be in the future."
      );
      return;
    }

    if (
      !Number.isSafeInteger(capacity) ||
      capacity < 1 ||
      capacity > 10000
    ) {
      toast.error(
        "Capacity must be between 1 and 10000."
      );
      return;
    }

    if (capacity < participantCount) {
      toast.error(
        `At least ${participantCount} participants are already registered.`
      );
      return;
    }

    // LOCATION VALIDATION
    if (
      form.mode === "Offline" &&
      (!location ||
        location === "Online" ||
        location.length > 250)
    ) {
      toast.error(
        "Please enter a valid offline venue."
      );
      return;
    }

    // MEETING LINK VALIDATION
    if (
      form.mode === "Online" &&
      !isValidMeetingUrl(meetingLink)
    ) {
      toast.error(
        "Please enter a valid HTTP/HTTPS meeting URL."
      );
      return;
    }

    const agenda = cleanAgenda(
      form.agenda
    );

    if (
      form.agenda.length > 20 ||
      agenda.some(
        (topic) => topic.length > 200
      )
    ) {
      toast.error(
        "Agenda supports up to 20 topics, each 200 characters."
      );
      return;
    }

    // CREATE PARTIAL UPDATE PAYLOAD
    // Send only changed fields.
    const payload = {};

    if (title !== original.title) {
      payload.title = title;
    }

    if (description !== original.description) {
      payload.description = description;
    }

    if (form.category !== original.category) {
      payload.category = form.category;
    }

    if (dateChanged) {
      payload.eventDate =
        selectedDate.toISOString();
    }

    if (form.mode !== original.mode) {
      payload.mode = form.mode;
    }

    if (
      capacity !== Number(
        original.maxParticipants
      )
    ) {
      payload.maxParticipants = capacity;
    }

    if (
      form.mode === "Offline" &&
      location !== original.location
    ) {
      payload.location = location;
    }

    if (
      form.mode === "Online" &&
      meetingLink !== original.meetingLink
    ) {
      payload.meetingLink = meetingLink;
    }

    const originalAgenda = cleanAgenda(
      original.agenda
    );

    if (
      JSON.stringify(agenda) !==
      JSON.stringify(originalAgenda)
    ) {
      payload.agenda = agenda;
    }

    if (Object.keys(payload).length === 0) {
      toast("No changes to save.");
      return;
    }

    // UPDATE API
    try {
      setSaving(true);

      const { data } = await api.put(
        `/events/${eventId}`,
        payload
      );

      toast.success(
        "Event updated successfully!"
      );

      // Notify parent page to refresh lists
      onUpdated?.(data.event || data);
    } catch (err) {
      console.error(
        "Update event error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
        "Failed to update event."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Event"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-white/10 shadow-2xl"
      >

        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-[#111827] border-b border-white/10 px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Edit Event
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Update your event information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close Edit Event"
            className="p-2 text-gray-400 hover:text-white disabled:opacity-40"
          >
            <FiX size={23} />
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-indigo-300">
            <FiLoader className="animate-spin" />
            Loading event...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="px-6 py-16 text-center text-red-400"
          >
            {error}
          </div>
        ) : form ? (

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >

            {/* TITLE */}
            <div>
              <label
                htmlFor="edit-event-title"
                className="block text-sm text-gray-300 mb-2"
              >
                Event Title *
              </label>

              <input
                id="edit-event-title"
                type="text"
                required
                maxLength={150}
                value={form.title}
                onChange={(e) =>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
                className={EVENT_INPUT_CLASS}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="edit-event-description"
                className="block text-sm text-gray-300 mb-2"
              >
                Description *
              </label>

              <textarea
                id="edit-event-description"
                rows={4}
                required
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className={`${EVENT_INPUT_CLASS} resize-none`}
              />
            </div>

            {/* CATEGORY + MODE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label
                  htmlFor="edit-event-category"
                  className="block text-sm text-gray-300 mb-2"
                >
                  Category *
                </label>

                <select
                  id="edit-event-category"
                  value={form.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                  className={EVENT_INPUT_CLASS}
                >
                  {EVENT_CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-event-mode"
                  className="block text-sm text-gray-300 mb-2"
                >
                  Event Mode *
                </label>

                <select
                  id="edit-event-mode"
                  value={form.mode}
                  onChange={(e) =>
                    handleModeChange(
                      e.target.value
                    )
                  }
                  className={EVENT_INPUT_CLASS}
                >
                  {EVENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* EVENT DATE */}
            <div>
              <label
                htmlFor="edit-event-date"
                className="flex items-center gap-2 text-sm text-gray-300 mb-2"
              >
                <FiCalendar className="text-indigo-400" />
                Event Date & Time *
              </label>

              <input
                id="edit-event-date"
                type="datetime-local"
                required
                value={form.eventDate}
                onChange={(e) =>
                  updateField(
                    "eventDate",
                    e.target.value
                  )
                }
                className={`${EVENT_INPUT_CLASS} scheme-dark`}
              />
            </div>

            {/* ONLINE MEETING URL */}
            {form.mode === "Online" ? (
              <div>
                <label
                  htmlFor="edit-event-link"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <FiVideo className="text-purple-400" />
                  Meeting URL *
                </label>

                <input
                  id="edit-event-link"
                  type="url"
                  required
                  value={form.meetingLink}
                  onChange={(e) =>
                    updateField(
                      "meetingLink",
                      e.target.value
                    )
                  }
                  placeholder="https://meet.google.com/..."
                  className={EVENT_INPUT_CLASS}
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="edit-event-location"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <FiMapPin className="text-emerald-400" />
                  Event Venue *
                </label>

                <input
                  id="edit-event-location"
                  type="text"
                  required
                  maxLength={250}
                  value={form.location}
                  onChange={(e) =>
                    updateField(
                      "location",
                      e.target.value
                    )
                  }
                  placeholder="Dhaka University, Dhaka"
                  className={EVENT_INPUT_CLASS}
                />
              </div>
            )}

            {/* CAPACITY */}
            <div>
              <label
                htmlFor="edit-event-capacity"
                className="flex items-center gap-2 text-sm text-gray-300 mb-2"
              >
                <FiUsers className="text-indigo-400" />
                Maximum Participants *
              </label>

              <input
                id="edit-event-capacity"
                type="number"
                required
                min={1}
                max={10000}
                step={1}
                value={form.maxParticipants}
                onChange={(e) =>
                  updateField(
                    "maxParticipants",
                    e.target.value
                  )
                }
                className={EVENT_INPUT_CLASS}
              />

              <p className="text-xs text-gray-500 mt-2">
                Currently joined: {participantCount}.
                Capacity cannot be lower than this number.
              </p>
            </div>

            {/* REUSABLE AGENDA */}
            <div className="border-t border-white/10 pt-5">

              <EventAgenda
                agenda={form.agenda}
                onChange={(updatedAgenda) =>
                  updateField(
                    "agenda",
                    updatedAgenda
                  )
                }
              />

            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="min-h-12 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="min-h-12 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiEdit2 />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

        ) : null}
      </div>
    </div>
  );
};

export default EditEventModal;
