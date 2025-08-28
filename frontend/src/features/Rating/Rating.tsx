import React, { useEffect } from 'react';
import { useRatings } from '../../hooks/useRatings';

const Rating: React.FC = () => {
  const { ratings, load } = useRatings();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h2>Ratings</h2>
      <ul>
        {ratings.map((r) => (
          <li key={r.tmdbId}>{r.tmdbId}: {r.rating}</li>
        ))}
      </ul>
    </div>
  );
};

export default Rating;