
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiImage,
  FiVideo,
  FiX,
  FiSend,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";

// ========================================
// MEDIA UPLOAD CONFIGURATION
// ========================================

const MB = 1024 * 1024;

const MEDIA_CONFIG = {
  image: {
    maxSize: 5 * MB,
    label: "Image",
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
    label: "Video",
    formats: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
    },
    pathPattern:
      /^\/uploads\/video\/[a-f0-9]{32}\.(mp4|webm)$/i,
  },
};

// ========================================
// CREATE POST
// ========================================

const CreatePost = ({
  fetchPosts,
  addNewPost,
}) => {
  const [content, setContent] = useState("");

  // Only one attachment per post:
  // image OR video
  const [mediaFile, setMediaFile] =
    useState(null);

  const [mediaType, setMediaType] =
    useState("");

  const [mediaPreview, setMediaPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [uploadStage, setUploadStage] =
    useState("");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const previewUrlRef = useRef("");

  // ========================================
  // CLEAN UP PREVIEW ON UNMOUNT
  // ========================================

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

  // ========================================
  // REMOVE SELECTED MEDIA
  // ========================================

  const removeMedia = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = "";
    }

    setMediaFile(null);
    setMediaType("");
    setMediaPreview("");
    setUploadProgress(0);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // ========================================
  // SELECT IMAGE OR VIDEO
  // ========================================

  const handleMediaSelect = (
    event,
    kind
  ) => {
    const file = event.target.files?.[0];

    // Allow the same file to be selected again
    event.target.value = "";

    if (!file || loading) return;

    const config = MEDIA_CONFIG[kind];

    if (!config) return;

    // Validate MIME type and file extension
    const allowedExtensions =
      config.formats[file.type];

    const extension =
      "." +
      (file.name.split(".").pop() || "")
        .toLowerCase();

    if (
      !allowedExtensions ||
      !allowedExtensions.includes(extension)
    ) {
      toast.error(
        kind === "image"
          ? "Only JPG, PNG and WebP images are allowed."
          : "Only MP4 and WebM videos are allowed."
      );

      return;
    }

    // Empty file validation
    if (file.size === 0) {
      toast.error(
        "Cannot upload an empty file."
      );
      return;
    }

    // Maximum file size
    if (file.size > config.maxSize) {
      toast.error(
        kind === "image"
          ? "Image must be 5 MB or smaller."
          : "Video must be 25 MB or smaller."
      );

      return;
    }

    // Remove old preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    // Browser-only preview
    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setMediaFile(file);
    setMediaType(kind);
    setMediaPreview(previewUrl);
    setUploadProgress(0);
  };

  // ========================================
  // UPLOAD MEDIA TO BACKEND
  // ========================================

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

    // Existing secure Upload API
    const { data } = await api.post(
      `/uploads/${kind}`,
      formData,
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

    // Validate response from Upload API
    if (
      typeof filePath !== "string" ||
      !config.pathPattern.test(filePath)
    ) {
      throw new Error(
        "Upload API returned an invalid file path."
      );
    }

    // Convert relative path into full URL
    //
    // Example:
    // http://localhost:5001/uploads/video/abc.mp4
    //
    // This is a persistent server URL,
    // not a temporary blob: URL.
    return new URL(
      filePath,
      api.defaults.baseURL
    ).href;
  };

  // ========================================
  // CREATE POST
  // ========================================

  const handleCreatePost = async () => {
    if (loading) return;

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      toast.error(
        "Write something first"
      );
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";
      let videoUrl = "";

      // Step 1: Upload selected attachment
      if (mediaFile && mediaType) {
        const uploadedUrl =
          await uploadMedia(
            mediaFile,
            mediaType
          );

        if (mediaType === "image") {
          imageUrl = uploadedUrl;
        }

        if (mediaType === "video") {
          videoUrl = uploadedUrl;
        }
      }

      // Step 2: Save Post to MongoDB
      setUploadStage("posting");

      const { data } = await api.post(
        "/posts",
        {
          content: trimmedContent,
          image: imageUrl,
          video: videoUrl,
        }
      );

      toast.success(
        "Post created successfully!"
      );

      // Existing instant UI update
      if (addNewPost) {
        addNewPost(data);
      }

      // Reset form after successful post
      setContent("");
      removeMedia();

      // Existing optional refresh
      if (fetchPosts) {
        fetchPosts();
      }

    } catch (error) {
      console.error(
        "Create Post Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create post."
      );

      // Keep content and selected file
      // so the user can retry.

    } finally {
      setLoading(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  // ========================================
  // ENTER TO SUBMIT
  // ========================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleCreatePost();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="bg-white/3 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_10px_60px_rgba(0,0,0,0.45)]">

      <div className="flex items-start gap-4">

        {/* AVATAR */}
        <div className="w-12 h-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shrink-0" />

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* TEXTAREA */}
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Share your ideas with the AI community..."
            rows={4}
            className="w-full bg-[#0B1120] border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-500 resize-none outline-none focus:border-indigo-500/40 transition-all duration-300 leading-7 disabled:opacity-60"
          />

          {/* IMAGE PREVIEW */}
          {mediaType === "image" &&
            mediaPreview && (
              <div className="relative">

                <img
                  src={mediaPreview}
                  alt="Selected post image preview"
                  className="w-full max-h-105 object-cover rounded-2xl border border-white/10"
                />

                {/* REMOVE IMAGE */}
                <button
                  type="button"
                  onClick={removeMedia}
                  disabled={loading}
                  aria-label="Remove selected image"
                  className="absolute top-3 right-3 bg-black/60 hover:bg-red-500 transition-all duration-300 p-2.5 rounded-full text-white disabled:opacity-50"
                >
                  <FiX size={18} />
                </button>

                <p className="mt-2 text-xs text-gray-400 break-all">
                  {mediaFile?.name}
                </p>

              </div>
            )}

          {/* VIDEO PREVIEW */}
          {mediaType === "video" &&
            mediaPreview && (
              <div className="relative">

                <video
                  src={mediaPreview}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-105 rounded-2xl border border-white/10 bg-black"
                >
                  Your browser does not
                  support video playback.
                </video>

                {/* REMOVE VIDEO */}
                <button
                  type="button"
                  onClick={removeMedia}
                  disabled={loading}
                  aria-label="Remove selected video"
                  className="absolute top-3 right-3 bg-black/70 hover:bg-red-500 transition-all duration-300 p-2.5 rounded-full text-white disabled:opacity-50"
                >
                  <FiX size={18} />
                </button>

                <p className="mt-2 text-xs text-gray-400 break-all">
                  {mediaFile?.name}
                </p>

              </div>
            )}

          {/* UPLOAD PROGRESS */}
          {loading &&
            uploadStage === "uploading" && (
              <div className="space-y-2">

                <div className="flex items-center justify-between gap-3 text-xs text-indigo-300">
                  <span>
                    Uploading{" "}
                    {mediaType === "video"
                      ? "Video"
                      : "Image"}...
                  </span>

                  <span>
                    {uploadProgress}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">

                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-200"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />

                </div>

              </div>
            )}

          {/* BOTTOM ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* MEDIA BUTTONS */}
            <div className="flex items-center gap-3">

              {/* IMAGE BUTTON */}
              <label
                className={`flex items-center gap-2 bg-white/3 border border-white/10 px-3 py-1.5 rounded-xl transition-all duration-300 text-gray-300 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-white/6 hover:text-white cursor-pointer"
                }`}
              >
                <FiImage size={18} />

                <span className="text-sm">
                  Image
                </span>

                <input
                  ref={imageInputRef}
                  type="file"
                  hidden
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(event) =>
                    handleMediaSelect(
                      event,
                      "image"
                    )
                  }
                />
              </label>

              {/* VIDEO BUTTON */}
              <label
                className={`flex items-center gap-2 bg-white/3 border border-white/10 px-3 py-1.5 rounded-xl transition-all duration-300 text-gray-300 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-white/6 hover:text-white cursor-pointer"
                }`}
              >
                <FiVideo size={18} />

                <span className="text-sm">
                  Video
                </span>

                <input
                  ref={videoInputRef}
                  type="file"
                  hidden
                  disabled={loading}
                  accept=".mp4,.webm"
                  onChange={(event) =>
                    handleMediaSelect(
                      event,
                      "video"
                    )
                  }
                />
              </label>

            </div>

            {/* CREATE POST BUTTON */}
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={
                loading ||
                !content.trim()
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.25)] ${
                loading || !content.trim()
                  ? "bg-linear-to-r from-indigo-500/50 to-purple-500/50 text-white/70 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <FiLoader
                    size={17}
                    className="animate-spin"
                  />

                  {uploadStage === "uploading"
                    ? "Uploading..."
                    : "Posting..."}
                </>
              ) : (
                <>
                  <FiSend size={17} />
                  Create Post
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePost;
