import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../../services/api";

const SuggestedUsers = () => {
  const [users, setUsers] =
    useState([]);

  useEffect(() => {
    const fetchUsers =
      async () => {
        try {
          const { data } =
            await api.get(
              "/users/suggested"
            );

          setUsers(data);
        } catch (error) {
          console.log(error);
        }
      };

    fetchUsers();
  }, []);

  return (
    <div
      className="
        bg-white/3
        border border-white/10
        rounded-2xl
        p-5
      "
    >
      <h3
        className="
          text-white
          font-semibold
          mb-4
        "
      >
        Suggested Users
      </h3>

      <div className="space-y-4">
        {users.map(
          (user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="
                flex
                items-center
                gap-3
              "
            >
              {user.profilePicture ? (
                <img
                  src={
                    user.profilePicture
                  }
                  alt=""
                  className="
                    w-10 h-10
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    w-10 h-10
                    rounded-full
                    bg-linear-to-r
                    from-indigo-500
                    to-purple-500

                    flex
                    items-center
                    justify-center

                    text-white
                    font-bold
                  "
                >
                  {user.name?.charAt(
                    0
                  )}
                </div>
              )}

              <div>
                <p
                  className="
                    text-white
                    text-sm
                    font-medium
                  "
                >
                  {user.name}
                </p>

                <p
                  className="
                    text-gray-400
                    text-xs
                  "
                >
                  @{user.username}
                </p>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;