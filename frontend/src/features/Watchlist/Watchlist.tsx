import React, { useEffect } from "react";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useRatings } from "../../hooks/useRatings";
import styles from "./Watchlist.module.scss";
import FilterControls from "../FilterControls/FilterControls";

const Watchlist: React.FC = () => {
  const {
    filteredContents,
    filters,
    showFilters,
    toggleFilters,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    removeFromWatchlist,
    startRating,
    stopRating,
    submitRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
  } = useWatchlist();

  const { fetchUserRatings, getRating } = useRatings();

  useEffect(() => {
    fetchUserRatings();
  }, [fetchUserRatings]);

  return (
    <div className={styles.watchlistContainer}>
      <div className={styles.watchlistHeaderRow}>
        <h2>My Watchlist</h2>
        <div className={styles.filterActions}>
          <button
            className={`${styles.filterToggleBtn} ${
              showFilters ? styles.active : ""
            }`}
            onClick={toggleFilters}
          >
            <svg
              className={styles.filterIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.5 10 21 14 21 14 12.5 22 3"></polygon>
            </svg>
            Filter
            {hasActiveFilters() && <span className={styles.activeIndicator}></span>}
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterControls
          genresSelected={filters.genres}
          releaseYearMin={filters.releaseYearMin}
          releaseYearMax={filters.releaseYearMax}
          imdbRatingMin={filters.imdbRatingMin}
          rtRatingMin={filters.rtRatingMin}
          userRatingMin={filters.userRatingMin}
          providersSelected={filters.providers}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
        />
      )}

      <div className={styles.contentList}>
        {filteredContents.map((item) => (
          <div
            key={item.tmdbId}
            className={styles.contentCard}
            onMouseLeave={stopRating}
          >
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url(${
                  item.poster || "https://placehold.co/200x300"
                })`,
              }}
            >
              <button
                className={styles.addBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(item.tmdbId);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button
                className={styles.ratingBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startRating(item.tmdbId);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                           9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

              {selectedContentId === item.tmdbId && !isRatingSubmitted && (
                <>
                  <div className={styles.ratingOverlay}></div>
                  <div className={styles.ratingInputContainer}>
                    <div className={styles.ratingCard}>
                      <button className={styles.closeBtn} onClick={stopRating}>
                        ✕
                      </button>
                      <h3>Rate “{item.title}”</h3>
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="0.0 – 10.0"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          submitRating(item.tmdbId).then(fetchUserRatings)
                        }
                        className={styles.ratingInputField}
                      />
                      <button
                        className={styles.submitRatingBtn}
                        onClick={() =>
                          submitRating(item.tmdbId).then(fetchUserRatings)
                        }
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}

              {getRating(item.tmdbId) !== null && (
                <div className={styles.ownRatingTag}>
                  <span className={styles.starIcon}>★</span>
                  {getRating(item.tmdbId)?.toFixed(1)}
                </div>
              )}
            </div>
            <p className={styles.cardTitle}>
              {item.title} ({item.releaseYear})
            </p>
            <div className={styles.ratingsContainer}>
              <div className={styles.imdbRating}>
                <img
                  src="/assets/images/imdb-logo.png"
                  alt="IMDb"
                  className={styles.ratingIcon}
                />
                {item.imdbRating != null ? item.imdbRating.toFixed(1) : "N/A"}
              </div>
              <div className={styles.rtRating}>
                <img
                  src="/assets/images/rt-logo-cf.png"
                  alt="RT"
                  className={styles.ratingIcon}
                />
                {item.rtRating != null ? `${item.rtRating}%` : "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
