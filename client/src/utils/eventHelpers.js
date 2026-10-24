
export const EVENT_CATEGORIES = [
  "Workshop",
  "Study Session",
  "Webinar",
  "Hackathon",
  "Collaboration",
];

export const EVENT_MODES = [
  "Online",
  "Offline",
];

export const createEmptyEventForm = () => ({
  title: "",
  description: "",
  category: "Workshop",
  eventDate: "",
  location: "",
  mode: "Online",
  meetingLink: "",
  maxParticipants: 20,
  agenda: [""],
});

// Format date for Bangladesh
export const formatEventDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
};

// Check whether event is upcoming
export const isUpcomingEvent = (dateValue) => {
  if (!dateValue) return false;

  const timestamp = new Date(dateValue).getTime();

  return (
    Number.isFinite(timestamp) &&
    timestamp > Date.now()
  );
};

// Generate Google Maps search link
export const getEventMapsUrl = (location) => {
  const query = encodeURIComponent(location || "");

  return (
    "https://www.google.com/maps/search/" +
    "?api=1&query=" + query
  );
};

// Google Maps embed URL
export const getEventMapEmbed = (location) => {
  const query = encodeURIComponent(location || "");

  return (
    "https://maps.google.com/maps?q=" +
    query +
    "&output=embed"
  );
};

// Extract current logged-in user ID
export const getCurrentUserId = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("userInfo") || "null"
    );

    return String(
      saved?.user?._id ||
      saved?._id ||
      saved?.user?.id ||
      saved?.id ||
      ""
    );
  } catch {
    return "";
  }
};

// Check organizer
export const isEventOrganizer = (event, userId) => {
  if (!userId || !event) return false;

  const organizerId =
    event.organizer?._id || event.organizer;

  return String(organizerId) === String(userId);
};

// Check participant
export const isEventParticipant = (event, userId) => {
  if (!userId || !event) return false;

  return (
    event.participants?.some((participant) => {
      const id = participant?._id || participant;
      return String(id) === String(userId);
    }) || false
  );
};

// Participant information
export const getEventSeats = (event) => {
  const total = Number(event?.maxParticipants || 0);

  const joined = event?.participants?.length || 0;

  return {
    total,
    joined,
    available: Math.max(0, total - joined),
    isFull: joined >= total,
  };
};

export const EVENT_INPUT_CLASS =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500";
