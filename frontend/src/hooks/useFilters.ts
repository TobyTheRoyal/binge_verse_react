import { useState, useCallback } from 'react';

export interface FilterOptions {
  genres: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  providers: string[];
  userRatingMin?: number;
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

  return { filters, updateFilters, resetFilters, getFilters };
}