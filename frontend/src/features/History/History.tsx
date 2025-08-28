import React, { useEffect } from 'react';
import { useHistory as useHistoryHook } from '../../hooks/useHistory';

const History: React.FC = () => {
  const { items, load } = useHistoryHook();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h2>History</h2>
      <ul>
        {items.map((h) => (
          <li key={h.id}>{h.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default History;