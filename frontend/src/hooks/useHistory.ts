import { useCallback, useState } from 'react';
import { apiFetch } from '../api/client';

interface HistoryItem {
  id: string;
  title: string;
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const load = useCallback(async () => {
    const res = await apiFetch('/api/history', { auth: true });
    const data = await res.json();
    setItems(data);
  }, []);

  return { items, load };
}