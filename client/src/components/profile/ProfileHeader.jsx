import { useState } from "react";

import { FiEdit } from "react-icons/fi";

import api from "../../services/api";
import toast from "react-hot-toast";

import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({
  user,
  setUser,
  currentUser,
}) => {
  const [openEdit, setOpenEdit] =
    useState(false);

  const isOwnProfile =
    currentUser?._id === user?._id;

  const isFollowing =
    user?.followers?.some(
      (follower) =>
        follower._id ===
        currentUser?._id
    );

  const handleFollow =
    async () => {
      try {
        await api.put(
          `/users/follow/${user._id}`
        );

        setUser((prev) => ({
          ...prev,
          followers: [
            ...prev.followers,
            {
              _id:
                currentUser._id,
            },
          ],
        }));

        toast.success(
          "Following user"
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to follow"
        );
      }
    };

  const handleUnfollow =
    async () => {
      try {
        await api.put(
          `/users/unfollow/${user._id}`
        );

        setUser((prev) => ({
          ...prev,

          followers:
            prev.followers.filter(
              (
                follower
              ) =>
                follower._id !==
                currentUser._id
            ),
        }));

        toast.success(
          "Unfollowed user"
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to unfollow"
        );
      }
    };

  return (
    <>
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

                flex
                items-center
                justify-center
              "
            >
              {user?.profilePicture ? (
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
              ) : (
                <span
                  className="
                    text-5xl
                    font-bold
                    text-white
                  "
                >
                  {user?.name?.charAt(
                    0
                  )}
                </span>
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

              <div
                className="
                  flex
                  gap-6
                  mt-4
                "
              >
                <span className="text-gray-300">
                  <strong className="text-white">
                    {
                      user
                        ?.followers
                        ?.length
                    }
                  </strong>{" "}
                  Followers
                </span>

                <span className="text-gray-300">
                  <strong className="text-white">
                    {
                      user
                        ?.following
                        ?.length
                    }
                  </strong>{" "}
                  Following
                </span>
              </div>

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
                {user?.skills
                  ?.length > 0 ? (
                  user.skills.map(
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
                  )
                ) : (
                  <span
                    className="
                      text-gray-500
                      text-sm
                    "
                  >
                    No skills added
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            {isOwnProfile ? (
              <button
                onClick={() =>
                  setOpenEdit(
                    true
                  )
                }
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
            ) : (
              <button
                onClick={
                  isFollowing
                    ? handleUnfollow
                    : handleFollow
                }
                className={`
                  h-fit
                  px-6 py-3

                  rounded-xl

                  font-semibold

                  transition-all duration-300

                  ${
                    isFollowing
                      ? "bg-white/10 border border-white/20 text-white"
                      : "bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:scale-105"
                  }
                `}
              >
                {isFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        user={user}
        setUser={setUser}
        isOpen={openEdit}
        onClose={() =>
          setOpenEdit(false)
        }
      />
    </>
  );
};

export default ProfileHeader;