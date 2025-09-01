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
  rating: number;
  ratedAt: string;
}

export function useRatings() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const fetchUserRatings = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<RatingItem[]>(
        '/ratings'
      );
      setRatings(data);
    } catch (err) {
      console.error("Failed to fetch ratings", err);
    }
  }, []);

  const rateContent = useCallback(async (tmdbId: string, rating: number) => {
    try {
      await axiosClient.post("/ratings", { tmdbId, rating });
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  }, []);

  const getRating = useCallback(
    (tmdbId: string): number | null => {
      const rating = ratings.find((r) => r.content.tmdbId === tmdbId);
      return rating ? rating.rating : null;
    },
    [ratings]
  );

  return {
    ratings,
    fetchUserRatings,
    rateContent,
    getRating,
  };
}
