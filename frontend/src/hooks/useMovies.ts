import { useCallback, useState } from 'react';
import { apiFetch } from '../api/client';

interface Movie {
  id: string;
  title: string;
  overview: string;
}

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);

  const fetchPopular = useCallback(async () => {
    const res = await apiFetch('/api/movies', { auth: true });
    const data = await res.json();
    setMovies(data);
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/movies/${id}`, { auth: true });
    const data = await res.json();
    setSelected(data);
  }, []);

  return { movies, selected, fetchPopular, fetchDetail };
}