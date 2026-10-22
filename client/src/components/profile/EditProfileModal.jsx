
import { useState } from "react";
import {
  FiX,
  FiSave,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";

// Check valid HTTP / HTTPS URL
const isValidImageUrl = (value) => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
};

// Separate form component initializes when modal opens
const ProfileEditForm = ({ user, setUser, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    profilePicture: user?.profilePicture || "",
    coverPhoto: user?.coverPhoto || "",
    skills: Array.isArray(user?.skills)
      ? user.skills.join(", ")
      : "",
  });

  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({
    profilePicture: false,
    coverPhoto: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "profilePicture" || name === "coverPhoto") {
      setImageErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidImageUrl(formData.profilePicture)) {
      toast.error("Enter a valid Profile Picture URL");
      return;
    }

    if (!isValidImageUrl(formData.coverPhoto)) {
      toast.error("Enter a valid Cover Photo URL");
      return;
    }

    if (
      (formData.profilePicture.trim() &&
        imageErrors.profilePicture) ||
      (formData.coverPhoto.trim() &&
        imageErrors.coverPhoto)
    ) {
      toast.error("Please use accessible image URLs");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        profilePicture: formData.profilePicture.trim(),
        coverPhoto: formData.coverPhoto.trim(),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const { data } = await api.put(
        "/users/profile",
        payload
      );

      if (!data?.user) {
        throw new Error("Updated user data was not returned");
      }

      // Update profile immediately
      setUser(data.user);

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B1120] border border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
    >
      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0B1120] border-b border-white/10">
        <h2 className="text-xl font-bold text-white">
          Edit Profile
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="text-gray-400 hover:text-white transition-all duration-300"
        >
          <FiX size={22} />
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* NAME */}
        <div>
          <label
            htmlFor="edit-name"
            className="block mb-2 text-sm text-gray-400"
          >
            Full Name
          </label>

          <input
            id="edit-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* BIO */}
        <div>
          <label
            htmlFor="edit-bio"
            className="block mb-2 text-sm text-gray-400"
          >
            Bio
          </label>

          <textarea
            id="edit-bio"
            rows={3}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={300}
            placeholder="Tell others about yourself..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white resize-none outline-none focus:border-indigo-500"
          />

          <p className="text-right text-xs text-gray-500 mt-1">
            {formData.bio.length}/300
          </p>
        </div>

        {/* PROFILE PICTURE */}
        <div>
          <label
            htmlFor="edit-profile-picture"
            className="block mb-2 text-sm text-gray-400"
          >
            Profile Picture URL
          </label>

          <input
            id="edit-profile-picture"
            type="url"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          />

          {formData.profilePicture.trim() &&
            isValidImageUrl(formData.profilePicture) && (
              <div className="mt-3 flex items-center gap-3">
                {!imageErrors.profilePicture ? (
                  <img
                    key={formData.profilePicture}
                    src={formData.profilePicture}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        profilePicture: true,
                      }))
                    }
                  />
                ) : (
                  <FiAlertCircle
                    size={22}
                    className="text-red-400"
                  />
                )}

                <p className="text-xs text-gray-400">
                  {imageErrors.profilePicture
                    ? "Image could not be loaded"
                    : "Profile Picture Preview"}
                </p>
              </div>
            )}
        </div>

        {/* COVER PHOTO */}
        <div>
          <label
            htmlFor="edit-cover-photo"
            className="block mb-2 text-sm text-gray-400"
          >
            Cover Photo URL
          </label>

          <input
            id="edit-cover-photo"
            type="url"
            name="coverPhoto"
            value={formData.coverPhoto}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          />

          {formData.coverPhoto.trim() &&
            isValidImageUrl(formData.coverPhoto) && (
              <div className="mt-3">
                {!imageErrors.coverPhoto ? (
                  <img
                    key={formData.coverPhoto}
                    src={formData.coverPhoto}
                    alt="Cover preview"
                    className="w-full h-28 rounded-xl object-cover border border-white/10"
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        coverPhoto: true,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <FiAlertCircle />
                    Cover image could not be loaded
                  </div>
                )}
              </div>
            )}
        </div>

        {/* SKILLS */}
        <div>
          <label
            htmlFor="edit-skills"
            className="block mb-2 text-sm text-gray-400"
          >
            Skills
          </label>

          <input
            id="edit-skills"
            type="text"
            name="skills"
            placeholder="React, Node.js, MongoDB"
            value={formData.skills}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
          />

          <p className="text-xs text-gray-500 mt-1">
            Separate skills using commas.
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] transition-all duration-300 py-3 rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <FiSave />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const EditProfileModal = ({
  user,
  setUser,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <ProfileEditForm
        user={user}
        setUser={setUser}
        onClose={onClose}
      />
    </div>
  );
};

export default EditProfileModal;
