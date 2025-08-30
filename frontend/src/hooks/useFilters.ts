import { useState, useCallback } from 'react';

export interface FilterOptions {
  genres: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  providers: string[];
  userRatingMin: number;
}

const defaultFilters: FilterOptions = {
  genres: [],
  releaseYearMin: 1900,
  releaseYearMax: new Date().getFullYear(),
  imdbRatingMin: 0,
  rtRatingMin: 0,
  providers: [],
  userRatingMin: 0,
};

export function useFilters(initial: FilterOptions = defaultFilters) {
  const [filters, setFilters] = useState<FilterOptions>(initial);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilters });
  }, []);

  const getFilters = useCallback(() => filters, [filters]);

  const hasActiveFilters = useCallback(() => {
  return (
    filters.genres.length > 0 ||
    filters.releaseYearMin !== 1900 ||
    filters.releaseYearMax !== new Date().getFullYear() ||
    filters.imdbRatingMin > 0 ||
    filters.rtRatingMin > 0 ||
    filters.userRatingMin > 0 ||
    filters.providers.length > 0
  );
}, [filters]);

  return { filters, updateFilters, resetFilters, getFilters, hasActiveFilters };
}