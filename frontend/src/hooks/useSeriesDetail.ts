import { useCallback, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

interface Actor {
  name: string;
  character: string;
  profilePathUrl: string;
}

interface WatchlistEntry {
  tmdbId: string;
}

interface Rating {
  tmdbId: string;
  rating: number;
}

export interface SeriesDetail {
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

export function useSeriesDetail(id?: string) {
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWL, setIsInWL] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Overlay State
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  const fetchSeries = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Serie laden
      const { data } = await axiosClient.get<SeriesDetail>(
        `/api/series/${id}`
      );
      setSeries(data);

      // 2. Watchlist Status
      const { data: wl } = await axiosClient.get<WatchlistEntry[]>(
        `/watchlist`
      );
      setIsInWL(wl.some((c) => c.tmdbId === id));

      // 3. Ratings
      const { data: ratings } = await axiosClient.get<Rating[]>(
        `/ratings`
      );
      const myRating = ratings.find((r) => r.tmdbId === id)?.rating ?? null;
      setUserRating(myRating);
    } catch (err) {
      console.error("Failed to load series detail", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const toggleWatchlist = useCallback(async () => {
    if (!series) return;
    try {
      if (isInWL) {
        await axiosClient.delete(`/watchlist/${series.tmdbId}`);
        setIsInWL(false);
      } else {
        await axiosClient.post(`/watchlist`, {
          tmdbId: series.tmdbId,
          type: 'tv',
        });
        setIsInWL(true);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    }
  }, [series, isInWL]);

  const onClickRateButton = () => {
    if (series) {
      setSelectedContentId(series.tmdbId);
      setRatingScore("");
      setIsRatingSubmitted(false);
    }
  };

  const submitRating = async () => {
    if (!series) return;
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert("Score must be between 0.0 and 10.0");
      return;
    }
    try {
       await axiosClient.post('/ratings', {
        tmdbId: series.tmdbId,
        rating: score,
      });
      setIsRatingSubmitted(true);
      setUserRating(score);
      setTimeout(() => setSelectedContentId(null), 500);
    } catch (err) {
      console.error("Failed to rate series", err);
    }
  };

  const cancelRating = () => {
    setSelectedContentId(null);
    setRatingScore("");
    setIsRatingSubmitted(false);
  };

  return {
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
  };
}
