import { useState, useCallback, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useFilters, FilterOptions } from "./useFilters";

export interface WatchlistItem {
  tmdbId: string;
  title: string;
  releaseYear: number;
  poster: string;
  imdbRating: number | null;
  rtRating: number | null;
  genres?: string[];
  providers?: string[];
  type: "movie" | "tv";
  rating?: number;
}

export function useWatchlist() {
  const { token } = useAuth();
  const { filters, updateFilters, resetFilters, hasActiveFilters } = useFilters();

  const [allContents, setAllContents] = useState<WatchlistItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<WatchlistItem[]>([]);

  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering helper
  const filterContentList = useCallback(
    (contents: WatchlistItem[]) => {
      const f: FilterOptions = filters;
      return contents.filter((c) => {
        if (f.genres.length && !(c.genres || []).some((g) => f.genres.includes(g))) return false;
        if (f.providers.length && !(c.providers || []).some((p) => f.providers.includes(p))) return false;
        if (
          c.releaseYear &&
          (c.releaseYear < f.releaseYearMin || c.releaseYear > f.releaseYearMax)
        )
          return false;
        if (f.imdbRatingMin > 0 && (!c.imdbRating || c.imdbRating < f.imdbRatingMin))
          return false;
        if (f.rtRatingMin > 0 && (!c.rtRating || c.rtRating < f.rtRatingMin))
          return false;
        if (f.userRatingMin > 0 && (!c.rating || c.rating < f.userRatingMin))
          return false;
        return true;
      });
    },
    [filters]
  );

  // Fetch
  const getWatchlist = useCallback(async () => {
    if (!token) return [];
    try {
      const { data } = await axiosClient.get<WatchlistItem[]>("/watchlist");
      setAllContents(data);
      setFilteredContents(filterContentList(data));
      return data;
    } catch (err) {
      console.error("Failed to load watchlist", err);
      return [];
    }
  }, [token, filterContentList]);

  useEffect(() => {
    getWatchlist();
  }, [getWatchlist]);

  // Apply Filters
  useEffect(() => {
    setFilteredContents(filterContentList(allContents));
  }, [filters, allContents, filterContentList]);

  // CRUD
  const addToWatchlist = useCallback(
    async (item: { id: string; type: "movie" | "tv" }) => {
      if (!token) return;
      try {
        const { data } = await axiosClient.post<
          WatchlistItem | { content: WatchlistItem }
        >("/watchlist", {
          tmdbId: item.id,
          type: item.type,
        });
        const newContent: WatchlistItem =
          (data as any).content ?? (data as WatchlistItem);
        setAllContents((prev) => {
          const updated = [...prev, newContent];
          setFilteredContents(filterContentList(updated));
          return updated;
        });
      } catch (err) {
        console.error("Failed to add to watchlist", err);
      }
    },
    [token, filterContentList]
  );

  const removeFromWatchlist = useCallback(
    async (tmdbId: string) => {
      if (!token) return;
      try {
        await axiosClient.delete(`/watchlist/${tmdbId}`);
        setAllContents((prev) => {
          const updated = prev.filter((i) => i.tmdbId !== tmdbId);
          setFilteredContents(filterContentList(updated));
          return updated;
        });
      } catch (err) {
        console.error("Failed to remove from watchlist", err);
      }
    },
    [token, filterContentList]
  );

  const isInWatchlist = useCallback(
    (id: string) => allContents.some((i) => i.tmdbId === id),
    [allContents]
  );

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
      const content = allContents.find((i) => i.tmdbId === tmdbId);
      if (!content) return;
      await axiosClient.post('/ratings', {
        tmdbId,
        rating: score,
        contentType: content.type,
      });
      setIsRatingSubmitted(true);
      setTimeout(() => stopRating(), 500);
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedContentId) return;
      if (e.key === "Escape") return stopRating();
      if (e.repeat || e.key === "Backspace") return;
      e.preventDefault();

      if (/[0-9]/.test(e.key)) {
        setRatingScore((prev) =>
          prev === "" || prev.endsWith(".") ? prev + e.key : e.key
        );
        if (parseFloat(ratingScore) > 10) setRatingScore("10");
      } else if (e.key === ".") {
        if (!ratingScore.includes(".") && ratingScore !== "") {
          setRatingScore((prev) => prev + ".");
        }
      } else if (e.key === "Enter") {
        submitRating(selectedContentId);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedContentId, ratingScore]);

  return {
    allContents,
    filteredContents,
    filters,
    showFilters,
    toggleFilters: () => setShowFilters((s) => !s),
    hasActiveFilters,
    updateFilters,
    resetFilters,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    startRating,
    stopRating,
    submitRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
  };
}
