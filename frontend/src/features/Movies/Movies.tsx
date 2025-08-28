import React, { useEffect } from 'react';
import { useMovies } from '../../hooks/useMovies';

const Movies: React.FC = () => {
  const { movies, fetchPopular } = useMovies();

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return (
    <div>
      <h2>Movies</h2>
      <ul>
        {movies.map((m) => (
          <li key={m.id}>{m.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Movies;