
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiX,
  FiSave,
  FiAlertCircle,
  FiLoader,
  FiImage,
  FiUploadCloud,
  FiLink,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

// ========================================
// UPLOAD CONFIGURATION
// ========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_FORMATS = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const UPLOADED_IMAGE_PATTERN =
  /^\/uploads\/image\/[a-f0-9]{32}\.(jpg|png|webp)$/i;

// ========================================
// VALIDATE IMAGE URL
// ========================================

const isValidImageUrl = (value) => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());

    return (
      ["http:", "https:"].includes(
        url.protocol
      ) &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

// ========================================
// REUSABLE PROFILE IMAGE FIELD
// ========================================

const ProfileImageField = ({
  field,
  label,
  mode,
  value,
  file,
  preview,
  imageError,
  disabled,
  onModeChange,
  onUrlChange,
  onFileSelect,
  onImageError,
}) => {
  const isCover = field === "coverPhoto";

  return (
    <div className="space-y-3">

      {/* LABEL */}
      <label className="block text-sm font-semibold text-gray-300">
        {label}
      </label>

      {/* URL / UPLOAD OPTIONS */}
      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onModeChange(field, "upload")
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
            mode === "upload"
              ? "bg-indigo-600 text-white"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FiUploadCloud size={16} />
          Upload Image
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onModeChange(field, "url")
          }
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
            mode === "url"
              ? "bg-indigo-600 text-white"
              : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <FiLink size={16} />
          Use URL
        </button>

      </div>

      {/* UPLOAD FROM COMPUTER */}
      {mode === "upload" ? (
        <div className="rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4">

          <div className="flex items-center gap-3 mb-3">
            <FiImage
              size={23}
              className="text-indigo-400"
            />

            <div>
              <p className="text-sm font-medium text-white">
                Choose {label}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG or WebP — Maximum 5 MB
              </p>
            </div>
          </div>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            disabled={disabled}
            onChange={(event) => {
              const selectedFile =
                event.target.files?.[0];

              if (selectedFile) {
                onFileSelect(
                  field,
                  selectedFile
                );
              }

              // Allow selecting same file again
              event.target.value = "";
            }}
            className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:cursor-pointer disabled:opacity-50"
          />

          {file && (
            <p className="mt-3 text-xs text-emerald-300 break-all">
              Selected: {file.name}
            </p>
          )}
        </div>
      ) : (

        /* EXISTING URL OPTION */
        <input
          type="url"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onUrlChange(
              field,
              event.target.value
            )
          }
          placeholder="https://example.com/image.jpg"
          aria-label={`${label} URL`}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
        />

      )}

      {/* IMAGE PREVIEW */}
      {preview &&
        (preview.startsWith("blob:") ||
          isValidImageUrl(preview)) && (

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">

            {imageError ? (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <FiAlertCircle />
                Image could not be loaded.
              </div>
            ) : (
              <img
                key={preview}
                src={preview}
                alt={`${label} preview`}
                onError={() =>
                  onImageError(field)
                }
                className={
                  isCover
                    ? "w-full h-36 rounded-xl object-cover"
                    : "w-24 h-24 rounded-full border-2 border-indigo-500 object-cover"
                }
              />
            )}

            {!imageError && (
              <p className="mt-2 text-xs text-gray-400">
                {file
                  ? "Selected Image Preview"
                  : "Current Image Preview"}
              </p>
            )}

          </div>
        )}

      {/* KEEP EXISTING IMAGE */}
      {mode === "upload" && !file && (
        <p className="text-xs text-gray-500">
          No new file selected. Your current
          image will remain unchanged.
        </p>
      )}

    </div>
  );
};

// ========================================
// PROFILE EDIT FORM
// ========================================

