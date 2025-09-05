export interface Content {
  id: number;
  tmdbId: string;
  title: string;
  releaseYear: number;
  poster: string;
  type: 'movie' | 'tv';
  imdbRating?: number | null;
  rtRating?: number | null;
}

export class ContentService {
  private cacheTrending: Content[] = [];
  private cacheTopRated: Content[] = [];
  private cacheNewReleases: Content[] = [];
  private updatingHome = false;

  async updateHomeCaches() {
    if (this.updatingHome) return;
    this.updatingHome = true;
    try {
      this.cacheTrending = await this.fetchHomeList('/trending/movie/week');
      this.cacheTopRated = await this.fetchHomeList('/movie/top_rated');
      this.cacheNewReleases = await this.fetchHomeList('/movie/now_playing');
    } catch (err) {
      console.error('Failed to update home caches', err);
    } finally {
      this.updatingHome = false;
    }
  }

  private async fetchHomeList(endpoint: string): Promise<Content[]> {
    const url = `https://api.themoviedb.org/3${endpoint}?api_key=${process.env.TMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB request failed');
      }
      const items = await Promise.all(
        (data.results || []).slice(0, 20).map((r: any) => this.fetchHomeItem(r.id))
      );
      return items.filter(Boolean) as Content[];
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}`, err);
      return [];
    }
  }

  private async fetchHomeItem(id: number): Promise<Content | null> {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB movie request failed');
      }
      const content: Content = {
        id: data.id,
        tmdbId: String(data.id),
        title: data.title,
        releaseYear: data.release_date ? parseInt(data.release_date.slice(0, 4), 10) : 0,
        poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : '',
        type: 'movie',
      };
      const omdb = await this.fetchOmdbData(data.imdb_id);
      if (omdb) {
        content.imdbRating = omdb.imdbRating ?? null;
        content.rtRating = omdb.rtRating ?? null;
      }
      return content;
    } catch (err) {
      console.error(`Failed to fetch movie ${id}`, err);
      return null;
    }
  }

  private async fetchOmdbData(
    imdbId: string
  ): Promise<{ imdbRating: number | null; rtRating: number | null }> {
    if (!imdbId) {
      return { imdbRating: null, rtRating: null };
    }
    const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.Response === 'False') {
        return { imdbRating: null, rtRating: null };
      }
      const imdbRating = parseFloat(data.imdbRating) || null;
      let rtRating: number | null = null;
      if (Array.isArray(data.Ratings)) {
        const rt = data.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
        if (rt && typeof rt.Value === 'string') {
          rtRating = parseInt(rt.Value.replace('%', ''), 10);
        }
      }
      return { imdbRating, rtRating };
    } catch (err) {
      console.error(`Failed to fetch OMDb data for ${imdbId}`, err);
      return { imdbRating: null, rtRating: null };
    }
  }

  async getContentDetails(
    tmdbId: string,
    type: 'movie' | 'tv'
  ): Promise<Content | null> {
    const apiKey = process.env.TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB request failed');
      }
      const titleField = type === 'tv' ? data.name : data.title;
      const dateField =
        type === 'tv' ? data.first_air_date : data.release_date;
      const content: Content = {
        id: data.id,
        tmdbId: String(data.id),
        title: titleField || '',
        releaseYear: dateField ? parseInt(dateField.slice(0, 4), 10) : 0,
        poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : '',
        type,
      };
      const omdb = await this.fetchOmdbData(data.imdb_id);
      if (omdb) {
        content.imdbRating = omdb.imdbRating ?? null;
        content.rtRating = omdb.rtRating ?? null;
      }
      return content;
    } catch (err) {
      console.error(`Failed to fetch ${type} ${tmdbId}`, err);
      return null;
    }
  }


  async getTrending(): Promise<Content[]> {
    if (this.cacheTrending.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTrending;
  }

  async getTopRated(): Promise<Content[]> {
    if (this.cacheTopRated.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTopRated;
  }

  async getNewReleases(): Promise<Content[]> {
    if (this.cacheNewReleases.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheNewReleases;
  }

  async searchTmdb(query: string): Promise<Content[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY is not defined');
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        query,
      )}&api_key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.results || [])
      .filter(
        (result: any) => result.media_type === 'movie' || result.media_type === 'tv'
      )
      .map((result: any) => ({
        id: result.id,
        tmdbId: String(result.id),
        title: result.title || result.name || '',
        releaseYear: result.release_date
          ? parseInt(result.release_date.slice(0, 4), 10)
          : result.first_air_date
          ? parseInt(result.first_air_date.slice(0, 4), 10)
          : 0,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : '',
        type: result.media_type === 'tv' ? 'tv' : 'movie',
      }));
  }
}