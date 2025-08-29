import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "./useAuth";
import { useFilters, FilterOptions } from "./useFilters";

export interface WatchlistItem {
  tmdbId: string;
  title: string;
  releaseYear?: number;
  poster?: string;
  imdbRating?: number;
  rtRating?: number;
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

  // Fetch
  const getWatchlist = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await apiFetch("/api/watchlist/user", { auth: true });
      const data = await res.json();
      setAllContents(data);
      return data;
    } catch (err) {
      console.error("Failed to load watchlist", err);
      return [];
    }
  }, [token]);

  useEffect(() => {
    getWatchlist();
  }, [getWatchlist]);

  // Apply Filters
  useEffect(() => {
    const f: FilterOptions = filters;
    setFilteredContents(
      allContents.filter((c) => {
        if (f.genres.length && !(c.genres || []).some((g) => f.genres.includes(g))) return false;
        if (f.providers.length && !(c.providers || []).some((p) => f.providers.includes(p)))
          return false;
        if (c.releaseYear && (c.releaseYear < f.releaseYearMin || c.releaseYear > f.releaseYearMax))
          return false;
        if (f.imdbRatingMin > 0 && (!c.imdbRating || c.imdbRating < f.imdbRatingMin)) return false;
        if (f.rtRatingMin > 0 && (!c.rtRating || c.rtRating < f.rtRatingMin)) return false;
        return true;
      })
    );
  }, [filters, allContents]);

  // CRUD
  const removeFromWatchlist = useCallback(
    async (tmdbId: string) => {
      if (!token) return;
      try {
        await apiFetch(`/api/watchlist/user/${tmdbId}`, { method: "DELETE", auth: true });
        setAllContents((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
      } catch (err) {
        console.error("Failed to remove from watchlist", err);
      }
    },
    [token]
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
      await apiFetch("/api/ratings", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, score }),
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
    showFilters,
    toggleFilters: () => setShowFilters((s) => !s),
    hasActiveFilters,
    updateFilters,
    resetFilters,
    removeFromWatchlist,
    startRating,
    stopRating,
    submitRating,
    selectedContentId,
    ratingScore,
    setRatingScore,
    isRatingSubmitted,
  };
}
