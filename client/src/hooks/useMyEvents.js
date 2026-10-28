
import { useEffect, useState } from "react";
import api from "../services/api";

const useMyEvents = (
  type,
  period = "upcoming",
  enabled = true
) => {
  const [events, setEvents] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    const fetchMyEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          "/events/mine",
          {
            params: {
              type,
              period,
              page,
            },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        setEvents(data.events || []);
        setTotalPages(data.pages || 0);
        setTotalEvents(data.totalEvents || 0);

      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "My Events fetch error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Could not load your events."
        );

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMyEvents();

    return () => {
      controller.abort();
    };

  }, [
    type,
    period,
    page,
    reloadKey,
    enabled,
  ]);

  // Refresh current list
  const refresh = () => {
    setReloadKey((previous) => previous + 1);
  };

  // Change page
  const changePage = (nextPage) => {
    setPage(nextPage);
  };

  return {
    events,
    page,
    totalPages,
    totalEvents,
    loading,
    error,
    changePage,
    refresh,
  };
};

export default useMyEvents;
