import { useCallback, useState } from 'react';
import { apiFetch } from '../api/client';

interface SeriesItem {
  id: string;
  name: string;
  overview: string;
}

export function useSeries() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [selected, setSelected] = useState<SeriesItem | null>(null);

  const fetchPopular = useCallback(async () => {
    const res = await apiFetch('/api/series', { auth: true });
    const data = await res.json();
    setSeries(data);
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/series/${id}`, { auth: true });
    const data = await res.json();
    setSelected(data);
  }, []);

  return { series, selected, fetchPopular, fetchDetail };
}