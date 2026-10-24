import { FiSearch, FiClock, FiX } from "react-icons/fi";

import { EVENT_CATEGORIES, EVENT_INPUT_CLASS } from "../../utils/eventHelpers";

const EventFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  upcomingOnly,
  onUpcomingChange,
}) => {
  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("All");
    onUpcomingChange(true);
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "All" || !upcomingOnly;

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SEARCH */}
        <div className="flex items-center gap-3 bg-[#0B1120] border border-white/10 focus-within:border-indigo-500 rounded-xl px-4">
          <FiSearch size={18} className="text-indigo-400 shrink-0" />

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events on this page..."
            aria-label="Search events"
            className="w-full bg-transparent py-3 text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className={EVENT_INPUT_CLASS}
        >
          <option value="All">All Categories</option>

          {EVENT_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* UPCOMING */}
        <label className="flex items-center justify-between gap-3 bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 cursor-pointer">
          <span className="flex items-center gap-2 text-gray-300 text-sm">
            <FiClock className="text-indigo-400" />
            Upcoming Only
          </span>

          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => onUpcomingChange(e.target.checked)}
            className="w-4 h-4 accent-indigo-500"
          />
        </label>
      </div>

      {/* RESET FILTERS */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-300 transition-colors"
          >
            <FiX size={16} />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
