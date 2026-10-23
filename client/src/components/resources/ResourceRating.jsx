
import { useEffect, useState } from "react";
import { FiStar, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../services/api";

const ResourceRating = ({ resource, onRated }) => {
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMyRating = async () => {
      try {
        const { data } = await api.get(
          `/resources/${resource._id}/my-rating`
        );

        if (!cancelled) {
          setMyRating(data.userRating || 0);
        }
      } catch (error) {
        if (!cancelled) {
          setMyRating(0);

          if (error.response?.status !== 401) {
            console.error(
              "Failed to load rating:",
              error
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMyRating();

    return () => {
      cancelled = true;
    };
  }, [resource._id]);

  const handleRate = async (value) => {
    if (saving || loading) return;

    try {
      setSaving(true);

      const { data } = await api.put(
        `/resources/${resource._id}/rate`,
        { rating: value }
      );

      setMyRating(data.userRating);

      // Refresh average and count in parent
      onRated?.(resource._id, data);

      toast.success(
        `Your ${value}-star rating was saved!`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Please login to rate this resource."
      );
    } finally {
      setSaving(false);
    }
  };

  const activeRating = hoverRating || myRating;

  return (
    <div className="pt-4 border-t border-white/10">
      <p className="text-xs text-gray-500 mb-3">
        Rate this learning resource
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={saving || loading}
              onMouseEnter={() => setHoverRating(star)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              aria-label={`Rate ${star} stars`}
              aria-pressed={myRating === star}
              title={`${star} Star${star > 1 ? "s" : ""}`}
              className="p-1 transition-all hover:scale-125 disabled:opacity-50"
            >
              <FiStar
                size={22}
                className={
                  star <= activeRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-500 hover:text-amber-400"
                }
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {(loading || saving) && (
            <FiLoader className="animate-spin text-indigo-400" />
          )}

          <FiStar className="text-amber-400" />

          <span className="text-white font-semibold">
            {Number(resource.averageRating || 0).toFixed(1)}
          </span>

          <span className="text-gray-400">
            ({resource.ratingsCount || 0})
          </span>
        </div>
      </div>

      <p className="text-xs mt-3 text-gray-400">
        {loading
          ? "Loading your rating..."
          : myRating > 0
          ? `Your rating: ${myRating}/5 stars`
          : "You haven't rated this resource yet."}
      </p>
    </div>
  );
};

export default ResourceRating;
