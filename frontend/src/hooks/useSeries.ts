import { useState, useCallback, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export interface SeriesItem {
  tmdbId: string;
  title: string;
  releaseYear?: number;
  poster?: string;
  imdbRating?: number;
  rtRating?: number;
}

export function useSeries() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ⭐ Fetch mit Paginierung
  const fetchPage = useCallback(async (page: number, replace = false) => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get<SeriesItem[]>(`/api/series`, {
        params: { page },
      });
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setSeries(prev => (replace ? data : [...prev, ...data]));
      }
    } catch (err) {
      console.error("Failed to load series", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Erste Ladung
  useEffect(() => {
    fetchPage(1, true);
    setCurrentPage(2);
  }, [fetchPage]);

  const fetchNextPage = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPage(currentPage);
    setCurrentPage(p => p + 1);
  }, [isLoading, hasMore, currentPage, fetchPage]);

  // ⭐ Rating Handling
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
      alert("Score must be between 0.0 and 10.0");
      return;
    }
    try {
      await axiosClient.post('/api/ratings', { tmdbId, score });
      setIsRatingSubmitted(true);
      setTimeout(() => stopRating(), 500);
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  // Keyboard Listener wie HostListener in Angular
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedContentId) return;
      if (e.key === "Escape") return stopRating();
      if (e.repeat || e.key === "Backspace") return;
      e.preventDefault();

      if (/[0-9]/.test(e.key)) {
        setRatingScore(prev => (prev === "" || prev.endsWith(".") ? prev + e.key : e.key));
        if (parseFloat(ratingScore) > 10) setRatingScore("10");
      } else if (e.key === ".") {
        if (!ratingScore.includes(".") && ratingScore !== "") {
          setRatingScore(prev => prev + ".");
        }
      } else if (e.key === "Enter") {
        submitRating(selectedContentId);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedContentId, ratingScore]);

  return {
    series,
    fetchNextPage,
    isLoading,
    hasMore,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
    startRating,
    stopRating,
    submitRating,
  };
}
