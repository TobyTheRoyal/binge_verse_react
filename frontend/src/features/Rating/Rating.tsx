import React, { useEffect } from "react";
import { useRatings } from "../../hooks/useRatings";
import styles from "./rating.module.scss";

const Rating: React.FC = () => {
  const {
    ratings,
    loadRatings,
    selectedContentId,
    selectedContentTitle,
    ratingScore,
    setRatingScore,
    openRatingModal,
    closeRatingModal,
    submitRating,
  } = useRatings();

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  return (
    <div className={styles.ratingContainer}>
      <h2>My Ratings</h2>
      <div className={styles.ratingList}>
        {ratings.map((rating) => (
          <div key={rating.content.id} className={styles.ratingItem}>
            {rating.poster && (
              <img
                src={rating.poster}
                alt={rating.title}
                className={styles.poster}
              />
            )}
            <div className={styles.ratingDetails}>
              <p>
                {rating.title || `TMDb ID: ${rating.content.tmdbId}`} (
                {rating.content.type})
              </p>
              <p>Score: {rating.score}</p>
              <p>
                Rated At: {new Date(rating.ratedAt).toLocaleDateString()}
              </p>
              <button
                className={styles.ratingBtn}
                onClick={() => openRatingModal(rating.content.id)}
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
