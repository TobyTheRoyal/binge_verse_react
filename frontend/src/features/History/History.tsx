import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import FilterControls from "../FilterControls/FilterControls";
import styles from "./History.module.scss";
import { parseRatingScore } from "../../utils/rating";

interface RatedContent {
  tmdbId: string;
  title?: string;
  poster?: string;
  releaseYear?: number;
  imdbRating?: number;
  rtRating?: number;
  type?: 'movie' | 'tv';
  genres?: string;
  providers?: string;
  rating: number;
}

interface FilterOptions {
  genres: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  providers: string[];
  userRatingMin: number;
}

const currentYear = new Date().getFullYear();

const History: React.FC = () => {
  const [history, setHistory] = useState<RatedContent[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<RatedContent[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    releaseYearMin: 1900,
    releaseYearMax: currentYear,
    imdbRatingMin: 0,
    rtRatingMin: 0,
    providers: [],
    userRatingMin: 0,
  });

  const navigate = useNavigate();

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<RatedContent[]>("/ratings");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    // apply filters
    setFilteredHistory(
      history.filter((h) => {
        
        if (filters.genres.length > 0) {
          const contentGenres = h.genres?.split(",").map((g) => g.trim()) ?? [];
          if (!filters.genres.some((g) => contentGenres.includes(g))) return false;
        }
        if (filters.providers.length > 0) {
          const contentProviders = h.providers?.split(",").map((p) => p.trim()) ?? [];
          if (!filters.providers.some((p) => contentProviders.includes(p))) return false;
        }
        const year = h.releaseYear ?? 0;
        if (year < filters.releaseYearMin || year > filters.releaseYearMax) return false;
        if (filters.imdbRatingMin > 0) {
          if (h.imdbRating == null || h.imdbRating < filters.imdbRatingMin) return false;
        }
        if (filters.rtRatingMin > 0) {
          if (h.rtRating == null || h.rtRating < filters.rtRatingMin) return false;
        }
        if (filters.userRatingMin > 0) {
          if (h.rating == null || h.rating < filters.userRatingMin) return false;
        }
        return true;
      })
    );
  }, [history, filters]);

  const startRating = (tmdbId: string) => {
    setSelectedContentId(tmdbId);
    setRatingScore("");
    setIsRatingSubmitted(false);
    setTimeout(() => {
      const input = document.querySelector(`.${styles.ratingInputField}`) as HTMLElement;
      if (input) input.focus();
    }, 0);
  };

  const stopRating = () => {
    setSelectedContentId(null);
    setIsRatingSubmitted(false);
  };

  const submitRating = async (tmdbId: string) => {
    const score = parseRatingScore(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be 0.0–10.0");
      return;
    }
    try {
      const content = history.find((h) => h.tmdbId === tmdbId);
      if (!content?.type) return;
      await axiosClient.post("/ratings", {
        tmdbId,
        rating: score,
        contentType: content.type,
      });
      setIsRatingSubmitted(true);
      await loadHistory();
      setTimeout(stopRating, 500);
    } catch (err) {
      console.error("Failed to rate", err);
    }
  };

  const onCardClick = (entry: RatedContent) => {
    if (selectedContentId) return; // rating open → block navigation
    const path = entry.type === 'tv' ? `/series/${entry.tmdbId}` : `/movies/${entry.tmdbId}`;
    navigate(path);
  };

  const toggleFilters = () => setShowFilters((s) => !s);

  const hasActiveFilters = () =>
    filters.genres.length > 0 ||
    filters.releaseYearMin !== 1900 ||
    filters.releaseYearMax !== currentYear ||
    filters.imdbRatingMin > 0 ||
    filters.rtRatingMin > 0 ||
    filters.userRatingMin > 0 ||
    filters.providers.length > 0;

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyHeaderRow}>
        <h2>My History</h2>
        <div className={styles.filterActions}>
          <button
            className={`${styles.filterToggleBtn} ${showFilters ? styles.active : ""}`}
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
          currentYear={currentYear}
          onFiltersChange={(newF: Partial<FilterOptions>) =>
            setFilters((prev) => ({ ...prev, ...newF }))
          }
          onReset={() =>
            setFilters({
              genres: [],
              releaseYearMin: 1900,
              releaseYearMax: currentYear,
              imdbRatingMin: 0,
              rtRatingMin: 0,
              providers: [],
              userRatingMin: 0,
            })
          }
        />
      )}

      <div className={styles.contentList}>
        {filteredHistory.map((entry) => (
          <div
            key={entry.tmdbId}
            className={styles.contentCard}
            onMouseLeave={stopRating}
            onClick={() => onCardClick(entry)}
          >
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url(${entry.poster || "https://placehold.co/200x300"})`,
              }}
            >
              <button
                className={styles.ratingBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  startRating(entry.tmdbId);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

              {selectedContentId === entry.tmdbId && !isRatingSubmitted && (
                <>
                  <div className={styles.ratingOverlay}></div>
                  <div className={styles.ratingInputContainer}>
                    <div className={styles.ratingCard}>
                      <button className={styles.closeBtn} onClick={stopRating}>
                        ✕
                      </button>
                      <h3>Rate “{entry.title}”</h3>
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="0.0 – 10.0"
                        className={styles.ratingInputField}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRating(entry.tmdbId);
                        }}
                      />
                      <button
                        className="submitRatingBtn"
                        onClick={() => submitRating(entry.tmdbId)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}

              {entry.rating != null && (
                <div className={styles.ownRatingTag}>
                  <span className={styles.starIcon}>★</span>
                  {entry.rating.toFixed(1)}
                </div>
              )}
            </div>

            <p className={styles.cardTitle}>
              {entry.title} ({entry.releaseYear})
            </p>

            <div className={styles.ratingsContainer}>
              <div className={styles.imdbRating}>
                <img
                  src="/assets/images/imdb-logo.png"
                  alt="IMDb"
                  className={`${styles.ratingIcon} ${styles.imdbRatingIcon}`}
                />
                {entry.imdbRating != null
                  ? entry.imdbRating.toFixed(1)
                  : "N/A"}
              </div>
              <div className={styles.rtRating}>
                <img
                  src="/assets/images/rt-logo-cf.png"
                  alt="Rotten Tomatoes"
                  className={`${styles.ratingIcon} ${styles.rtRatingIcon}`}
                />
                {entry.rtRating != null
                  ? `${entry.rtRating.toFixed(0)}%`
                  : "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
