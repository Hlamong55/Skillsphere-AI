import { useState } from "react";

import {
  FiX,
  FiSave,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";

const EditProfileModal = ({
  user,
  setUser,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] =
    useState({
      name: user?.name || "",
      bio: user?.bio || "",
      profilePicture:
        user?.profilePicture || "",
      coverPhoto:
        user?.coverPhoto || "",
      skills:
        user?.skills?.join(", ") ||
        "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const payload = {
          ...formData,
          skills:
            formData.skills
              .split(",")
              .map((skill) =>
                skill.trim()
              )
              .filter(Boolean),
        };

        const { data } =
          await api.put(
            "/users/profile",
            payload
          );

        setUser(data.user);

        toast.success(
          "Profile updated successfully"
        );

        onClose();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0
        z-50

        flex items-center justify-center

        bg-black/70
        backdrop-blur-md

        p-4
      "
    >
      <div
        className="
          w-full
          max-w-2xl

          bg-[#0B1120]

          border border-white/10

          rounded-2xl

          shadow-[0_20px_80px_rgba(0,0,0,0.6)]

          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between

            px-6 py-4

            border-b border-white/10
          "
        >
          <h2
            className="
              text-xl
              font-bold
              text-white
            "
          >
            Edit Profile
          </h2>

          <button
            onClick={onClose}
            className="
              text-gray-400
              hover:text-white

              transition-all duration-300
            "
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="
            p-6
            space-y-5
          "
        >
          {/* Name */}
          <div>
            <label
              className="
                block mb-2

                text-sm
                text-gray-400
              "
            >
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              className="
                w-full

                bg-white/5

                border border-white/10

                rounded-xl

                p-3

                text-white

                outline-none

                focus:border-indigo-500
              "
            />
          </div>

          {/* Bio */}
          <div>
            <label
              className="
                block mb-2

                text-sm
                text-gray-400
              "
            >
              Bio
            </label>

            <textarea
              rows={4}
              name="bio"
              value={
                formData.bio
              }
              onChange={
                handleChange
              }
              className="
                w-full

                bg-white/5

                border border-white/10

                rounded-xl

                p-3

                text-white

                resize-none

                outline-none

                focus:border-indigo-500
              "
            />
          </div>

          {/* Profile Photo */}
          <div>
            <label
              className="
                block mb-2

                text-sm
                text-gray-400
              "
            >
              Profile Picture URL
            </label>

            <input
              type="text"
              name="profilePicture"
              value={
                formData.profilePicture
              }
              onChange={
                handleChange
              }
              className="
                w-full

                bg-white/5

                border border-white/10

                rounded-xl

                p-3

                text-white

                outline-none

                focus:border-indigo-500
              "
            />
          </div>

          {/* Cover Photo */}
          <div>
            <label
              className="
                block mb-2

                text-sm
                text-gray-400
              "
            >
              Cover Photo URL
            </label>

            <input
              type="text"
              name="coverPhoto"
              value={
                formData.coverPhoto
              }
              onChange={
                handleChange
              }
              className="
                w-full

                bg-white/5

                border border-white/10

                rounded-xl

                p-3

                text-white

                outline-none

                focus:border-indigo-500
              "
            />
          </div>

          {/* Skills */}
          <div>
            <label
              className="
                block mb-2

                text-sm
                text-gray-400
              "
            >
              Skills
            </label>

            <input
              type="text"
              name="skills"
              placeholder="React, Node.js, MongoDB"
              value={
                formData.skills
              }
              onChange={
                handleChange
              }
              className="
                w-full

                bg-white/5

                border border-white/10

                rounded-xl

                p-3

                text-white

                outline-none

                focus:border-indigo-500
              "
            />
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full

              flex items-center justify-center gap-2

              bg-linear-to-r
              from-indigo-500
              to-purple-500

              hover:scale-105

              transition-all duration-300

              py-3

              rounded-xl

              text-white
              font-semibold
            "
          >
            <FiSave />

            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;