import { useCallback, useState } from 'react';
import axiosClient from '../api/axiosClient';

interface HistoryItem {
  id: string;
  title: string;
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const load = useCallback(async () => {
    const { data } = await axiosClient.get<HistoryItem[]>(
      '/api/history'
    );
    setItems(data);
  }, []);

  return { items, load };
}