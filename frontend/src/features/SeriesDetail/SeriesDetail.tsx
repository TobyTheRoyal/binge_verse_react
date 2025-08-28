import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSeries } from '../../hooks/useSeries';

const SeriesDetail: React.FC = () => {
  const { id } = useParams();
  const { fetchDetail, selected } = useSeries();

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id, fetchDetail]);

  return (
    <div>
      <h2>Series Detail</h2>
      {selected && (
        <div>
          <h3>{selected.name}</h3>
          <p>{selected.overview}</p>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;