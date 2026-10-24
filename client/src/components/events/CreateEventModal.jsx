import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiCalendar,
  FiMapPin,
  FiVideo,
  FiUsers,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";
import EventAgenda from "./EventAgenda";

import {
  EVENT_CATEGORIES,
  EVENT_MODES,
  EVENT_INPUT_CLASS,
  createEmptyEventForm,
} from "../../utils/eventHelpers";

// CREATE EVENT MODAL
const CreateEventModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(createEmptyEventForm);
  const [saving, setSaving] = useState(false);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleModeChange = (value) => {
    setForm((previous) => ({
      ...previous,
      mode: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // DATE VALIDATION
    const selectedDate = new Date(form.eventDate);

    if (
      !form.eventDate ||
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate <= new Date()
    ) {
      toast.error("Please select a future date and time.");
      return;
    }

    // ONLINE EVENT VALIDATION
    if (form.mode === "Online" && !form.meetingLink.trim()) {
      toast.error("Please enter a meeting link.");
      return;
    }

    // OFFLINE EVENT VALIDATION
    if (form.mode === "Offline" && !form.location.trim()) {
      toast.error("Please enter the event venue.");
      return;
    }

    const capacity = Number(form.maxParticipants);

    if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 10000) {
      toast.error("Enter 1 to 10000 participants.");
      return;
    }

    const cleanAgenda = form.agenda
      .map((topic) => topic.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,

      // Local date/time converted to ISO for backend
      eventDate: selectedDate.toISOString(),

      mode: form.mode,

      location: form.mode === "Online" ? "Online" : form.location.trim(),

      meetingLink: form.mode === "Online" ? form.meetingLink.trim() : "",

      maxParticipants: capacity,
      agenda: cleanAgenda,
    };

    try {
      setSaving(true);

      const { data } = await api.post("/events", payload);

      toast.success("Event created successfully!");

      // Parent Events page will refresh event list
      onCreated?.(data);
    } catch (error) {
      console.error("Create Event error:", error);

      toast.error(error.response?.data?.message || "Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create New Event"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-white/10 shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-[#111827] border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Event</h2>

            <p className="text-sm text-gray-400 mt-1">
              Organize a learning or collaboration event.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close Create Event"
            className="p-2 text-gray-400 hover:text-white disabled:opacity-40"
          >
            <FiX size={23} />
          </button>
        </div>

        {/* EVENT FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* EVENT TITLE */}
          <div>
            <label
              htmlFor="event-title"
              className="block text-sm text-gray-300 mb-2"
            >
              Event Title *
            </label>

            <input
              id="event-title"
              type="text"
              required
              maxLength={150}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="React Learning Workshop"
              className={EVENT_INPUT_CLASS}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="event-description"
              className="block text-sm text-gray-300 mb-2"
            >
              Description *
            </label>

            <textarea
              id="event-description"
              required
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="What will participants learn?"
              className={`${EVENT_INPUT_CLASS} resize-none`}
            />
          </div>

          {/* CATEGORY & MODE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-category"
                className="block text-sm text-gray-300 mb-2"
              >
                Event Category *
              </label>

              <select
                id="event-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={EVENT_INPUT_CLASS}
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-mode"
                className="block text-sm text-gray-300 mb-2"
              >
                Event Mode *
              </label>

              <select
                id="event-mode"
                value={form.mode}
                onChange={(e) => handleModeChange(e.target.value)}
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

          {/* DATE AND TIME PICKER */}
          <div>
            <label
              htmlFor="event-date"
              className="flex items-center gap-2 text-sm text-gray-300 mb-2"
            >
              <FiCalendar className="text-indigo-400" />
              Event Date & Time *
            </label>

            <input
              id="event-date"
              type="datetime-local"
              required
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              className={`${EVENT_INPUT_CLASS} scheme-dark`}
            />

            <p className="text-xs text-gray-500 mt-2">
              Choose a future date and time in your local timezone.
            </p>
          </div>

          {/* ONLINE / OFFLINE DYNAMIC FIELD */}
          {form.mode === "Online" ? (
            <div>
              <label
                htmlFor="event-meeting-link"
                className="flex items-center gap-2 text-sm text-gray-300 mb-2"
              >
                <FiVideo className="text-purple-400" />
                Meeting URL *
              </label>

              <input
                id="event-meeting-link"
                type="url"
                required
                value={form.meetingLink}
                onChange={(e) => updateField("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/..."
                className={EVENT_INPUT_CLASS}
              />

              <p className="text-xs text-gray-500 mt-2">
                Use a valid Google Meet, Zoom or other meeting URL.
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="event-location"
                className="flex items-center gap-2 text-sm text-gray-300 mb-2"
              >
                <FiMapPin className="text-emerald-400" />
                Event Venue / Location *
              </label>

              <input
                id="event-location"
                type="text"
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Dhaka University, Dhaka"
                className={EVENT_INPUT_CLASS}
              />

              <p className="text-xs text-gray-500 mt-2">
                Enter a recognizable venue for Google Maps.
              </p>
            </div>
          )}

          {/* PARTICIPANT CAPACITY */}
          <div>
            <label
              htmlFor="event-capacity"
              className="flex items-center gap-2 text-sm text-gray-300 mb-2"
            >
              <FiUsers className="text-indigo-400" />
              Maximum Participants *
            </label>

            <input
              id="event-capacity"
              type="number"
              min={1}
              max={10000}
              step={1}
              required
              value={form.maxParticipants}
              onChange={(e) => updateField("maxParticipants", e.target.value)}
              className={EVENT_INPUT_CLASS}
            />
          </div>

          {/* REUSABLE DYNAMIC AGENDA */}
          <div className="border-t border-white/10 pt-5">
            <EventAgenda
              agenda={form.agenda}
              onChange={(updatedAgenda) => updateField("agenda", updatedAgenda)}
            />
          </div>

          {/* FORM FOOTER */}
          <div className="border-t border-white/10 pt-5 space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <FiPlus size={20} />
                  Publish Event
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              Login is required to create an event.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
