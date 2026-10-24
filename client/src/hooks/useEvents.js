
import { useEffect, useState } from "react";
import api from "../services/api";

const useEvents = () => {
  const [events, setEvents] = useState([]);

  const [category, setCategory] = useState("All");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  // Fetch events whenever filters or page change
  useEffect(() => {
    const controller = new AbortController();

    const loadEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          upcoming: upcomingOnly,
        };

        if (category !== "All") {
          params.category = category;
        }

        const { data } = await api.get(
          "/events",
          {
            params,
            signal: controller.signal,
          }
        );

        if (!controller.signal.aborted) {
          setEvents(data.events || []);
          setTotalPages(data.pages || 0);
          setTotalEvents(data.totalEvents || 0);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Event fetch error:", err);

          setError(
            err.response?.data?.message ||
            "Failed to load events."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      controller.abort();
    };
  }, [
    page,
    category,
    upcomingOnly,
    reloadKey,
  ]);

  // Refresh after creating an event
  const refreshEvents = () => {
    setReloadKey((previous) => previous + 1);
  };

  // Change category and reset page
  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  // Toggle upcoming events
  const changeUpcomingOnly = (value) => {
    setUpcomingOnly(value);
    setPage(1);
  };

  return {
    events,
    category,
    upcomingOnly,
    page,
    totalPages,
    totalEvents,
    loading,
    error,
    setPage,
    changeCategory,
    changeUpcomingOnly,
    refreshEvents,
  };
};

export default useEvents;
