
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FiCalendar,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import useEvents from "../hooks/useEvents";

import EventList from "../components/events/EventList";
import EventFilters from "../components/events/EventFilters";
import CreateEventModal from "../components/events/CreateEventModal";
import EventDetailsModal from "../components/events/EventDetailsModal";
import EventsDashboard from "../components/events/EventsDashboard";

const Events = () => {
  // URL-BASED NAVIGATION
  const [searchParams, setSearchParams] = useSearchParams();

  const activeView =
    searchParams.get("view") === "mine"
      ? "mine"
      : "all";

  // ALL EVENTS API STATE
  const {
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
  } = useEvents();

  // SEARCH - CURRENT PAGE ONLY
  const [search, setSearch] = useState("");

  // MODAL STATES
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // MY EVENTS DASHBOARD REFRESH
  const [
    dashboardRefreshKey,
    setDashboardRefreshKey,
  ] = useState(0);

  const refreshDashboard = () => {
    setDashboardRefreshKey(
      (previous) => previous + 1
    );
  };

  // FILTER EVENTS ON CURRENT API PAGE
  const visibleEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return events;

    return events.filter((event) => {
      const title =
        event.title?.toLowerCase() || "";

      const description =
        event.description?.toLowerCase() || "";

      return (
        title.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [events, search]);

  // AFTER EVENT CREATION
  const handleEventCreated = () => {
    setShowCreate(false);

    // Navigate to My Events via URL
    setSearchParams({
      view: "mine",
    });

    refreshDashboard();
    refreshEvents();
  };

  // AFTER JOIN / LEAVE
  const handleParticipationUpdated = () => {
    refreshEvents();
    refreshDashboard();
  };

  // CLOSE EVENT DETAILS
  const handleCloseDetails = () => {
    setSelectedEvent(null);

    refreshEvents();
    refreshDashboard();
  };

  return (
    <main className="min-h-screen bg-[#0B1120] text-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* PAGE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-9">

          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2">
              <FiCalendar size={18} />
              SKILLSPHERE COMMUNITY
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {activeView === "mine"
                ? "My Events"
                : "Events & Collaboration"}
            </h1>

            <p className="text-gray-400 mt-3">
              {activeView === "mine"
                ? "Manage the events you organize and attend."
                : "Discover workshops, study sessions, webinars, hackathons and collaboration opportunities."}
            </p>
          </div>

          {/* CREATE EVENT */}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:opacity-90 transition"
          >
            <FiPlus size={20} />
            Create Event
          </button>
        </header>

        {/* ALL EVENTS VIEW */}
        {activeView === "all" && (
          <section>

            {/* SEARCH & FILTERS */}
            <EventFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={changeCategory}
              upcomingOnly={upcomingOnly}
              onUpcomingChange={changeUpcomingOnly}
            />

            {/* EVENT COUNT */}
            {!loading && !error && (
              <p className="mb-5 text-sm text-gray-400">
                Showing {visibleEvents.length} event
                {visibleEvents.length !== 1 ? "s" : ""}
                {" "}on this page

                {totalEvents > 0 && (
                  <span className="text-gray-500">
                    {" "}· {totalEvents} total matching
                    category/date filters
                  </span>
                )}
              </p>
            )}

            {/* REUSABLE EVENT LIST */}
            <EventList
              events={visibleEvents}
              loading={loading}
              error={error}
              onView={setSelectedEvent}
            />

            {/* PAGINATION */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-4 mt-10">

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((previous) =>
                      Math.max(1, previous - 1)
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-30"
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <span className="text-sm text-gray-300">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(totalPages, previous + 1)
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-30"
                >
                  Next
                  <FiChevronRight />
                </button>

              </div>
            )}
          </section>
        )}

        {/* MY EVENTS DASHBOARD */}
        {activeView === "mine" && (
          <EventsDashboard
            onView={setSelectedEvent}
            refreshKey={dashboardRefreshKey}
          />
        )}

      </div>

      {/* CREATE EVENT MODAL */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={handleEventCreated}
        />
      )}

      {/* EVENT DETAILS / JOIN / LEAVE */}
      {selectedEvent && (
        <EventDetailsModal
          eventId={selectedEvent}
          onClose={handleCloseDetails}
          onUpdated={handleParticipationUpdated}
        />
      )}

    </main>
  );
};

export default Events;
