import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSeries } from "../../hooks/useSeries";
import { useFilters } from "../../hooks/useFilters";
import { useWatchlist } from "../../hooks/useWatchlist";
import { useRatings } from "../../hooks/useRatings";
import FilterControls from "../FilterControls/FilterControls";
import styles from "./Series.module.scss";

const Series: React.FC = () => {
  const navigate = useNavigate();
   const {
    filters,
    updateFilters,
    resetFilters,
    toggleFilters,
    showFilters,
    hasActiveFilters,
  } = useFilters();

  const {
    series,
    fetchNextPage,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
    isLoading,
    startRating,
    stopRating,
    submitRating,
  } = useSeries(filters);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { fetchUserRatings, getRating } = useRatings();

  const submitRatingWithRefresh = (tmdbId: string) =>
    submitRating(tmdbId).then(fetchUserRatings);

  useEffect(() => {
    fetchUserRatings();
  }, [fetchUserRatings]);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage]);

  return (
    <div className={styles.seriesContainer}>
      <div className={styles.seriesHeaderRow}>
        <h2>Series</h2>
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
          genresSelected={filters.genres}
          releaseYearMin={filters.releaseYearMin}
          releaseYearMax={filters.releaseYearMax}
          imdbRatingMin={filters.imdbRatingMin}
          rtRatingMin={filters.rtRatingMin}
          userRatingMin={filters.userRatingMin}
          providersSelected={filters.providers}
          currentYear={new Date().getFullYear()}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
        />
      )}

      <div className={styles.contentList}>
        {series.map((s) => (
          <div
            key={s.tmdbId}
            className={styles.contentCard}
            onMouseLeave={stopRating}
            onClick={() =>
              !selectedContentId && navigate(`/series/${s.tmdbId}`)
            }
          >
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url(${
                  s.poster || "https://placehold.co/220x330"
                })`,
              }}
            >
              {/* Watchlist Button */}
              <button
                className={styles.addBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  isInWatchlist(s.tmdbId)
                    ? removeFromWatchlist(s.tmdbId)
                    : addToWatchlist({ id: s.tmdbId, type: "tv" });
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill={isInWatchlist(s.tmdbId) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {/* Rating Button */}
              <button
                className={styles.ratingBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startRating(s.tmdbId);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

              {/* Rating Modal */}
              {selectedContentId === s.tmdbId && !isRatingSubmitted && (
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
                      <h3>Rate “{s.title}”</h3>
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="0.0 – 10.0"
                        className={styles.ratingInputField}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          submitRatingWithRefresh(s.tmdbId)
                        }
                      />
                      <button
                        className={styles.submitRatingBtn}
                        onClick={() =>
                          submitRatingWithRefresh(s.tmdbId)
                        }
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}
              {/* Own Rating */}
              {getRating(s.tmdbId) !== null && (
                <div className={styles.ownRatingTag}>
                  <span className={styles.starIcon}>★</span>
                  {getRating(s.tmdbId)?.toFixed(1)}
                </div>
              )}
            </div>
            <p className={styles.cardTitle}>
              {s.title} ({s.releaseYear})
            </p>
            <div className={styles.ratingsContainer}>
              <div className={styles.imdbRating}>
                <img
                  src="/assets/images/imdb-logo.png"
                  alt="IMDb"
                  className={styles.ratingIcon}
                />
                {s.imdbRating != null ? s.imdbRating.toFixed(1) : "N/A"}
              </div>
              <div className={styles.rtRating}>
                <img
                  src="/assets/images/rt-logo-cf.png"
                  alt="RT"
                  className={styles.ratingIcon}
                />
                {s.rtRating != null ? `${s.rtRating}%` : "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div> Laden...
        </div>
      )}
    </div>
  );
};

export default Series;
