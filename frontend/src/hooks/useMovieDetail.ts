import { useCallback, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

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
      const { data } = await axiosClient.get(`/api/movies/${id}`);
      setMovie(data);

      // 2. Watchlist Status
      const { data: wl } = await axiosClient.get(`/api/watchlist`);
      setIsInWL(wl.some((c: any) => c.tmdbId === id));

      // 3. User Ratings
      const { data: ratings } = await axiosClient.get(`/api/ratings`);
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
        await axiosClient.delete(`/api/watchlist/${movie.tmdbId}`);
        setIsInWL(false);
      } else {
        await axiosClient.post(`/api/watchlist`, {
          tmdbId: movie.tmdbId,
          type: 'movie',
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
        await axiosClient.post(`/api/ratings`, {
          tmdbId: movie.tmdbId,
          score,
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
