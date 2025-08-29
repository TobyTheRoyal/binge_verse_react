import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Actor {
  name: string;
  character: string;
  profilePathUrl: string;
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
      const res = await apiFetch(`/api/series/${id}`, { auth: true });
      const data = await res.json();
      setSeries(data);

      // 2. Watchlist Status
      const wlRes = await apiFetch(`/api/watchlist/user`, { auth: true });
      const wl = await wlRes.json();
      setIsInWL(wl.some((c: any) => c.tmdbId === id));

      // 3. Ratings
      const ratingRes = await apiFetch(`/api/ratings`, { auth: true });
      const ratings = await ratingRes.json();
      const myRating = ratings.find((r: any) => r.tmdbId === id)?.score ?? null;
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
        await apiFetch(`/api/watchlist/user/${series.tmdbId}`, {
          method: "DELETE",
          auth: true,
        });
        setIsInWL(false);
      } else {
        await apiFetch(`/api/watchlist/add`, {
          method: "POST",
          auth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId: series.tmdbId, type: "tv" }),
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
      await apiFetch("/api/ratings", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId: series.tmdbId, score }),
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
