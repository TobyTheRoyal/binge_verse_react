import axios from 'axios';
import { Content } from '../types/content';
import { FilterOptions } from '../hooks/useFilters';

const apiUrl = process.env.REACT_APP_API_URL || '';

export const getTrending = async (): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/trending`);
  return data;
};

export const getTopRated = async (): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/top-rated`);
  return data;
};

export const getNewReleases = async (): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/new-releases`);
  return data;
};

export const getAllMovies = async (pages: number = 5): Promise<Content[]> => {
  const requests = [];
  for (let page = 1; page <= pages; page++) {
    requests.push(
      axios.get<Content[]>(`${apiUrl}/content/movies-page`, { params: { page } })
    );
  }
  const responses = await Promise.all(requests);
  return responses.flatMap(r => r.data);
};

export const getAllMoviesCached = async (page: number = 1): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/movies-page`, {
    params: { page },
  });
  return data;
};

export const getAllSeriesCached = async (page: number = 1): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/series-page`, {
    params: { page },
  });
  return data;
};

export const getGenres = async (): Promise<string[]> => {
  const { data } = await axios.get<string[]>(`${apiUrl}/content/genres`);
  return data;
};

export const getFilteredMovies = async (
  filters: FilterOptions,
  page: number = 1
): Promise<Content[]> => {
  const params: any = {
    page,
    genre: filters.genres.join(','),
    releaseYearMin: filters.releaseYearMin,
    releaseYearMax: filters.releaseYearMax,
    imdbRatingMin: filters.imdbRatingMin,
    rtRatingMin: filters.rtRatingMin,
  };

  if (filters.providers.length) {
    params.provider = filters.providers.join(',');
  }

  const { data } = await axios.get<Content[]>(`${apiUrl}/content/movies-page`, {
    params,
  });
  return data;
};

export const getFilteredSeries = async (
  filters: FilterOptions,
  page: number = 1
): Promise<Content[]> => {
  const params: any = {
    page,
    genre: filters.genres.join(','),
    releaseYearMin: filters.releaseYearMin,
    releaseYearMax: filters.releaseYearMax,
    imdbRatingMin: filters.imdbRatingMin,
    rtRatingMin: filters.rtRatingMin,
  };

  if (filters.providers.length) {
    params.provider = filters.providers.join(',');
  }

  const { data } = await axios.get<Content[]>(`${apiUrl}/content/series-page`, {
    params,
  });
  return data;
};

export const getMoviesPage = async (page: number): Promise<Content[]> => {
  const { data } = await axios.get<Content[]>(`${apiUrl}/content/movies-page`, {
    params: { page },
  });
  return data;
};

export const searchTmdb = async (query: string): Promise<Content[]> => {
  if (!query.trim()) {
    return [];
  }
  const { data } = await axios.post<Content[]>(`${apiUrl}/content/search`, {
    query,
  });
  return data;
};

export const getMovieDetails = async (tmdbId: string): Promise<Content> => {
  const { data } = await axios.post<Content>(`${apiUrl}/content/add-tmdb`, {
    tmdbId,
    type: 'movie',
  });
  return data;
};

export const getSeriesDetails = async (tmdbId: string): Promise<Content> => {
  const { data } = await axios.post<Content>(`${apiUrl}/content/add-tmdb`, {
    tmdbId,
    type: 'tv',
  });
  return data;
};