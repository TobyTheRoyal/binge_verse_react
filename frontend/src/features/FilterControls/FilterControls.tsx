import React, { useEffect, useState } from "react";
import styles from "./FilterControls.module.scss";

interface FilterOptions {
  genres: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  providers: string[];
  userRatingMin: number;
}

interface FilterControlsProps {
  genresSelected: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  userRatingMin: number;
  providersSelected: string[];
  currentYear?: number;
  onFiltersChange?: (filters: Partial<FilterOptions>) => void;
  onReset?: () => void;
}

const providers = [
  "Netflix",
  "Disney Plus",
  "Apple TV+",
  "Amazon Prime Video",
  "Paramount Plus",
  "Sky Go",
];

const providerLogoMap: Record<string, string> = {
  Netflix: "netflix.svg",
  "Disney Plus": "disney-plus.svg",
  "Apple TV+": "apple-tv.svg",
  "Amazon Prime Video": "prime.svg",
  "Paramount Plus": "paramount.svg",
  "Sky Go": "sky.svg",
};

const FilterControls: React.FC<FilterControlsProps> = ({
  genresSelected,
  releaseYearMin,
  releaseYearMax,
  imdbRatingMin,
  rtRatingMin,
  userRatingMin,
  providersSelected,
  currentYear = new Date().getFullYear(),
  onFiltersChange,
  onReset,
}) => {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await fetch("/api/content/genres");
        if (res.ok) {
          const data = await res.json();
          setGenres(data);
        } else {
          console.error("Failed to load genres");
        }
      } catch {
        console.error("Failed to load genres");
      }
    }
    loadGenres();
  }, []);

  const toggleGenre = (genre: string) => {
    const updated = genresSelected.includes(genre)
      ? genresSelected.filter((g) => g !== genre)
      : [...genresSelected, genre];
    onFiltersChange?.({ genres: updated });
  };

  const clearGenres = () => onFiltersChange?.({ genres: [] });

  const toggleProvider = (provider: string) => {
    const updated = providersSelected.includes(provider)
      ? providersSelected.filter((p) => p !== provider)
      : [...providersSelected, provider];
    onFiltersChange?.({ providers: updated });
  };

  const clearProviders = () => onFiltersChange?.({ providers: [] });

  const getProviderLogoPath = (provider: string) =>
    `/assets/images/providers/${providerLogoMap[provider]}`;

  return (
    <div className={styles.filterPanelInner}>
      <div className={styles.genreColumn}>
        <div className={styles.filterGroup}>
          <label>Genre</label>
          <div className={styles.genreButtons}>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`${styles.genreButton} ${
                  genresSelected.includes(g) ? styles.active : ""
                }`}
              >
                {g}
              </button>
            ))}
            <button
              onClick={clearGenres}
              className={`${styles.genreButton} ${
                genresSelected.length === 0 ? styles.active : ""
              }`}
            >
              All Genres
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sliderColumn}>
        <div className={styles.filterGroup}>
          <label>
            Release Year: {releaseYearMin} - {releaseYearMax}
          </label>
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMin}
            onChange={(e) =>
              onFiltersChange?.({ releaseYearMin: Number(e.target.value) })
            }
          />
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMax}
            onChange={(e) =>
              onFiltersChange?.({ releaseYearMax: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>IMDb Rating ≥ {imdbRatingMin.toFixed(1)}</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={imdbRatingMin}
            onChange={(e) =>
              onFiltersChange?.({ imdbRatingMin: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>RT Rating ≥ {rtRatingMin}</label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rtRatingMin}
            onChange={(e) =>
              onFiltersChange?.({ rtRatingMin: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>My Rating ≥ {userRatingMin.toFixed(1)}</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={userRatingMin}
            onChange={(e) =>
              onFiltersChange?.({ userRatingMin: Number(e.target.value) })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Provider</label>
          <div className={styles.providerButtons}>
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => toggleProvider(p)}
                className={`${styles.providerButton} ${
                  providersSelected.includes(p) ? styles.active : ""
                }`}
              >
                <img
                  src={getProviderLogoPath(p)}
                  alt={p}
                  className={styles.providerLogo}
                />
              </button>
            ))}
            <button
              onClick={clearProviders}
              className={`${styles.providerButton} ${
                providersSelected.length === 0 ? styles.active : ""
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      <button
        className={styles.resetBtn}
        onClick={() => {
          onReset?.();
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default FilterControls;
