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
      const [movieRes, watchlistRes, ratingRes] = await Promise.all([
        axiosClient.get<MovieDetail>(`/movies/${id}`),
        axiosClient.get<{ exists: boolean }>(`/watchlist/${id}/exists`),
        axiosClient.get<{ rating?: number | null }>(`/ratings/${id}`),
      ]);

      setMovie(movieRes.data);
      setIsInWL(Boolean(watchlistRes.data?.exists));
      setUserRating(ratingRes.data?.rating ?? null);
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
        await axiosClient.delete(`/watchlist/${movie.tmdbId}`);
        setIsInWL(false);
      } else {
        await axiosClient.post(`/watchlist`, {
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
        await axiosClient.post(`/ratings`, {
          tmdbId: movie.tmdbId,
          rating: score,
          contentType: 'movie',
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
