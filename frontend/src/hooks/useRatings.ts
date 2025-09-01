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
  const fetchUserRatings = useCallback(async (tmdbIds: string[]) => {
    try {
      const results = await Promise.allSettled(
        tmdbIds.map((id) =>
          axiosClient.get<RatingItem>(`/ratings/${id}`)
        )
      );
      const fetched: RatingItem[] = [];
      results.forEach((res) => {
        if (res.status === "fulfilled") {
          fetched.push(res.value.data);
        }
      });

      setRatings(fetched);
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
