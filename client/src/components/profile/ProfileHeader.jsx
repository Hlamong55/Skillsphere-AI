import {
  FiEdit,
//   FiMapPin,
} from "react-icons/fi";

const ProfileHeader = ({
  user,
}) => {
  return (
    <div
      className="
        bg-white/3
        border border-white/10
        rounded-3xl
        overflow-hidden
        shadow-[0_10px_50px_rgba(0,0,0,0.4)]
      "
    >
      {/* Cover */}
      <div
        className="
          h-72
          bg-linear-to-r
          from-indigo-600
          via-purple-600
          to-pink-600
        "
      >
        {user?.coverPhoto && (
          <img
            src={
              user.coverPhoto
            }
            alt=""
            className="
              w-full h-full
              object-cover
            "
          />
        )}
      </div>

      <div className="px-8 pb-8">
        {/* Avatar */}
        <div
          className="
            -mt-20
            mb-5
          "
        >
          <div
            className="
              w-40 h-40
              rounded-full
              border-6
              border-[#0B1120]
              overflow-hidden
              bg-linear-to-r
              from-indigo-500
              to-purple-500
            "
          >
            {user?.profilePicture && (
              <img
                src={
                  user.profilePicture
                }
                alt=""
                className="
                  w-full h-full
                  object-cover
                "
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div
          className="
            flex
            justify-between
            gap-6
          "
        >
          <div>
            <h1
              className="
                text-4xl
                font-bold
                text-white
              "
            >
              {user?.name}
            </h1>

            <p
              className="
                text-gray-400
                mt-1
              "
            >
              @{user?.username}
            </p>

            <p
              className="
                text-gray-300
                mt-5
                max-w-2xl
                leading-8
              "
            >
              {user?.bio ||
                "No bio added yet"}
            </p>

            {/* Skills */}
            <div
              className="
                flex flex-wrap
                gap-2
                mt-6
              "
            >
              {user?.skills?.map(
                (
                  skill,
                  index
                ) => (
                  <span
                    key={index}
                    className="
                      px-4 py-2
                      rounded-full
                      bg-indigo-500/15
                      border border-indigo-500/20
                      text-indigo-300
                      text-sm
                    "
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Edit */}
          <button
            className="
              h-fit
              flex items-center gap-2

              bg-linear-to-r
              from-indigo-500
              to-purple-500

              hover:scale-105

              transition-all duration-300

              px-5 py-3

              rounded-xl

              text-white
              font-semibold
            "
          >
            <FiEdit />

            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;