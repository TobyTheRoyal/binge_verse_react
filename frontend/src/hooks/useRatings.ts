import { useState, useCallback } from 'react';
import axios from 'axios';

type RatingsMap = Record<string, number>;

interface UseRatingsResult {
  ratings: RatingsMap;
  fetchUserRatings: () => Promise<RatingsMap>;
  rateContent: (contentId: string, rating: number) => Promise<void>;
  getRating: (contentId: string) => number | undefined;
}

/**
 * React hook to manage user ratings with caching.
 *
 * @param token Auth token used for API requests.
 */
export function useRatings(token: string): UseRatingsResult {
  const [ratings, setRatings] = useState<RatingsMap>({});

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchUserRatings = useCallback(async () => {
    const res = await axios.get<RatingsMap>('/api/ratings', {
      headers: authHeader,
    });
    setRatings(res.data);
    return res.data;
  }, [token]);

  const rateContent = useCallback(
    async (contentId: string, rating: number) => {
      await axios.post(
        '/api/ratings',
        { contentId, rating },
        { headers: authHeader }
      );
      // Update local cache to avoid re-fetching
      setRatings((prev) => ({ ...prev, [contentId]: rating }));
    },
    [token]
  );

  const getRating = useCallback(
    (contentId: string) => ratings[contentId],
    [ratings]
  );

  return { ratings, fetchUserRatings, rateContent, getRating };
}

export default useRatings;