import { useState, useCallback } from "react";
import { apiFetch } from "../api/client";

export interface RatingItem {
  content: {
    id: number;
    tmdbId: string;
    type: string;
  };
  title?: string;
  poster?: string;
  score: number;
  ratedAt: string;
}

export function useRatings() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [ratingScore, setRatingScore] = useState("");

  const loadRatings = useCallback(async () => {
    try {
      const res = await apiFetch("/api/ratings", { auth: true });
      const data = await res.json();
      setRatings(data);
    } catch (err) {
      console.error("Failed to load ratings", err);
    }
  }, []);

  const openRatingModal = (contentId: number) => {
    setSelectedContentId(contentId);
    const selected = ratings.find((r) => r.content.id === contentId);
    setSelectedContentTitle(selected?.title ?? "Unknown");
    setRatingScore(selected ? String(selected.score) : "");
  };

  const closeRatingModal = () => {
    setSelectedContentId(null);
    setSelectedContentTitle("");
    setRatingScore("");
  };

  const submitRating = async () => {
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
        body: JSON.stringify({ contentId: selectedContentId, score }),
      });
      closeRatingModal();
      loadRatings();
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  return {
    ratings,
    loadRatings,
    selectedContentId,
    selectedContentTitle,
    ratingScore,
    setRatingScore,
    openRatingModal,
    closeRatingModal,
    submitRating,
  };
}
