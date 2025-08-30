import React from "react";
import { useParams } from "react-router-dom";
import { useSeriesDetail } from "../../hooks/useSeriesDetail";
import styles from "./SeriesDetail.module.scss";
import { providerLogoMap } from "../../constants/providers";

const SeriesDetail: React.FC = () => {
  const { id } = useParams();
  const {
    series,
    isLoading,
    isInWL,
    userRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
    toggleWatchlist,
    onClickRateButton,
    submitRating,
    cancelRating,
  } = useSeriesDetail(id);

  const getKnownProviders = (providers?: string[]) =>
    (providers || []).filter((p) => providerLogoMap[p]);

  const getProviderLogoPath = (provider: string) =>
    providerLogoMap[provider]
      ? `/assets/images/providers/${providerLogoMap[provider]}`
      : null;

  if (isLoading) return <div className={styles.loader}>Lade …</div>;
  if (!series) return <div className={styles.loader}>Serie nicht gefunden.</div>;

  return (
    <div className={styles.seriesDetailContainer}>
      <header className={styles.seriesHeader}>
        <h1 className={styles.seriesTitle}>
          {series.title}
          <span className={styles.seriesYear}>({series.releaseYear})</span>
        </h1>
      </header>

      <div className={styles.seriesContent}>
        <div className={styles.posterWrapper}>
          {/* Watchlist Button */}
          <button className={styles.addBtn} onClick={toggleWatchlist}>
            {!isInWL ? (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </button>

          {/* Rating Button */}
          <button className={styles.ratingBtn} onClick={onClickRateButton}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                       9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>

          <img
            src={series.poster || "https://placehold.co/200x300"}
            alt={series.title}
            className={styles.seriesPoster}
          />

          {selectedContentId === series.tmdbId && !isRatingSubmitted && (
            <>
              <div className={styles.ratingOverlay} onClick={cancelRating}></div>
              <div className={styles.ratingInputContainer}>
                <div className={styles.ratingCard}>
                  <button className={styles.closeBtn} onClick={cancelRating}>✕</button>
                  <h3>Rate “{series.title}”</h3>
                  <input
                    type="text"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(e.target.value)}
                    placeholder="0.0 – 10.0"
                    onKeyDown={(e) => e.key === "Enter" && submitRating()}
                    className={styles.ratingInputField}
                  />
                  <button className={styles.submitRatingBtn} onClick={submitRating}>
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.detailsWrapper}>
          {/* External Ratings */}
          <div className={styles.ratingsWrapper}>
            <div className={styles.ratingBlock}>
              <img src="/assets/images/imdb-logo.png" alt="IMDb" className={styles.ratingIcon} />
              <span className={styles.ratingValue}>
                {series.imdbRating != null ? series.imdbRating.toFixed(1) : "–"}
              </span>
            </div>
            <div className={styles.ratingBlock}>
              <img src="/assets/images/rt-logo-cf.png" alt="RT" className={styles.ratingIcon} />
              <span className={styles.ratingValue}>
                {series.rtRating != null ? `${series.rtRating}%` : "–"}
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
          <div className={styles.genres}>
            {(series.genres || []).map((g) => (
              <span key={g} className={styles.genrePill}>{g}</span>
            ))}
          </div>

          {/* Providers */}
          {getKnownProviders(series.providers).length > 0 && (
            <section className={styles.providers}>
              {getKnownProviders(series.providers).map((p) => {
                const logo = getProviderLogoPath(p);
                return logo ? (
                  <img key={p} src={logo} alt={p} className={styles.providerLogo} />
                ) : null;
              })}
            </section>
          )}

          {/* Overview */}
          <section className={styles.overview}>
            <h2>Handlung</h2>
            <p>{series.overview || "Keine Beschreibung vorhanden."}</p>
          </section>

          {/* Cast */}
          {series.cast && series.cast.length > 0 && (
            <section className={styles.castSection}>
              <h2>Hauptbesetzung</h2>
              <div className={styles.castList}>
                {series.cast.map((actor) => (
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

export default SeriesDetail;
