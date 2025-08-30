import React, { useEffect, useState, useCallback } from "react";
import { useMovies } from "../../hooks/useMovies";
import FilterControls from "../FilterControls/FilterControls";
import styles from "./Movies.module.scss";
import { useNavigate } from "react-router-dom";

const Movies: React.FC = () => {
  const {
    movies,
    isLoading,
    hasMore,
    fetchNextPage,
    toggleFilters,
    showFilters,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    startRating,
    stopRating,
    submitRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
    toggleWatchlist,
    isInWatchlist,
    getRating,
  } = useMovies();

  const navigate = useNavigate();

  // Infinite Scroll
  useEffect(() => {
    const onScroll = () => {
      if (!hasMore || isLoading) return;
      const threshold = 300;
      const pos = window.innerHeight + window.scrollY;
      const height = document.body.offsetHeight;
      if (height - pos < threshold) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMore, isLoading, fetchNextPage]);

  const onCardClick = (tmdbId: string) => {
    if (selectedContentId) return;
    navigate(`/movies/${tmdbId}`);
  };

  return (
    <div className={styles.moviesContainer}>
      <div className={styles.moviesHeaderRow}>
        <h2>Movies</h2>
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
            {hasActiveFilters() && (
              <span className={styles.activeIndicator}></span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterControls
          currentYear={new Date().getFullYear()}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
        />
      )}

      <div className={styles.contentList}>
        {movies.map((item) => (
          <div
            key={item.tmdbId}
            className={styles.contentCard}
            onClick={() => onCardClick(item.tmdbId)}
            onMouseLeave={stopRating}
          >
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url(${
                  item.poster || "https://placehold.co/220x330"
                })`,
              }}
            >
              {/* Watchlist */}
              <button
                className={styles.addBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.tmdbId);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill={
                    isInWatchlist(item.tmdbId) ? "currentColor" : "none"
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {/* Rating */}
              <button
                className={styles.ratingBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startRating(item.tmdbId);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                          9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

              {/* Overlay */}
              {selectedContentId === item.tmdbId && !isRatingSubmitted && (
                <>
                  <div className={styles.ratingOverlay}></div>
                  <div className={styles.ratingInputContainer}>
                    <div className={styles.ratingCard}>
                      <button
                        className={styles.closeBtn}
                        onClick={stopRating}
                      >
                        ✕
                      </button>
                      <h3>Rate “{item.title}”</h3>
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="0.0 – 10.0"
                        className={styles.ratingInputField}
                        onKeyDown={(e) =>
                          e.key === "Enter" && submitRating(item.tmdbId)
                        }
                      />
                      <button
                        className={styles.submitRatingBtn}
                        onClick={() => submitRating(item.tmdbId)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Eigene Bewertung */}
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
                  className={`${styles.ratingIcon} ${styles.imdbRatingIcon}`}
                />
                {item.imdbRating != null ? item.imdbRating.toFixed(1) : "N/A"}
              </div>
              <div className={styles.rtRating}>
                <img
                  src="/assets/images/rt-logo-cf.png"
                  alt="Rotten Tomatoes"
                  className={`${styles.ratingIcon} ${styles.rtRatingIcon}`}
                />
                {item.rtRating != null ? `${item.rtRating}%` : "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          Laden…
        </div>
      )}
    </div>
  );
};

export default Movies;
