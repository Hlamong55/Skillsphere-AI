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
// IMAGE CONFIGURATION

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ========================================
// CREATE POST

const CreatePost = ({
  fetchPosts,
  addNewPost,
}) => {

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  // ========================================
  // CLEAN UP BROWSER PREVIEW URL

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, []);

  // ========================================
  // REMOVE SELECTED IMAGE

  const removeImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = "";
    }

    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ========================================
  // SELECT & VALIDATE IMAGE

  const handleImage = (event) => {
    if (loading) return;

    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        "Image must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      toast.error(
        "Cannot upload an empty image."
      );

      event.target.value = "";
      return;
    }

    // Revoke previous preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    // Temporary preview only.
    // This URL will NOT be saved in MongoDB.
    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreview(previewUrl);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // ========================================
  // UPLOAD IMAGE TO SERVER

  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    setUploadStage("uploading");
    setUploadProgress(0);

    const { data } = await api.post(
      "/uploads/image",
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setUploadProgress(
            Math.min(percent, 100)
          );
        },
      }
    );

    // Backend returns:
    // /uploads/image/randomfilename.jpg
    const filePath = data?.filePath;

    if (
      typeof filePath !== "string" ||
      !/^\/uploads\/image\/[a-f0-9]{32}\.(jpg|png|webp)$/i.test(
        filePath
      )
    ) {
      throw new Error(
        "Upload API returned an invalid image path."
      );
    }

    // Convert backend-relative path into full URL.
    // Example:
    // http://localhost:5001/uploads/image/...
    //
    // This keeps existing PostCard and
    // UserPosts rendering compatible.
    const fullImageUrl = new URL(
      filePath,
      api.defaults.baseURL
    ).href;

    return fullImageUrl;
  };

  // ========================================
  // CREATE POST

  const handleCreatePost = async () => {
    if (loading) return;

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      toast.error("Write something first");
      return;
    }

    try {
      setLoading(true);

      let uploadedImageUrl = "";

      // Step 1: Upload actual image
      if (imageFile) {
        uploadedImageUrl = await uploadImage(
          imageFile
        );
      }

      // Step 2: Save post in MongoDB
      setUploadStage("posting");

      const { data } = await api.post(
        "/posts",
        {
          content: trimmedContent,
          image: uploadedImageUrl,
        }
      );

      toast.success(
        "Post created successfully!"
      );

      // Keep existing instant UI update
      if (addNewPost) {
        addNewPost(data);
      }

      // Reset form
      setContent("");
      removeImage();

      // Keep existing optional refresh
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

      // Keep content and selected image
      // so the user can retry.

    } finally {
      setLoading(false);
      setUploadStage("");
      setUploadProgress(0);
    }
  };

  // ========================================
  // ENTER TO SUBMIT

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
          {imagePreview && (
            <div className="relative">

              <img
                src={imagePreview}
                alt="Selected post image preview"
                className="w-full max-h-105 object-cover rounded-2xl border border-white/10"
              />

              {/* REMOVE IMAGE */}
              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                aria-label="Remove selected image"
                className="absolute top-3 right-3 bg-black/60 hover:bg-red-500 transition-all duration-300 p-2.5 rounded-full text-white disabled:opacity-50"
              >
                <FiX size={18} />
              </button>

              <p className="text-xs text-gray-400 mt-2">
                {imageFile?.name}
              </p>

            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {loading &&
            uploadStage === "uploading" && (
              <div className="space-y-2">

                <div className="flex items-center justify-between gap-3 text-xs text-indigo-300">
                  <span>
                    Uploading Image...
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

              {/* IMAGE SELECT */}
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
                  ref={fileInputRef}
                  type="file"
                  hidden
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImage}
                />
              </label>

              {/* VIDEO COMING IN STEP 13.3 */}
              <button
                type="button"
                disabled
                title="Video upload will be added in Step 13.3"
                className="flex items-center gap-2 bg-white/3 border border-white/10 px-3 py-1.5 rounded-xl text-gray-400 opacity-50 cursor-not-allowed"
              >
                <FiVideo size={18} />

                <span className="text-sm">
                  Video
                </span>
              </button>

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
