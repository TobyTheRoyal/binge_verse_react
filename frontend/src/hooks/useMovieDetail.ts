import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Actor {
  name: string;
  character: string;
  profilePathUrl: string;
}

export interface MovieDetail {
  tmdbId: string;
  title: string;
  overview: string;
  releaseYear?: number;
  poster?: string;
  imdbRating?: number;
  rtRating?: number;
  genres?: string[];
  providers?: string[];
  cast?: Actor[];
}

export function useMovieDetail(id?: string) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWL, setIsInWL] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const fetchMovie = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Movie Details
      const res = await apiFetch(`/api/movies/${id}`, { auth: true });
      const data = await res.json();
      setMovie(data);

      // 2. Watchlist Status
      const wlRes = await apiFetch(`/api/watchlist`, { auth: true });
      const wl = await wlRes.json();
      setIsInWL(wl.some((c: any) => c.tmdbId === id));

      // 3. User Ratings
      const ratingRes = await apiFetch(`/api/ratings`, { auth: true });
      const ratings = await ratingRes.json();
      const myRating = ratings.find((r: any) => r.tmdbId === id)?.score ?? null;
      setUserRating(myRating);
    } catch (err) {
      console.error("Failed to load movie details", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  const toggleWatchlist = useCallback(async () => {
    if (!movie) return;
    try {
      if (isInWL) {
        await apiFetch(`/api/watchlist/${movie.tmdbId}`, {
          method: "DELETE",
          auth: true,
        });
        setIsInWL(false);
      } else {
        await apiFetch(`/api/watchlist`, {
          method: "POST",
          auth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId: movie.tmdbId, type: "movie" }),
        });
        setIsInWL(true);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    }
  }, [movie, isInWL]);

  const submitRating = useCallback(
    async (score: number) => {
      if (!movie) return;
      try {
        await apiFetch(`/api/ratings`, {
          method: "POST",
          auth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId: movie.tmdbId, score }),
        });
        setUserRating(score);
      } catch (err) {
        console.error("Failed to rate movie", err);
      }
    },
    [movie]
  );

  return {
    movie,
    isLoading,
    isInWL,
    userRating,
    fetchMovie,
    toggleWatchlist,
    submitRating,
  };
}
