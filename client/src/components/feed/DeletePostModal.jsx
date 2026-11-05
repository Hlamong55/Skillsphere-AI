
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiAlertTriangle,
  FiTrash2,
  FiX,
  FiLoader,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";

// ========================================
// DELETE POST MODAL
// ========================================

// Props:
// post      - Post selected for deletion
// isOpen    - Modal visibility
// onClose   - Close without deleting
// onDeleted - Notify parent after success
//
// The backend enforces post ownership.
// PostCard will display this modal
// only for the logged-in post owner.

const DeletePostModal = ({
  post,
  isOpen,
  onClose,
  onDeleted,
}) => {
  // ======================================
  // STATE
  // ======================================

  const [deleting, setDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const cancelButtonRef = useRef(null);

  // ======================================
  // FOCUS CANCEL BUTTON
  // ======================================

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  // ======================================
  // ESCAPE KEY HANDLING
  // ======================================

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        setErrorMessage("");
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, deleting, onClose]);

  // ======================================
  // CLOSE WITHOUT DELETING
  // ======================================

  const handleClose = () => {
    if (deleting) return;

    setErrorMessage("");

    onClose?.();
  };

  // ======================================
  // DELETE POST FROM BACKEND
  // ======================================

  const handleDeletePost = async () => {
    if (
      deleting ||
      !post?._id
    ) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    let deletedPostId;

    try {
      // ----------------------------------
      // PROTECTED DELETE API
      // ----------------------------------

      const { data, status } =
        await api.delete(
          `/posts/${post._id}`
        );

      // Expected Backend Response:
      // {
      //   message: "Post deleted successfully.",
      //   postId: "..."
      // }

      if (
        status !== 200 ||
        String(data?.postId) !==
          String(post._id)
      ) {
        throw new Error(
          "Unexpected delete response."
        );
      }

      deletedPostId = data.postId;

    } catch (error) {
      console.error(
        "Delete Post Error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete post.";

      setErrorMessage(message);

      // Keep modal open so the user
      // can see the error or retry.
      return;

    } finally {
      setDeleting(false);
    }

    // ====================================
    // SUCCESS
    // ====================================

    toast.success(
      "Post deleted successfully!"
    );

    // Close confirmation modal.
    onClose?.();

    // Notify parent component to remove
    // deleted post from the Feed UI.
    onDeleted?.(deletedPostId);
  };

  // ======================================
  // MODAL VISIBILITY
  // ======================================

  if (!isOpen || !post) {
    return null;
  }

  // ======================================
  // POST PREVIEW INFORMATION
  // ======================================

  const authorName =
    post?.user?.name ||
    post?.user?.username ||
    "You";

  const postContent =
    post?.content || "";

  // ======================================
  // RENDER
  // ======================================

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        aria-describedby="delete-post-description"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0B1120] shadow-[0_25px_100px_rgba(0,0,0,0.65)]"
      >

        {/* ==================================
            MODAL HEADER
        ================================== */}

        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">

          <h2
            id="delete-post-title"
            className="text-lg font-bold text-white"
          >
            Delete Post
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            aria-label="Close delete confirmation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* ==================================
            WARNING SECTION
        ================================== */}

        <div className="space-y-5 p-5 sm:p-6">

          <div className="flex flex-col items-center text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">

              <FiAlertTriangle
                size={30}
                className="text-red-400"
              />

            </div>

            <h3 className="text-xl font-bold text-white">
              Are you sure?
            </h3>

            <p
              id="delete-post-description"
              className="mt-3 text-sm leading-6 text-gray-400"
            >
              You are about to permanently delete
              this post. This action cannot be undone.
            </p>

          </div>

          {/* ==================================
              POST PREVIEW
          ================================== */}

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">

            <p className="mb-2 text-xs font-semibold text-indigo-300">
              POST TO BE DELETED
            </p>

            <p className="mb-2 text-sm font-semibold text-white">
              {authorName}
            </p>

            <p className="line-clamp-3 wrap-break-word text-sm leading-6 whitespace-pre-wrap text-gray-400">
              {postContent}
            </p>

            {/* IMAGE ATTACHMENT INDICATOR */}

            {post?.image && (

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                <span>
                  Image attachment included
                </span>

              </div>

            )}

            {/* VIDEO ATTACHMENT INDICATOR */}

            {post?.video && (

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                <span>
                  Video attachment included
                </span>

              </div>

            )}

          </div>

          {/* ==================================
              ERROR MESSAGE
          ================================== */}

          {errorMessage && (

            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {errorMessage}
            </p>

          )}

          {/* ==================================
              FOOTER BUTTONS
          ================================== */}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">

            {/* CANCEL BUTTON */}

            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* DELETE CONFIRMATION BUTTON */}

            <button
              type="button"
              onClick={handleDeletePost}
              disabled={
                deleting ||
                !post?._id
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {deleting ? (

                <>
                  <FiLoader
                    size={18}
                    className="animate-spin"
                  />

                  Deleting...
                </>

              ) : (

                <>
                  <FiTrash2 size={18} />

                  Delete Post
                </>

              )}

            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DeletePostModal;
