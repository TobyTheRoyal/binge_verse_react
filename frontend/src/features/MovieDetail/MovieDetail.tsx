import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMovieDetail } from "../../hooks/useMovieDetail";
import styles from "./MovieDetail.module.scss";
import { providerLogoMap } from "../../constants/providers";

const MovieDetail: React.FC = () => {
  const { id } = useParams();
  const {
    movie,
    isLoading,
    isInWL,
    userRating,
    toggleWatchlist,
    submitRating,
  } = useMovieDetail(id);

  // UI-States für Rating-Overlay
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  if (isLoading) return <div className={styles.loader}>Lade …</div>;
  if (!movie) return <div className={styles.loader}>Film nicht gefunden.</div>;

  const getKnownProviders = (providers?: string[]) =>
    (providers || []).filter((p) => providerLogoMap[p]);

  const getProviderLogoPath = (provider: string) =>
    providerLogoMap[provider]
      ? `/assets/images/providers/${providerLogoMap[provider]}`
      : null;

  const handleRateClick = () => {
    setSelectedContentId(movie.tmdbId);
    setRatingScore("");
    setIsRatingSubmitted(false);
  };

  const handleSubmitRating = async () => {
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be between 0.0 and 10.0");
      return;
    }
    await submitRating(score);
    setIsRatingSubmitted(true);
    setTimeout(() => setSelectedContentId(null), 500);
  };

  const cancelRating = () => {
    setSelectedContentId(null);
    setRatingScore("");
    setIsRatingSubmitted(false);
  };

  return (
    <div className={styles.movieDetailContainer}>
      <header className={styles.movieHeader}>
        <h1 className={styles.movieTitle}>
          {movie.title}
          {movie.releaseYear && (
            <span className={styles.movieYear}>({movie.releaseYear})</span>
          )}
        </h1>
      </header>

      <div className={styles.movieContent}>
        <div className={styles.posterWrapper}>
          {/* Watchlist-Button */}
          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill={isInWL ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Rating-Button */}
          <button
            className={styles.ratingBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleRateClick();
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                      9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>

          <img
            src={movie.poster || "https://placehold.co/200x300"}
            alt={movie.title}
            className={styles.moviePoster}
          />

          {/* Rating Overlay + Eingabe */}
          {selectedContentId === movie.tmdbId && !isRatingSubmitted && (
            <>
              <div className={styles.ratingOverlay} onClick={cancelRating}></div>
              <div
                className={styles.ratingInputContainer}
                onMouseLeave={cancelRating}
              >
                <div className={styles.ratingCard}>
                  <button className={styles.closeBtn} onClick={cancelRating}>
                    ✕
                  </button>
                  <h3>Rate “{movie.title}”</h3>
                  <input
                    type="text"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(e.target.value)}
                    placeholder="0.0 – 10.0"
                    className={styles.ratingInputField}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitRating()}
                  />
                  <button
                    className={styles.submitRatingBtn}
                    onClick={handleSubmitRating}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.detailsWrapper}>
          {/* Ratings */}
          <div className={styles.ratingsWrapper}>
            <div className={styles.ratingBlock}>
              <img
                src="/assets/images/imdb-logo.png"
                alt="IMDb"
                className={`${styles.ratingIcon} ${styles.imdbRatingIcon}`}
              />
              <span className={styles.ratingValue}>
                {movie.imdbRating != null ? movie.imdbRating.toFixed(1) : "–"}
              </span>
            </div>
            <div className={styles.ratingBlock}>
              <img
                src="/assets/images/rt-logo-cf.png"
                alt="Rotten Tomatoes"
                className={`${styles.ratingIcon} ${styles.rtRatingIcon}`}
              />
              <span className={styles.ratingValue}>
                {movie.rtRating != null ? `${movie.rtRating}%` : "–"}
              </span>
            </div>
            {userRating != null && (
              <div className={styles.ownRatingTag}>
                <span className={styles.starIcon}>★</span>
                {userRating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className={styles.genres}>
              {movie.genres.map((g) => (
                <span key={g} className={styles.genrePill}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Providers */}
          {getKnownProviders(movie.providers).length > 0 && (
            <section className={styles.providers}>
              {getKnownProviders(movie.providers).map((p) => {
                const logo = getProviderLogoPath(p);
                return (
                  logo && (
                    <img
                      key={p}
                      src={logo}
                      alt={p}
                      className={styles.providerLogo}
                    />
                  )
                );
              })}
            </section>
          )}

          {/* Overview */}
          <section className={styles.overview}>
            <h2>Handlung</h2>
            <p>{movie.overview || "Keine Beschreibung vorhanden."}</p>
          </section>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <section className={styles.castSection}>
              <h2>Hauptbesetzung</h2>
              <div className={styles.castList}>
                {movie.cast.map((actor) => (
                  <div key={actor.name} className={styles.castItem}>
                    <div className={styles.castImageWrapper}>
                      <img src={actor.profilePathUrl} alt={actor.name} />
                    </div>
                    <div className={styles.castInfo}>
                      <span className={styles.castName}>{actor.name}</span>
                      <span className={styles.castChar}>{actor.character}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
