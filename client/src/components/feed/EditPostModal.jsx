
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiEdit2,
  FiImage,
  FiVideo,
  FiTrash2,
  FiX,
  FiSave,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";

// ========================================
// MEDIA CONFIGURATION
// Same rules as CreatePost
// ========================================

const MB = 1024 * 1024;

const MEDIA_CONFIG = {
  image: {
    maxSize: 5 * MB,
    formats: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    pathPattern:
      /^\/uploads\/image\/[a-f0-9]{32}\.(jpg|png|webp)$/i,
  },

  video: {
    maxSize: 25 * MB,
    formats: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
    },
    pathPattern:
      /^\/uploads\/video\/[a-f0-9]{32}\.(mp4|webm)$/i,
  },
};

// ========================================
// GET EXISTING POST MEDIA
// ========================================

const getInitialMedia = (post) => {
  if (post?.video) {
    return {
      type: "video",
      preview: post.video,
    };
  }

  if (post?.image) {
    return {
      type: "image",
      preview: post.image,
    };
  }

  return {
    type: "",
    preview: "",
  };
};

// ========================================
// EDIT POST MODAL
// ========================================

const EditPostModal = ({
  post,
  isOpen,
  onClose,
  onUpdated,
}) => {
  // --------------------------------------
  // ORIGINAL POST INFORMATION
  // --------------------------------------

  const [content, setContent] = useState(
    () => post?.content || ""
  );

  const [initialMedia] = useState(
    () => getInitialMedia(post)
  );

  const [mediaType, setMediaType] = useState(
    initialMedia.type
  );

  const [mediaPreview, setMediaPreview] =
    useState(initialMedia.preview);

  const [mediaFile, setMediaFile] =
    useState(null);

  // --------------------------------------
  // UPLOAD / SAVE STATE
  // --------------------------------------

  const [saving, setSaving] = useState(false);

  const [uploadStage, setUploadStage] =
    useState("");

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  // --------------------------------------
  // FILE INPUT REFS
  // --------------------------------------

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const previewUrlRef = useRef("");

  // ======================================
  // CLEAN UP LOCAL PREVIEW URL
  // ======================================

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );

        previewUrlRef.current = "";
      }
    };
  }, []);

  // ======================================
  // CLOSE MODAL WITH ESCAPE
  // ======================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, saving, onClose]);

  // ======================================
  // REMOVE CURRENT LOCAL PREVIEW
  // ======================================

  const clearLocalPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = "";
    }
  };

  // ======================================
  // SELECT REPLACEMENT MEDIA
  // ======================================

  const handleMediaSelect = (
    event,
    kind
  ) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file || saving) return;

    const config = MEDIA_CONFIG[kind];

    if (!config) return;

    const allowedExtensions =
      config.formats[file.type];

    const extension =
      "." +
      (file.name.split(".").pop() || "")
        .toLowerCase();

    // ------------------------------------
    // FILE TYPE VALIDATION
    // ------------------------------------

    if (
      !allowedExtensions ||
      !allowedExtensions.includes(extension)
    ) {
      const message =
        kind === "image"
          ? "Only JPG, PNG and WebP images are allowed."
          : "Only MP4 and WebM videos are allowed.";

      setErrorMessage(message);
      toast.error(message);
      return;
    }

    // ------------------------------------
    // EMPTY FILE VALIDATION
    // ------------------------------------

    if (file.size === 0) {
      setErrorMessage(
        "Cannot upload an empty file."
      );

      return;
    }

    // ------------------------------------
    // MAXIMUM FILE SIZE
    // ------------------------------------

    if (file.size > config.maxSize) {
      const message =
        kind === "image"
          ? "Image must be 5 MB or smaller."
          : "Video must be 25 MB or smaller.";

      setErrorMessage(message);
      toast.error(message);
      return;
    }

    // ------------------------------------
    // CREATE NEW PREVIEW
    // ------------------------------------

    clearLocalPreview();

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setMediaFile(file);
    setMediaType(kind);
    setMediaPreview(previewUrl);

    setUploadProgress(0);
    setErrorMessage("");
  };

  // ======================================
  // REMOVE IMAGE / VIDEO
  // ======================================

  const handleRemoveMedia = () => {
    if (saving) return;

    clearLocalPreview();

    setMediaFile(null);
    setMediaType("");
    setMediaPreview("");

    setUploadProgress(0);
    setErrorMessage("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // ======================================
  // UPLOAD REPLACEMENT MEDIA
  // ======================================

  const uploadMedia = async (
    file,
    kind
  ) => {
    const config = MEDIA_CONFIG[kind];

    if (!config) {
      throw new Error(
        "Invalid media category."
      );
    }

    const formData = new FormData();

    formData.append("file", file);

    setUploadStage("uploading");
    setUploadProgress(0);

    // Existing secure upload endpoint.
    const { data } = await api.post(
      `/uploads/${kind}`,
      formData,
      {
        onUploadProgress: (event) => {
          if (!event.total) return;

          const percentage = Math.round(
            (event.loaded * 100) /
              event.total
          );

          setUploadProgress(
            Math.min(percentage, 100)
          );
        },
      }
    );

    const filePath = data?.filePath;

    // Validate upload API response.
    if (
      typeof filePath !== "string" ||
      !config.pathPattern.test(filePath)
    ) {
      throw new Error(
        "Upload API returned an invalid file path."
      );
    }

    // Convert relative upload path
    // to persistent Backend URL.

    const backendBase = new URL(
      api.defaults.baseURL || "/",
      window.location.origin
    );

    return new URL(
      filePath,
      backendBase.origin
    ).href;
  };

  // ======================================
  // SAVE EDITED POST
  // ======================================

  const handleSaveChanges = async (
    event
  ) => {
    event.preventDefault();

    if (saving || !post?._id) return;

    const trimmedContent =
      content.trim();

    // ------------------------------------
    // CONTENT VALIDATION
    // ------------------------------------

    if (!trimmedContent) {
      const message =
        "Post content cannot be empty.";

      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      // ----------------------------------
      // EXISTING OR NEW MEDIA
      // ----------------------------------

      let imageUrl =
        mediaType === "image"
          ? mediaPreview
          : "";

      let videoUrl =
        mediaType === "video"
          ? mediaPreview
          : "";

      // ----------------------------------
      // UPLOAD REPLACEMENT FILE
      // ----------------------------------

      if (mediaFile && mediaType) {
        const uploadedUrl =
          await uploadMedia(
            mediaFile,
            mediaType
          );

        if (mediaType === "image") {
          imageUrl = uploadedUrl;
          videoUrl = "";
        }

        if (mediaType === "video") {
          videoUrl = uploadedUrl;
          imageUrl = "";
        }
      }

      // ----------------------------------
      // UPDATE POST IN MONGODB
      // ----------------------------------

      setUploadStage("saving");

      const { data } = await api.put(
        `/posts/${post._id}`,
        {
          content: trimmedContent,
          image: imageUrl,
          video: videoUrl,
        }
      );

      // Backend returns:
      // { message, post }

      if (!data?.post?._id) {
        throw new Error(
          "Updated post was not returned."
        );
      }

      // ----------------------------------
      // NOTIFY PARENT COMPONENT
      // ----------------------------------

      if (onUpdated) {
        onUpdated(data.post);
      }

      toast.success(
        "Post updated successfully!"
      );

      // ----------------------------------
      // CLOSE MODAL
      // ----------------------------------

      onClose?.();

    } catch (error) {
      console.error(
        "Edit Post Error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update post.";

      setErrorMessage(message);

      toast.error(message);

      // Keep edited content and selected
      // media so the user can retry.

    } finally {
      setSaving(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  // ======================================
  // MODAL VISIBILITY
  // ======================================

  if (!isOpen || !post) {
    return null;
  }

  // ======================================
  // RENDER EDIT MODAL
  // ======================================

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B1120] border border-white/10 shadow-[0_25px_100px_rgba(0,0,0,0.65)]"
      >

        {/* ==================================
            MODAL HEADER
        ================================== */}

        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-white/10 bg-[#0B1120]">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <FiEdit2 size={20} />
            </div>

            <div>
              <h2
                id="edit-post-title"
                className="text-xl font-bold text-white"
              >
                Edit Post
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Update your community post
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={saving}
            aria-label="Close edit post modal"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <FiX size={22} />
          </button>

        </div>

        {/* ==================================
            EDIT POST FORM
        ================================== */}

        <form
          onSubmit={handleSaveChanges}
          className="p-5 sm:p-6 space-y-5"
        >

          {/* ==================================
              POST CONTENT
          ================================== */}

          <div className="space-y-2">

            <label
              htmlFor="edit-post-content"
              className="block text-sm font-semibold text-gray-300"
            >
              Post Content
            </label>

            <textarea
              id="edit-post-content"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setErrorMessage("");
              }}
              disabled={saving}
              rows={5}
              maxLength={10000}
              placeholder="Edit your post..."
              className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-500 resize-none outline-none focus:border-indigo-500/50 transition-all leading-7 disabled:opacity-60"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Share your ideas with the community
              </span>

              <span>
                {content.length}/10000
              </span>
            </div>

          </div>

          {/* ==================================
              MEDIA SECTION
          ================================== */}

          <div className="space-y-3">

            <p className="text-sm font-semibold text-gray-300">
              Post Attachment
            </p>

            {/* EXISTING / SELECTED IMAGE */}

            {mediaType === "image" &&
              mediaPreview && (

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111827]">

                  <img
                    src={mediaPreview}
                    alt="Post image preview"
                    className="w-full max-h-72 object-contain"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    disabled={saving}
                    aria-label="Remove post image"
                    className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <FiTrash2 size={15} />
                    Remove
                  </button>

                </div>
              )}

            {/* EXISTING / SELECTED VIDEO */}

            {mediaType === "video" &&
              mediaPreview && (

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">

                  <video
                    key={mediaPreview}
                    src={mediaPreview}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label="Post video preview"
                    className="w-full max-h-72 object-contain"
                  >
                    Your browser does not support
                    video playback.
                  </video>

                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    disabled={saving}
                    aria-label="Remove post video"
                    className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <FiTrash2 size={15} />
                    Remove
                  </button>

                </div>
              )}

            {/* NO ATTACHMENT */}

            {!mediaType && (

              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/3 py-8 text-gray-500">
                <FiImage size={27} />

                <p className="text-sm">
                  No image or video attached
                </p>
              </div>
            )}

            {/* ==================================
                REPLACE / ADD MEDIA
            ================================== */}

            <div className="flex flex-wrap gap-3">

              {/* IMAGE */}

              <label
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-all ${
                  saving
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"
                }`}
              >
                <FiImage size={18} />

                {mediaType === "image"
                  ? "Replace Image"
                  : "Add Image"}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  hidden
                  disabled={saving}
                  onChange={(event) =>
                    handleMediaSelect(
                      event,
                      "image"
                    )
                  }
                />
              </label>

              {/* VIDEO */}

              <label
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-all ${
                  saving
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300"
                }`}
              >
                <FiVideo size={18} />

                {mediaType === "video"
                  ? "Replace Video"
                  : "Add Video"}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept=".mp4,.webm"
                  hidden
                  disabled={saving}
                  onChange={(event) =>
                    handleMediaSelect(
                      event,
                      "video"
                    )
                  }
                />
              </label>

            </div>

            {/* SELECTED NEW FILE */}

            {mediaFile && (

              <p className="text-xs text-indigo-300 break-all">
                Selected: {mediaFile.name}
              </p>

            )}

            <p className="text-xs text-gray-500">
              One attachment per post. Image: maximum
              5 MB. Video: maximum 25 MB.
            </p>

          </div>

          {/* ==================================
              UPLOAD PROGRESS
          ================================== */}

          {saving &&
            uploadStage === "uploading" && (

              <div className="space-y-2">

                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">

                  <span>
                    Uploading replacement{" "}
                    {mediaType === "video"
                      ? "video"
                      : "image"}...
                  </span>

                  <span>
                    {uploadProgress}%
                  </span>

                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-200"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />

                </div>

              </div>
            )}

          {/* ==================================
              ERROR MESSAGE
          ================================== */}

          {errorMessage && (

            <p
              role="alert"
              className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
            >
              {errorMessage}
            </p>

          )}

          {/* ==================================
              FOOTER ACTIONS
          ================================== */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">

            {/* CANCEL */}

            <button
              type="button"
              onClick={() => onClose?.()}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 border border-white/10 bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            {/* SAVE CHANGES */}

            <button
              type="submit"
              disabled={
                saving ||
                !content.trim()
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all ${
                saving || !content.trim()
                  ? "bg-indigo-500/40 cursor-not-allowed opacity-70"
                  : "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02]"
              }`}
            >

              {saving ? (

                <>
                  <FiLoader
                    size={18}
                    className="animate-spin"
                  />

                  {uploadStage === "uploading"
                    ? "Uploading..."
                    : "Saving..."}
                </>

              ) : (

                <>
                  <FiSave size={18} />
                  Save Changes
                </>

              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EditPostModal;
