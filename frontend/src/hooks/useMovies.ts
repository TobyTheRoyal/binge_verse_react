import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../api/client";

export interface Movie {
  tmdbId: string;
  title: string;
  poster?: string;
  releaseYear?: number;
  imdbRating?: number;
  rtRating?: number;
}

export interface FilterOptions {
  genres: string[];
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
  providers: string[];
}

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    releaseYearMin: 1900,
    releaseYearMax: new Date().getFullYear(),
    imdbRatingMin: 0,
    rtRatingMin: 0,
    providers: [],
  });

  // Rating
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // Ratings & Watchlist Cache
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const fetchMovies = useCallback(
    async (pageToLoad: number, replace = false) => {
      setIsLoading(true);
      try {
        const res = await apiFetch(
          `/api/movies?page=${pageToLoad}&filters=${encodeURIComponent(
            JSON.stringify(filters)
          )}`,
          { auth: true }
        );
        const data = await res.json();
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setMovies((prev) =>
            replace ? data : [...prev, ...data]
          );
        }
      } catch (err) {
        console.error("Failed to load movies", err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    setPage(1);
    setMovies([]);
    setHasMore(true);
    fetchMovies(1, true);
  }, [filters, fetchMovies]);

  const fetchNextPage = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchMovies(page + 1);
    setPage((p) => p + 1);
  }, [page, isLoading, hasMore, fetchMovies]);

  // Filters
  const updateFilters = (newF: Partial<FilterOptions>) =>
    setFilters((prev) => ({ ...prev, ...newF }));

  const resetFilters = () =>
    setFilters({
      genres: [],
      releaseYearMin: 1900,
      releaseYearMax: new Date().getFullYear(),
      imdbRatingMin: 0,
      rtRatingMin: 0,
      providers: [],
    });

  const toggleFilters = () => setShowFilters((s) => !s);

  const hasActiveFilters = () =>
    filters.genres.length > 0 ||
    filters.releaseYearMin !== 1900 ||
    filters.releaseYearMax !== new Date().getFullYear() ||
    filters.imdbRatingMin > 0 ||
    filters.rtRatingMin > 0 ||
    filters.providers.length > 0;

  // Rating
  const startRating = (tmdbId: string) => {
    setSelectedContentId(tmdbId);
    setRatingScore("");
    setIsRatingSubmitted(false);
  };
  const stopRating = () => {
    setSelectedContentId(null);
    setRatingScore("");
    setIsRatingSubmitted(false);
  };
  const submitRating = async (tmdbId: string) => {
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be 0.0–10.0");
      return;
    }
    try {
      await apiFetch("/api/ratings", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, score }),
      });
      setRatings((prev) => ({ ...prev, [tmdbId]: score }));
      setIsRatingSubmitted(true);
      setTimeout(() => stopRating(), 500);
    } catch (err) {
      console.error("Failed to rate", err);
    }
  };
  const getRating = (tmdbId: string) => ratings[tmdbId] ?? null;

  // Watchlist
  const isInWatchlist = (id: string) => watchlist.includes(id);
  const toggleWatchlist = async (id: string) => {
    if (isInWatchlist(id)) {
      await apiFetch(`/api/watchlist/${id}`, { method: "DELETE", auth: true });
      setWatchlist((prev) => prev.filter((x) => x !== id));
    } else {
      await apiFetch(`/api/watchlist`, {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId: id, type: "movie" }),
      });
      setWatchlist((prev) => [...prev, id]);
    }
  };

  return {
    movies,
    isLoading,
    hasMore,
    fetchNextPage,
    filters,
    updateFilters,
    resetFilters,
    toggleFilters,
    showFilters,
    hasActiveFilters,
    startRating,
    stopRating,
    submitRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
    getRating,
    toggleWatchlist,
    isInWatchlist,
  };
}
