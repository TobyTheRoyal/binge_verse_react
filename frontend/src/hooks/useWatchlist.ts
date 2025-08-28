import { useState } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

export interface WatchlistItem {
  id: number | string;
  rating?: number;
  [key: string]: any;
}

export default function useWatchlist() {
  const { token } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const getWatchlist = async (): Promise<WatchlistItem[]> => {
    const { data } = await axios.get('/watchlist', { headers: authHeaders });
    setWatchlist(data);
    return data;
  };

  const addToWatchlist = async (item: WatchlistItem): Promise<WatchlistItem> => {
    const { data } = await axios.post('/watchlist', item, { headers: authHeaders });
    setWatchlist(prev => [...prev, data]);
    return data;
  };

  const removeFromWatchlist = async (id: number | string): Promise<void> => {
    await axios.delete(`/watchlist/${id}`, { headers: authHeaders });
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const setRating = async (id: number | string, rating: number): Promise<void> => {
    await axios.put(`/watchlist/${id}`, { rating }, { headers: authHeaders });
    setWatchlist(prev =>
      prev.map(item => (item.id === id ? { ...item, rating } : item))
    );
  };

  const isInWatchlist = (id: number | string): boolean => {
    return watchlist.some(item => item.id === id);
  };

  return {
    watchlist,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    setRating,
    isInWatchlist,
  };
}