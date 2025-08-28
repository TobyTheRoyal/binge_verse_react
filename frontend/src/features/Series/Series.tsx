import React, { useEffect } from 'react';
import { useSeries } from '../../hooks/useSeries';

const Series: React.FC = () => {
  const { series, fetchPopular } = useSeries();

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return (
    <div>
      <h2>Series</h2>
      <ul>
        {series.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Series;