const ProfileEditForm = ({
  user,
  setUser,
  onClose,
}) => {
  const { setUser: setAuthUser } =
    useContext(AuthContext);

  // Existing profile fields
  const [formData, setFormData] =
    useState({
      name: user?.name || "",
      bio: user?.bio || "",
      profilePicture:
        user?.profilePicture || "",
      coverPhoto:
        user?.coverPhoto || "",
      skills: Array.isArray(user?.skills)
        ? user.skills.join(", ")
        : "",
    });

  // Default to existing URL mode
  const [imageModes, setImageModes] =
    useState({
      profilePicture: "url",
      coverPhoto: "url",
    });

  // Selected local files
  const [selectedFiles, setSelectedFiles] =
    useState({
      profilePicture: null,
      coverPhoto: null,
    });

  // Temporary browser previews
  const [localPreviews, setLocalPreviews] =
    useState({
      profilePicture: "",
      coverPhoto: "",
    });

  const previewUrlsRef = useRef({});

  // Image preview errors
  const [imageErrors, setImageErrors] =
    useState({
      profilePicture: false,
      coverPhoto: false,
    });

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);


  // ========================================
  // CLEAN UP TEMPORARY PREVIEW URLS

  useEffect(() => {
      // Keep a stable reference for cleanup
      const previewUrls = previewUrlsRef.current;

      return () => {
        Object.values(previewUrls).forEach((url) => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        });
      };
  }, []);


  // ========================================
  // NORMAL INPUT CHANGE

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // CHANGE IMAGE URL

  const handleImageUrlChange = (
    field,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setImageErrors((previous) => ({
      ...previous,
      [field]: false,
    }));
  };

  // ========================================
  // CLEAR SELECTED FILE

  const clearSelectedFile = (field) => {
    const oldUrl =
      previewUrlsRef.current[field];

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
      delete previewUrlsRef.current[field];
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [field]: null,
    }));

    setLocalPreviews((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // ========================================
  // SWITCH URL / UPLOAD MODE

  const handleImageModeChange = (
    field,
    mode
  ) => {
    if (loading) return;

    if (mode === "url") {
      clearSelectedFile(field);
    }

    setImageModes((previous) => ({
      ...previous,
      [field]: mode,
    }));

    setImageErrors((previous) => ({
      ...previous,
      [field]: false,
    }));
  };

  // ========================================
  // VALIDATE & PREVIEW SELECTED FILE
  // ========================================

  const handleImageSelect = (
    field,
    file
  ) => {
    if (loading) return;

    const extension =
      "." +
      (file.name.split(".").pop() || "")
        .toLowerCase();

    const validExtensions =
      IMAGE_FORMATS[file.type];

    if (
      !validExtensions ||
      !validExtensions.includes(extension)
    ) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed."
      );
      return;
    }

    if (file.size === 0) {
      toast.error(
        "Cannot upload an empty image."
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        "Image must be 5 MB or smaller."
      );
      return;
    }

    // Revoke the previous local preview
    const oldUrl =
      previewUrlsRef.current[field];

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlsRef.current[field] =
      previewUrl;

    setSelectedFiles((previous) => ({
      ...previous,
      [field]: file,
    }));

    setLocalPreviews((previous) => ({
      ...previous,
      [field]: previewUrl,
    }));

    setImageErrors((previous) => ({
      ...previous,
      [field]: false,
    }));
  };

  // ========================================
  // ACTUAL IMAGE UPLOAD
  // ========================================

  const uploadProfileImage = async (
    file,
    label
  ) => {
    const uploadData = new FormData();

    uploadData.append("file", file);

    setUploadStatus(
      `Uploading ${label}...`
    );

    setUploadProgress(0);

    const { data } = await api.post(
      "/uploads/image",
      uploadData,
      {
        onUploadProgress: (event) => {
          if (!event.total) return;

          const percent = Math.round(
            (event.loaded * 100) /
              event.total
          );

          setUploadProgress(
            Math.min(percent, 100)
          );
        },
      }
    );

    const filePath = data?.filePath;

    // Verify response from Upload API
    if (
      typeof filePath !== "string" ||
      !UPLOADED_IMAGE_PATTERN.test(
        filePath
      )
    ) {
      throw new Error(
        "Upload API returned an invalid image path."
      );
    }

    // Convert /uploads/image/... to
    // http://localhost:5001/uploads/image/...
    return new URL(
      filePath,
      api.defaults.baseURL
    ).href;
  };

  // ========================================
  // SYNC AUTH CONTEXT & LOCALSTORAGE
  // ========================================

  const syncCurrentUser = (
    updatedUser
  ) => {
    // Preserve login token and stored structure.
    const stored = JSON.parse(
      localStorage.getItem("userInfo") ||
        "null"
    );

    if (!stored || typeof stored !== "object") {
      return;
    }

    const nextAuthUser =
      stored.user &&
      typeof stored.user === "object"
        ? {
            ...stored,
            user: {
              ...stored.user,
              ...updatedUser,
            },
          }
        : {
            ...stored,
            ...updatedUser,
          };

    localStorage.setItem(
      "userInfo",
      JSON.stringify(nextAuthUser)
    );

    setAuthUser(nextAuthUser);
  };

  // ========================================
  // SAVE PROFILE

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const name =
      formData.name.trim();

    const bio =
      formData.bio.trim();

    if (!name) {
      toast.error("Name is required.");
      return;
    }

    if (bio.length > 300) {
      toast.error(
        "Bio must be within 300 characters."
      );
      return;
    }

    // Validate URL fields
    for (const field of [
      "profilePicture",
      "coverPhoto",
    ]) {
      if (
        !isValidImageUrl(
          formData[field]
        )
      ) {
        toast.error(
          `Enter a valid ${
            field === "profilePicture"
              ? "Profile Picture"
              : "Cover Photo"
          } URL.`
        );
        return;
      }

      // Existing URL preview validation
      if (
        imageModes[field] === "url" &&
        formData[field].trim() &&
        imageErrors[field]
      ) {
        toast.error(
          "Please use accessible image URLs."
        );
        return;
      }
    }

    try {
      setLoading(true);
      setUploadStatus("");

      // Preserve existing image values.
      let profilePicture =
        formData.profilePicture.trim();

      let coverPhoto =
        formData.coverPhoto.trim();

      // Upload new Profile Picture if selected
      if (selectedFiles.profilePicture) {
        profilePicture =
          await uploadProfileImage(
            selectedFiles.profilePicture,
            "Profile Picture"
          );
      }

      // Upload new Cover Photo if selected
      if (selectedFiles.coverPhoto) {
        coverPhoto =
          await uploadProfileImage(
            selectedFiles.coverPhoto,
            "Cover Photo"
          );
      }

      // Update user profile using existing API
      setUploadStatus(
        "Saving Profile Changes..."
      );

      const payload = {
        name,
        bio,
        profilePicture,
        coverPhoto,
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
        throw new Error(
          "Updated user data was not returned."
        );
      }

      // Never store password hash in browser.
      const updatedUser = {
        ...data.user,
      };

      delete updatedUser.password;

      // Update Profile page immediately
      setUser(updatedUser);

      // Keep Navbar/Authentication state updated
      syncCurrentUser(updatedUser);

      toast.success(
        "Profile updated successfully!"
      );

      onClose();

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile."
      );

    } finally {
      setLoading(false);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  // ========================================
  // RENDER EDIT PROFILE FORM

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1120] shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
    >

      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0B1120] px-6 py-4">

        <h2 className="text-xl font-bold text-white">
          Edit Profile
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          <FiX size={22} />
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
      >

        {/* FULL NAME */}
        <div>
          <label
            htmlFor="edit-name"
            className="mb-2 block text-sm text-gray-400"
          >
            Full Name
          </label>

          <input
            id="edit-name"
            type="text"
            name="name"
            required
            disabled={loading}
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </div>

        {/* BIO */}
        <div>
          <label
            htmlFor="edit-bio"
            className="mb-2 block text-sm text-gray-400"
          >
            Bio
          </label>

          <textarea
            id="edit-bio"
            name="bio"
            rows={3}
            maxLength={300}
            disabled={loading}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell others about yourself..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
          />

          <p className="mt-1 text-right text-xs text-gray-500">
            {formData.bio.length}/300
          </p>
        </div>

        {/* PROFILE PICTURE */}
        <ProfileImageField
          field="profilePicture"
          label="Profile Picture"
          mode={imageModes.profilePicture}
          value={formData.profilePicture}
          file={selectedFiles.profilePicture}
          preview={
            localPreviews.profilePicture ||
            formData.profilePicture
          }
          imageError={imageErrors.profilePicture}
          disabled={loading}
          onModeChange={handleImageModeChange}
          onUrlChange={handleImageUrlChange}
          onFileSelect={handleImageSelect}
          onImageError={(field) =>
            setImageErrors((previous) => ({
              ...previous,
              [field]: true,
            }))
          }
        />

        {/* COVER PHOTO */}
        <ProfileImageField
          field="coverPhoto"
          label="Cover Photo"
          mode={imageModes.coverPhoto}
          value={formData.coverPhoto}
          file={selectedFiles.coverPhoto}
          preview={
            localPreviews.coverPhoto ||
            formData.coverPhoto
          }
          imageError={imageErrors.coverPhoto}
          disabled={loading}
          onModeChange={handleImageModeChange}
          onUrlChange={handleImageUrlChange}
          onFileSelect={handleImageSelect}
          onImageError={(field) =>
            setImageErrors((previous) => ({
              ...previous,
              [field]: true,
            }))
          }
        />

        {/* SKILLS */}
        <div>
          <label
            htmlFor="edit-skills"
            className="mb-2 block text-sm text-gray-400"
          >
            Skills
          </label>

          <input
            id="edit-skills"
            type="text"
            name="skills"
            disabled={loading}
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
          />

          <p className="mt-1 text-xs text-gray-500">
            Separate skills using commas.
          </p>
        </div>

        {/* UPLOAD PROGRESS */}
        {loading && uploadStatus && (
          <div
            role="status"
            className="space-y-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-indigo-300">
              <FiLoader className="animate-spin" />
              {uploadStatus}
            </div>

            {uploadStatus.startsWith(
              "Uploading"
            ) && (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                <p className="text-right text-xs text-indigo-300">
                  {uploadProgress}%
                </p>
              </>
            )}
          </div>
        )}

        {/* SAVE BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 py-3 font-semibold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
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

// ========================================
// MODAL WRAPPER
// ========================================

const EditProfileModal = ({
  user,
  setUser,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) {
    return null;
  }

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
