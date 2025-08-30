import { useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";

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
      const { data } = await axiosClient.get('/api/ratings');
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
      await axiosClient.post('/api/ratings', {
        contentId: selectedContentId,
        score,
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
