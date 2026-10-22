
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

import api from "../services/api";

const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const keyword = query.trim();

    if (!keyword) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(
          "/users/search/users",
          {
            params: { search: keyword },
            signal: controller.signal,
          }
        );

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError("Failed to search users.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Explore People
        </h1>

        <p className="text-gray-400 mt-2">
          Find learners, developers and collaborators.
        </p>
      </div>

      {/* SEARCH INPUT */}
      <div className="flex items-center gap-3 bg-[#111827] border border-white/10 focus-within:border-indigo-500 rounded-2xl px-5">
        <FiSearch size={22} className="text-indigo-400" />

        <input
          type="text"
          placeholder="Search by name or username..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setUsers([]);
            setError("");
          }}
          className="w-full bg-transparent py-4 outline-none text-white placeholder:text-gray-500"
        />
      </div>

      {/* RESULTS */}
      <div className="mt-7 space-y-3">
        {!query.trim() ? (
          <p className="text-center text-gray-500 py-10">
            Start typing to discover people.
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-indigo-400">
            <FiLoader className="animate-spin" size={22} />
            Searching users...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-400 p-4">
            <FiAlertCircle />
            {error}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No matching users found.
          </p>
        ) : (
          users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="flex items-center gap-4 bg-white/3 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-4 transition-all"
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FiUser size={24} />
                </div>
              )}

              <div>
                <h3 className="text-white font-semibold">
                  {user.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  @{user.username}
                </p>
              </div>

              <span className="ml-auto text-sm text-indigo-400">
                View Profile
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;
