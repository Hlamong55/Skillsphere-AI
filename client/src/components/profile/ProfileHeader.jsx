import { useState } from "react";
import { FiEdit, FiUserPlus, FiUserCheck } from "react-icons/fi";
import api from "../../services/api";
import toast from "react-hot-toast";
import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({
  user,
  setUser,
  currentUser,
}) => {
  const [openEdit, setOpenEdit] = useState(false);

  const isOwnProfile =
    currentUser?._id === user?._id;

  const isFollowing =
    user?.followers?.some(
      (follower) =>
        follower._id === currentUser?._id
    );

  const handleFollow = async () => {
    try {
      await api.put(`/users/follow/${user._id}`);

      setUser((prev) => ({
        ...prev,
        followers: [
          ...(prev.followers || []),
          { _id: currentUser._id },
        ],
      }));

      toast.success("Following user");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to follow"
      );
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.put(`/users/unfollow/${user._id}`);

      setUser((prev) => ({
        ...prev,
        followers: (prev.followers || []).filter(
          (follower) =>
            follower._id !== currentUser._id
        ),
      }));

      toast.success("Unfollowed user");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to unfollow"
      );
    }
  };

  return (
    <>
      <div className="bg-white/3 border border-white/10 rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.4)]">
        {/* COVER */}
        <div className="relative h-72 md:h-80 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600">
          {user?.coverPhoto ? (
            <img
              src={user.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600" />
          )}

          {/* Optional dark overlay for better premium look */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* CONTENT WRAPPER */}
        <div className="relative px-6 md:px-8 pb-8 pt-24 md:pt-28">
          {/* AVATAR */}
          <div className="absolute left-6 md:left-8 -top-16 md:-top-20">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#0B1120] overflow-hidden bg-linear-to-r from-indigo-500 to-purple-500 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user?.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </div>

          {/* TOP ROW */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* LEFT INFO */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white wrap-break-words">
                {user?.name}
              </h1>

              <p className="text-gray-400 mt-2 text-base">
                @{user?.username}
              </p>

              <p className="text-gray-300 mt-5 max-w-3xl leading-8 text-[15px] md:text-lg">
                {user?.bio || "No bio added yet"}
              </p>


              {/* SKILLS */}
              <div className="flex flex-wrap gap-2 mt-6">
                {user?.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    No skills added
                  </span>
                )}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="shrink-0">
              {isOwnProfile ? (
                <button
                  onClick={() => setOpenEdit(true)}
                  className="w-full lg:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-all duration-300 px-6 py-3.5 rounded-2xl text-white font-semibold shadow-[0_8px_30px_rgba(139,92,246,0.25)]"
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
                  className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
                    isFollowing
                      ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                      : "bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 shadow-[0_8px_30px_rgba(139,92,246,0.25)]"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FiUserCheck />
                      Following
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        user={user}
        setUser={setUser}
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
      />
    </>
  );
};

export default ProfileHeader;