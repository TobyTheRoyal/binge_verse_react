import React, { useEffect, useState } from 'react';
import styles from './FilterControls.module.scss';

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
  currentYear?: number;
  onFiltersChange?: (filters: FilterOptions) => void;
  onReset?: () => void;
}

const providers = [
  'Netflix',
  'Disney Plus',
  'Apple TV+',
  'Amazon Prime Video',
  'Paramount Plus',
  'Sky Go'
];

const providerLogoMap: Record<string, string> = {
  'Netflix': 'netflix.svg',
  'Disney Plus': 'disney-plus.svg',
  'Apple TV+': 'apple-tv.svg',
  'Amazon Prime Video': 'prime.svg',
  'Paramount Plus': 'paramount.svg',
  'Sky Go': 'sky.svg'
};

const FilterControls: React.FC<FilterControlsProps> = ({
  currentYear = new Date().getFullYear(),
  onFiltersChange,
  onReset
}) => {
  const [genres, setGenres] = useState<string[]>([]);
  const [genresSelected, setGenresSelected] = useState<string[]>([]);
  const [releaseYearMin, setReleaseYearMin] = useState(1900);
  const [releaseYearMax, setReleaseYearMax] = useState(currentYear);
  const [imdbRatingMin, setImdbRatingMin] = useState(0);
  const [rtRatingMin, setRtRatingMin] = useState(0);
  const [userRatingMin, setUserRatingMin] = useState(0);
  const [providersSelected, setProvidersSelected] = useState<string[]>([]);

  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await fetch('/api/content/genres');
        if (res.ok) {
          const data = await res.json();
          setGenres(data);
        } else {
          console.error('Failed to load genres');
        }
      } catch {
        console.error('Failed to load genres');
      }
    }
    loadGenres();
  }, []);

  useEffect(() => {
    onFiltersChange?.({
      genres: genresSelected,
      releaseYearMin,
      releaseYearMax,
      imdbRatingMin,
      rtRatingMin,
      providers: providersSelected,
      userRatingMin
    });
  }, [genresSelected, releaseYearMin, releaseYearMax, imdbRatingMin, rtRatingMin, userRatingMin, providersSelected, onFiltersChange]);

  const toggleGenre = (genre: string) => {
    setGenresSelected(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const clearGenres = () => setGenresSelected([]);

  const toggleProvider = (provider: string) => {
    setProvidersSelected(prev =>
      prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]
    );
  };

  const clearProviders = () => setProvidersSelected([]);

  const resetFilters = () => {
    setGenresSelected([]);
    setReleaseYearMin(1900);
    setReleaseYearMax(currentYear);
    setImdbRatingMin(0);
    setRtRatingMin(0);
    setUserRatingMin(0);
    setProvidersSelected([]);
    onFiltersChange?.({
      genres: [],
      releaseYearMin: 1900,
      releaseYearMax: currentYear,
      imdbRatingMin: 0,
      rtRatingMin: 0,
      providers: [],
      userRatingMin: 0
    });
    onReset?.();
  };

  const getProviderLogoPath = (provider: string) => `/assets/images/providers/${providerLogoMap[provider]}`;

  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const ripple = target.querySelector(`.${styles.ripple}`) as HTMLElement;
    if (!ripple) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.classList.add(styles.animate);
    setTimeout(() => ripple.classList.remove(styles.animate), 600);
  };

  return (
    <div className={styles.filterPanelInner}>
      <div className={styles.genreColumn}>
        <div className={styles.filterGroup}>
          <label>Genre</label>
          <div className={styles.genreButtons}>
            {genres.map(g => (
              <button
                key={g}
                onClick={e => { toggleGenre(g); triggerRipple(e); }}
                className={`${styles.genreButton} ${genresSelected.includes(g) ? styles.active : ''}`}
              >
                <span className={styles.ripple}></span>
                {g}
              </button>
            ))}
            <button
              onClick={e => { clearGenres(); triggerRipple(e); }}
              className={`${styles.genreButton} ${genresSelected.length === 0 ? styles.active : ''}`}
            >
              <span className={styles.ripple}></span>
              All Genres
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sliderColumn}>
        <div className={styles.filterGroup}>
          <label>Release Year: {releaseYearMin} - {releaseYearMax}</label>
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMin}
            onChange={e => setReleaseYearMin(Number(e.target.value))}
          />
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={releaseYearMax}
            onChange={e => setReleaseYearMax(Number(e.target.value))}
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
            onChange={e => setImdbRatingMin(Number(e.target.value))}
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
            onChange={e => setRtRatingMin(Number(e.target.value))}
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
            onChange={e => setUserRatingMin(Number(e.target.value))}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Provider</label>
          <div className={styles.providerButtons}>
            {providers.map(p => (
              <button
                key={p}
                onClick={e => { toggleProvider(p); triggerRipple(e); }}
                className={`${styles.providerButton} ${providersSelected.includes(p) ? styles.active : ''}`}
              >
                <span className={styles.ripple}></span>
                <img src={getProviderLogoPath(p)} alt={p} className={styles.providerLogo} />
              </button>
            ))}
            <button
              onClick={e => { clearProviders(); triggerRipple(e); }}
              className={`${styles.providerButton} ${providersSelected.length === 0 ? styles.active : ''}`}
            >
              <span className={styles.ripple}></span>
              All
            </button>
          </div>
        </div>
      </div>

      <button className={styles.resetBtn} onClick={e => { resetFilters(); triggerRipple(e); }}>
        <span className={styles.ripple}></span>
        Reset
      </button>
    </div>
  );
};

export default FilterControls;