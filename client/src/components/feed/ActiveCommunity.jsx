
import { Link } from "react-router-dom";

import {
  FiUsers,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

import useOnlinePresence from "../../hooks/useOnlinePresence";

const ActiveCommunity = () => {
  const {
    onlineUsers,
    onlineCount,
    connected,
    error,
  } = useOnlinePresence();

  const visibleUsers =
    onlineUsers.slice(0, 5);

  const remainingCount = Math.max(
    0,
    onlineCount - visibleUsers.length
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between gap-2">

        <h3 className="text-lg font-semibold text-white">
          Active Community
        </h3>

        {connected ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
            <FiWifi size={15} />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiWifiOff size={15} />
            Offline
          </span>
        )}

      </div>

      {/* CONNECTION ERROR */}
      {error && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300"
        >
          {error}
        </p>
      )}

      {/* NOT CONNECTED */}
      {!connected ? (
        <div className="py-6 text-center">

          <FiUsers
            size={26}
            className="mx-auto mb-3 text-gray-500"
          />

          <p className="text-sm text-gray-400">
            Connecting to community...
          </p>

        </div>

      ) : onlineCount === 0 ? (

        /* NO OTHER ONLINE USERS */
        <div className="py-6 text-center">

          <FiUsers
            size={27}
            className="mx-auto mb-3 text-indigo-400"
          />

          <p className="text-sm font-medium text-white">
            You're online!
          </p>

          <p className="mt-2 text-xs text-gray-400">
            No other community members
            are online right now.
          </p>

        </div>

      ) : (

        /* REAL ONLINE USERS */
        <div className="space-y-4">

          {visibleUsers.map((person) => {
            const personId =
              String(person._id);

            const displayName =
              person.name ||
              "Community Member";

            return (
              <Link
                key={personId}
                to={`/profile/${personId}`}
                className="group flex items-center gap-3 rounded-xl py-1 transition"
              >

                {/* AVATAR */}
                <div className="relative shrink-0">

                  <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-purple-600">

                    <span className="font-semibold text-white">
                      {displayName
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    {person.profilePicture && (
                      <img
                        src={person.profilePicture}
                        alt={displayName}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    )}

                  </div>

                  {/* REAL ONLINE DOT */}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#171B2B] bg-green-500" />

                </div>

                {/* USER DETAILS */}
                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-white transition group-hover:text-indigo-300">
                    {displayName}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    @{person.username}
                  </p>

                </div>

                <span className="shrink-0 text-xs text-green-400">
                  Online
                </span>

              </Link>
            );
          })}

          {remainingCount > 0 && (
            <p className="pt-2 text-center text-xs text-gray-400">
              +{remainingCount} more members online
            </p>
          )}

        </div>
      )}

      {/* FOOTER */}
      <div className="mt-5 border-t border-white/10 pt-2">

        <div className="flex items-center justify-between">

          <span className="text-xs text-gray-400">
            Members online
          </span>

          <span className="text-sm font-bold text-green-400">
            {connected ? onlineCount : "—"}
          </span>

        </div>

      </div>

    </section>
  );
};

export default ActiveCommunity;
