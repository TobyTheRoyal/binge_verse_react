import React, { useEffect, useState } from "react";
import { useRatings } from "../../hooks/useRatings";
import styles from "./Rating.module.scss";

const Rating: React.FC = () => {
  const { ratings, fetchUserRatings, rateContent } = useRatings();
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [ratingScore, setRatingScore] = useState("");

  useEffect(() => {
    fetchUserRatings();
  }, [fetchUserRatings]);

  const openRatingModal = (contentId: number) => {
    setSelectedContentId(contentId);
    const selected = ratings.find((r) => r.id === contentId);
    setSelectedContentTitle(selected?.title ?? "Unknown");
    setRatingScore(selected ? String(selected.rating) : "");
  };

  const closeRatingModal = () => {
    setSelectedContentId(null);
    setSelectedContentTitle("");
    setRatingScore("");
  };

  const submitRating = async () => {
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be between 0.0 and 10.0");
      return;
    }
    if (selectedContentId == null) return;
    const selected = ratings.find((r) => r.id === selectedContentId);
    if (!selected) return;
    try {
      await rateContent(
        selected.tmdbId,
        selected.type as 'movie' | 'tv',
        score
      );
      closeRatingModal();
      fetchUserRatings();
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  return (
    <div className={styles.ratingContainer}>
      <h2>My Ratings</h2>
      <div className={styles.ratingList}>
        {ratings.map((rating) => (
          <div key={rating.id} className={styles.ratingItem}>
            {rating.poster && (
              <img
                src={rating.poster}
                alt={rating.title}
                className={styles.poster}
              />
            )}
            <div className={styles.ratingDetails}>
              <p>
                {rating.title || `TMDb ID: ${rating.tmdbId}`} (
                {rating.type})
              </p>
              <p>Score: {rating.rating}</p>
              <p>
                Rated At: {new Date(rating.ratedAt).toLocaleDateString()}
              </p>
              <button
                className={styles.ratingBtn}
                onClick={() => openRatingModal(rating.id)}
              >
                ⭐ Update Rating
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedContentId && (
        <>
          <div className={styles.ratingOverlay}></div>
          <div className={styles.ratingInputContainer}>
            <div className={styles.ratingCard}>
              <button className={styles.closeBtn} onClick={closeRatingModal}>
                ✕
              </button>
              <h3>Rate {selectedContentTitle}</h3>
              <input
                type="text"
                value={ratingScore}
                onChange={(e) => setRatingScore(e.target.value)}
                placeholder="0.0 – 10.0"
                className={styles.ratingInputField}
                onKeyDown={(e) => e.key === "Enter" && submitRating()}
              />
              <button
                className={styles.submitRatingBtn}
                onClick={submitRating}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Rating;
