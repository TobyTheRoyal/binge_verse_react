import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client"; // dein fetch-wrapper mit auth
import FilterControls from "../FilterControls/FilterControls";

interface RatedContent {
  content: {
    tmdbId: string;
    title?: string;
    poster?: string;
    releaseYear?: number;
    imdbRating?: number;
    rtRating?: number;
    genres?: string;
    providers?: string;
  };
  score: number;
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
      const res = await apiFetch("/ratings", { auth: true });
      const data: RatedContent[] = await res.json();
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
        const c = h.content;
        if (filters.genres.length > 0) {
          const contentGenres = c.genres?.split(",").map((g) => g.trim()) ?? [];
          if (!filters.genres.some((g) => contentGenres.includes(g))) return false;
        }
        if (filters.providers.length > 0) {
          const contentProviders = c.providers?.split(",").map((p) => p.trim()) ?? [];
          if (!filters.providers.some((p) => contentProviders.includes(p))) return false;
        }
        const year = c.releaseYear ?? 0;
        if (year < filters.releaseYearMin || year > filters.releaseYearMax) return false;
        if (filters.imdbRatingMin > 0) {
          if (c.imdbRating == null || c.imdbRating < filters.imdbRatingMin) return false;
        }
        if (filters.rtRatingMin > 0) {
          if (c.rtRating == null || c.rtRating < filters.rtRatingMin) return false;
        }
        if (filters.userRatingMin > 0) {
          if (h.score == null || h.score < filters.userRatingMin) return false;
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
      const input = document.querySelector(".rating-input-field") as HTMLElement;
      if (input) input.focus();
    }, 0);
  };

  const stopRating = () => {
    setSelectedContentId(null);
    setIsRatingSubmitted(false);
  };

  const submitRating = async (tmdbId: string) => {
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be 0.0–10.0");
      return;
    }
    try {
      await apiFetch("/ratings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ tmdbId, score }),
        headers: { "Content-Type": "application/json" },
      });
      setIsRatingSubmitted(true);
      await loadHistory();
      setTimeout(stopRating, 500);
    } catch (err) {
      console.error("Failed to rate", err);
    }
  };

  const onCardClick = (tmdbId: string) => {
    if (selectedContentId) return; // rating open → block navigation
    navigate(`/movies/${tmdbId}`);
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
    <div className="history-container">
      <div className="history-header-row">
        <h2>My History</h2>
        <div className="filter-actions">
          <button
            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
            onClick={toggleFilters}
          >
            <svg
              className="filter-icon"
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
            {hasActiveFilters() && <span className="active-indicator"></span>}
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

      <div className="content-list">
        {filteredHistory.map((entry) => (
          <div
            key={entry.content.tmdbId}
            className="content-card"
            onMouseLeave={stopRating}
            onClick={() => onCardClick(entry.content.tmdbId)}
          >
            <div
              className="card-image"
              style={{
                backgroundImage: `url(${entry.content.poster || "https://placehold.co/200x300"})`,
              }}
            >
              <button
                className="rating-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  startRating(entry.content.tmdbId);
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>

              {selectedContentId === entry.content.tmdbId && !isRatingSubmitted && (
                <>
                  <div className="rating-overlay"></div>
                  <div className="rating-input-container">
                    <div className="rating-card">
                      <button className="close-btn" onClick={stopRating}>
                        ✕
                      </button>
                      <h3>Rate “{entry.content.title}”</h3>
                      <input
                        type="text"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value)}
                        placeholder="0.0 – 10.0"
                        className="rating-input-field"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRating(entry.content.tmdbId);
                        }}
                      />
                      <button
                        className="submit-rating-btn"
                        onClick={() => submitRating(entry.content.tmdbId)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}

              {entry.score != null && (
                <div className="own-rating-tag">
                  <span className="star-icon">★</span>
                  {entry.score.toFixed(1)}
                </div>
              )}
            </div>

            <p className="card-title">
              {entry.content.title} ({entry.content.releaseYear})
            </p>

            <div className="ratings-container">
              <div className="imdb-rating">
                <img
                  src="/assets/images/imdb-logo.png"
                  alt="IMDb"
                  className="rating-icon imdb-rating-icon"
                />
                {entry.content.imdbRating != null
                  ? entry.content.imdbRating.toFixed(1)
                  : "N/A"}
              </div>
              <div className="rt-rating">
                <img
                  src="/assets/images/rt-logo-cf.png"
                  alt="Rotten Tomatoes"
                  className="rating-icon rt-rating-icon"
                />
                {entry.content.rtRating != null
                  ? `${entry.content.rtRating.toFixed(0)}%`
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
