// src/components/FilterControls/FilterControls.tsx
import React, { useEffect, useState, useRef} from "react";
import styles from "./FilterControls.module.scss";
import { PROVIDERS, providerLogoMap } from "../../constants/providers";
import { getGenres } from "../../api/contentApi";
import { useDebounce } from "../../hooks/useDebounce";
import { defaultFilters } from "../../hooks/useFilters";

const {
  releaseYearMin: DEFAULT_RELEASE_YEAR_MIN,
  releaseYearMax: DEFAULT_RELEASE_YEAR_MAX,
  imdbRatingMin: DEFAULT_IMDB_RATING_MIN,
  rtRatingMin: DEFAULT_RT_RATING_MIN,
  userRatingMin: DEFAULT_USER_RATING_MIN,
} = defaultFilters;

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

  const isResetting = useRef(false);

  const [releaseYearMinValue, setReleaseYearMinValue] = useState(
    releaseYearMin
  );
  const [releaseYearMaxValue, setReleaseYearMaxValue] = useState(
    releaseYearMax
  );
  const [imdbRatingMinValue, setImdbRatingMinValue] = useState(
    imdbRatingMin
  );
  const [rtRatingMinValue, setRtRatingMinValue] = useState(rtRatingMin);
  const [userRatingMinValue, setUserRatingMinValue] = useState(userRatingMin);

  const debouncedReleaseYearMin = useDebounce(releaseYearMinValue);
  const debouncedReleaseYearMax = useDebounce(releaseYearMaxValue);
  const debouncedImdbRatingMin = useDebounce(imdbRatingMinValue);
  const debouncedRtRatingMin = useDebounce(rtRatingMinValue);
  const debouncedUserRatingMin = useDebounce(userRatingMinValue);

  // Genres laden (entspricht Angulars ContentService.getGenres())
  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        console.error("Failed to load genres", err);
      }
    }
    loadGenres();
  }, []);

  useEffect(() => {
    setReleaseYearMinValue(releaseYearMin);
  }, [releaseYearMin]);

  useEffect(() => {
    setReleaseYearMaxValue(releaseYearMax);
  }, [releaseYearMax]);

  useEffect(() => {
    setImdbRatingMinValue(imdbRatingMin);
  }, [imdbRatingMin]);

  useEffect(() => {
    setRtRatingMinValue(rtRatingMin);
  }, [rtRatingMin]);

  useEffect(() => {
    setUserRatingMinValue(userRatingMin);
  }, [userRatingMin]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    if (debouncedReleaseYearMin !== releaseYearMin) {
      onFiltersChange?.({ releaseYearMin: debouncedReleaseYearMin });
    }
  }, [debouncedReleaseYearMin, releaseYearMin, onFiltersChange]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    if (debouncedReleaseYearMax !== releaseYearMax) {
      onFiltersChange?.({ releaseYearMax: debouncedReleaseYearMax });
    }
  }, [debouncedReleaseYearMax, releaseYearMax, onFiltersChange]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    if (debouncedImdbRatingMin !== imdbRatingMin) {
      onFiltersChange?.({ imdbRatingMin: debouncedImdbRatingMin });
    }
  }, [debouncedImdbRatingMin, imdbRatingMin, onFiltersChange]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    if (debouncedRtRatingMin !== rtRatingMin) {
      onFiltersChange?.({ rtRatingMin: debouncedRtRatingMin });
    }
  }, [debouncedRtRatingMin, rtRatingMin, onFiltersChange]);

  useEffect(() => {
    if (isResetting.current) {
      isResetting.current = false;
      return;
    }
    if (debouncedUserRatingMin !== userRatingMin) {
      onFiltersChange?.({ userRatingMin: debouncedUserRatingMin });
    }
  }, [debouncedUserRatingMin, userRatingMin, onFiltersChange]);

  const toggleGenre = (genre: string) => {
    const updated = genresSelected.includes(genre)
      ? genresSelected.filter((g) => g !== genre)
      : [...genresSelected, genre];
    onFiltersChange?.({ genres: updated });
  };

  const clearGenres = () => {
    if (genresSelected.length > 0) {
      onFiltersChange?.({ genres: [] });
    }
  };

  const toggleProvider = (provider: string) => {
    const updated = providersSelected.includes(provider)
      ? providersSelected.filter((p) => p !== provider)
      : [...providersSelected, provider];
    onFiltersChange?.({ providers: updated });
  };

  const clearProviders = () => {
    if (providersSelected.length > 0) {
      onFiltersChange?.({ providers: [] });
    }
  };

  const getProviderLogoPath = (provider: string) =>
    `/assets/images/providers/${providerLogoMap[provider]}`;

  return (
    <div className={styles.filterPanelInner}>
      {/* Genres */}
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

      {/* Sliders */}
      <div className={styles.sliderColumn}>
        <div className={styles.filterGroup}>
          <label>
            Release Year: {releaseYearMinValue} - {releaseYearMaxValue}
          </label>
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMinValue}
            onChange={(e) =>
              setReleaseYearMinValue(Number(e.target.value))
            }
            onMouseUp={(e) =>
              onFiltersChange?.({
                releaseYearMin: Number(e.currentTarget.value),
              })
            }
          />
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMaxValue}
            onChange={(e) =>
              setReleaseYearMaxValue(Number(e.target.value))
            }
            onMouseUp={(e) =>
              onFiltersChange?.({
                releaseYearMax: Number(e.currentTarget.value),
              })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>IMDb Rating ≥ {imdbRatingMinValue.toFixed(1)}</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={imdbRatingMinValue}
            onChange={(e) =>
              setImdbRatingMinValue(Number(e.target.value))
            }
            onMouseUp={(e) =>
              onFiltersChange?.({
                imdbRatingMin: Number(e.currentTarget.value),
              })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>RT Rating ≥ {rtRatingMinValue}</label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rtRatingMinValue}
            onChange={(e) =>
              setRtRatingMinValue(Number(e.target.value))
            }
            onMouseUp={(e) =>
              onFiltersChange?.({
                rtRatingMin: Number(e.currentTarget.value),
              })
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label>My Rating ≥ {userRatingMinValue.toFixed(1)}</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={userRatingMinValue}
            onChange={(e) =>
              setUserRatingMinValue(Number(e.target.value))
            }
            onMouseUp={(e) =>
              onFiltersChange?.({
                userRatingMin: Number(e.currentTarget.value),
              })
            }
          />
        </div>

        {/* Providers */}
        <div className={styles.filterGroup}>
          <label>Provider</label>
          <div className={styles.providerButtons}>
            {PROVIDERS.map((p) => (
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

      {/* Reset */}
      <button
        className={styles.resetBtn}
        onClick={() => {
          isResetting.current = true;
          setReleaseYearMinValue(DEFAULT_RELEASE_YEAR_MIN);
          setReleaseYearMaxValue(DEFAULT_RELEASE_YEAR_MAX);
          setImdbRatingMinValue(DEFAULT_IMDB_RATING_MIN);
          setRtRatingMinValue(DEFAULT_RT_RATING_MIN);
          setUserRatingMinValue(DEFAULT_USER_RATING_MIN);
          onReset?.();
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default FilterControls;
