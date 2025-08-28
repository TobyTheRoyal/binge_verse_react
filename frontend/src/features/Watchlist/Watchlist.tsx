import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';

const Watchlist: React.FC = () => {
  const { items } = useWatchlist();
  return (
    <div>
      <h2>Your Watchlist</h2>
      <ul>
        {items.map((item) => (
          <li key={item.tmdbId}>{item.tmdbId}</li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;