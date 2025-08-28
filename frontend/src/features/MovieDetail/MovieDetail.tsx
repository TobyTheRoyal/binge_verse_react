import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';

const MovieDetail: React.FC = () => {
  const { id } = useParams();
  const { fetchDetail, selected } = useMovies();

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id, fetchDetail]);

  return (
    <div>
      <h2>Movie Detail</h2>
      {selected && (
        <div>
          <h3>{selected.title}</h3>
          <p>{selected.overview}</p>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;