import { ContentModel } from '../models/content';

export interface Content {
  id: number;
  tmdbId: string;
  title: string;
  releaseYear: number;
  poster: string;
  type: 'movie' | 'tv';
  imdbRating?: number | null;
  rtRating?: number | null;
  overview?: string;
  genres?: string[];
  providers?: string[];
  cast?: {
    tmdbId: number;
    name: string;
    character: string;
    profilePathUrl: string;
  }[];
}

export class ContentService {
  private static readonly CONTENT_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h
  private cacheTrending: Content[] = [];
  private cacheTopRated: Content[] = [];
  private cacheNewReleases: Content[] = [];
  private cacheTrendingSeries: Content[] = [];
  private cacheTopRatedSeries: Content[] = [];
  private updatingHome = false;
  private trendingMoviesPageCache = new Map<number, Content[]>();
  private trendingSeriesPageCache = new Map<number, Content[]>();
  private homeItemCache = new Map<string, Content>();
  private omdbCache = new Map<string, { imdbRating: number | null; rtRating: number | null }>();
  private genresCache: string[] = [];

  private getCacheKey(tmdbId: string | number, type: 'movie' | 'tv'): string {
    return `${type}-${tmdbId}`;
  }

  private mapDocToContent(doc: any): Content {
    return {
      id: Number(doc.tmdbId),
      tmdbId: doc.tmdbId,
      title: doc.title,
      releaseYear: doc.releaseYear ?? 0,
      poster: doc.poster ?? '',
      type: doc.type,
      imdbRating: doc.imdbRating ?? null,
      rtRating: doc.rtRating ?? null,
      overview: doc.overview ?? undefined,
      genres: Array.isArray(doc.genres) ? doc.genres : undefined,
      providers: Array.isArray(doc.providers) ? doc.providers : undefined,
      cast: Array.isArray(doc.cast)
        ? doc.cast.map((c: any) => ({
            tmdbId: c.tmdbId,
            name: c.name,
            character: c.character,
            profilePathUrl: c.profilePathUrl,
          }))
        : undefined,
    };
  }

  private isFresh(lastSyncedAt?: Date): boolean {
    if (!lastSyncedAt) return false;
    return Date.now() - new Date(lastSyncedAt).getTime() < ContentService.CONTENT_CACHE_TTL_MS;
  }

  private async getCachedContent(
    tmdbId: string,
    type: 'movie' | 'tv',
  ): Promise<{ content: Content; fresh: boolean } | null> {
    const doc = await ContentModel.findOne({ tmdbId, type }).lean().exec();
    if (!doc) return null;
    return {
      content: this.mapDocToContent(doc),
      fresh: this.isFresh(doc.lastSyncedAt as Date | undefined),
    };
  }

  private async upsertCachedContent(content: Content): Promise<void> {
    await ContentModel.findOneAndUpdate(
      { tmdbId: content.tmdbId, type: content.type },
      {
        cacheKey: this.getCacheKey(content.tmdbId, content.type),
        tmdbId: content.tmdbId,
        type: content.type,
        title: content.title,
        releaseYear: content.releaseYear,
        poster: content.poster,
        imdbRating: content.imdbRating ?? null,
        rtRating: content.rtRating ?? null,
        overview: content.overview ?? null,
        genres: content.genres ?? [],
        providers: content.providers ?? [],
        cast: content.cast ?? [],
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async updateHomeCaches() {
    if (this.updatingHome) return;
    this.updatingHome = true;
    try {
      this.cacheTrending = await this.fetchHomeList('/trending/movie/week', 'movie');
      this.cacheTopRated = await this.fetchHomeList('/movie/top_rated', 'movie');
      this.cacheNewReleases = await this.fetchHomeList('/movie/now_playing', 'movie');
      this.cacheTrendingSeries = await this.fetchHomeList('/trending/tv/week', 'tv');
      this.cacheTopRatedSeries = await this.fetchHomeList('/tv/top_rated', 'tv');
    } catch (err) {
      console.error('Failed to update home caches', err);
    } finally {
      this.updatingHome = false;
    }
  }

  private async fetchHomeList(endpoint: string, type: 'movie' | 'tv'): Promise<Content[]> {
    const url = `https://api.themoviedb.org/3${endpoint}?api_key=${process.env.TMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB request failed');
      }
      const items = await Promise.all(
        (data.results || []).slice(0, 20).map((r: any) => this.fetchHomeItem(r.id, type))
      );
      return items.filter(Boolean) as Content[];
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}`, err);
      return [];
    }
  }

  private async fetchHomeItem(id: number, type: 'movie' | 'tv'): Promise<Content | null> {
    const cacheKey = `${type}-${id}`;
    if (this.homeItemCache.has(cacheKey)) {
      return this.homeItemCache.get(cacheKey)!;
    }
    const cached = await this.getCachedContent(String(id), type);
    if (cached?.fresh) {
      this.homeItemCache.set(cacheKey, cached.content);
      return cached.content;
    }
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}${
      type === 'tv' ? '&append_to_response=external_ids' : ''
    }`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB movie request failed');
      }
      const content: Content = {
        id: data.id,
        tmdbId: String(data.id),
        title: type === 'tv' ? data.name : data.title,
        releaseYear: (type === 'tv' ? data.first_air_date : data.release_date)
          ? parseInt((type === 'tv' ? data.first_air_date : data.release_date).slice(0, 4), 10)
          : 0,
        poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : '',
        type,
        imdbRating:
          typeof data.vote_average === 'number'
            ? Number(data.vote_average.toFixed(1))
            : null,
      };
      const imdbId = data.imdb_id || data.external_ids?.imdb_id;
      if (imdbId) {
        const omdb = await this.fetchOmdbData(imdbId);
        if (omdb) {
          content.imdbRating = omdb.imdbRating ?? null;
          content.rtRating = omdb.rtRating ?? null;
        }
      }
      this.homeItemCache.set(cacheKey, content);
      await this.upsertCachedContent(content);
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
    if (this.omdbCache.has(imdbId)) {
      return this.omdbCache.get(imdbId)!;
    }
    if (!process.env.OMDB_API_KEY) {
      return { imdbRating: null, rtRating: null };
    }
    const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.Response === 'False') {
          const empty = { imdbRating: null, rtRating: null };
          this.omdbCache.set(imdbId, empty);
          return empty;
        }
        const imdbRating = parseFloat(data.imdbRating) || null;
        let rtRating: number | null = null;
        if (Array.isArray(data.Ratings)) {
          const rt = data.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
          if (rt && typeof rt.Value === 'string') {
            rtRating = parseInt(rt.Value.replace('%', ''), 10);
          }
        }
        const parsed = { imdbRating, rtRating };
        this.omdbCache.set(imdbId, parsed);
        return parsed;
      } catch (err) {
        if (attempt === 3) {
          console.error(`Failed to fetch OMDb data for ${imdbId}`, err);
          return { imdbRating: null, rtRating: null };
        }
        await new Promise(resolve => setTimeout(resolve, 300 * attempt));
      }
    }
    return { imdbRating: null, rtRating: null };
  }

  async getContentDetails(
    tmdbId: string,
    type: 'movie' | 'tv'
  ): Promise<Content | null> {
    const cached = await this.getCachedContent(tmdbId, type);
    if (cached?.fresh && cached.content.overview && cached.content.cast?.length) {
      return cached.content;
    }

    const apiKey = process.env.TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&append_to_response=external_ids,credits,watch/providers`;
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
        overview: data.overview || '',
        imdbRating:
          typeof data.vote_average === 'number'
            ? Number(data.vote_average.toFixed(1))
            : null,
        genres: Array.isArray(data.genres)
          ? data.genres.map((g: any) => g.name)
          : undefined,
      };
      const providerData = data['watch/providers']?.results?.DE;
      if (providerData) {
        const mapProviders = (arr: any[]) => arr.map((p: any) => p.provider_name);
        const providersSet = new Set<string>();
        ['flatrate', 'rent', 'buy', 'ads'].forEach(key => {
          if (Array.isArray(providerData[key])) {
            mapProviders(providerData[key]).forEach(name => providersSet.add(name));
          }
        });
        if (providersSet.size > 0) {
          content.providers = Array.from(providersSet);
        }
      }

      if (data.credits?.cast && Array.isArray(data.credits.cast)) {
        content.cast = data.credits.cast.slice(0, 10).map((c: any) => ({
          tmdbId: c.id,
          name: c.name,
          character: c.character,
          profilePathUrl: c.profile_path
            ? `https://image.tmdb.org/t/p/w500${c.profile_path}`
            : '',
        }));
      }
      const imdbId = data.imdb_id || data.external_ids?.imdb_id;
      let omdb: { imdbRating: number | null; rtRating: number | null } | null = null;
      if (imdbId) {
        omdb = await this.fetchOmdbData(imdbId);
      }
      if (omdb) {
        content.imdbRating = omdb.imdbRating ?? null;
        content.rtRating = omdb.rtRating ?? null;
      }
      await this.upsertCachedContent(content);
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

  async getTrendingSeries(): Promise<Content[]> {
    if (this.cacheTrendingSeries.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTrendingSeries;
  }

  async getTopRatedSeries(): Promise<Content[]> {
    if (this.cacheTopRatedSeries.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTopRatedSeries;
  }

  async fetchTrendingMovies(page: number): Promise<Content[]> {
    if (this.trendingMoviesPageCache.has(page)) {
      return this.trendingMoviesPageCache.get(page)!;
    }
    const url = `https://api.themoviedb.org/3/trending/movie/week?page=${page}&api_key=${process.env.TMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB request failed');
      }
      const items = await Promise.all(
        (data.results || []).map((r: any) => this.fetchHomeItem(r.id, 'movie'))
      );
      const filtered = items.filter(Boolean) as Content[];
      this.trendingMoviesPageCache.set(page, filtered);
      return filtered;
    } catch (err) {
      console.error(`Failed to fetch trending movies page ${page}`, err);
      return [];
    }
  }

  async fetchTrendingSeries(page: number): Promise<Content[]> {
    if (this.trendingSeriesPageCache.has(page)) {
      return this.trendingSeriesPageCache.get(page)!;
    }
    const url = `https://api.themoviedb.org/3/trending/tv/week?page=${page}&api_key=${process.env.TMDB_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.status_message || 'TMDB request failed');
      }
      const items = await Promise.all(
        (data.results || []).map((r: any) => this.fetchHomeItem(r.id, 'tv'))
      );
      const filtered = items.filter(Boolean) as Content[];
      this.trendingSeriesPageCache.set(page, filtered);
      return filtered;
    } catch (err) {
      console.error(`Failed to fetch trending series page ${page}`, err);
      return [];
    }
  }

  async getGenres(): Promise<string[]> {
    if (this.genresCache.length > 0) {
      return this.genresCache;
    }

    const apiKey = process.env.TMDB_API_KEY;
    const endpoints = [
      'https://api.themoviedb.org/3/genre/movie/list',
      'https://api.themoviedb.org/3/genre/tv/list',
    ];

    try {
      const genreSet = new Set<string>();
      for (const endpoint of endpoints) {
        const res = await fetch(`${endpoint}?api_key=${apiKey}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.genres)) {
          data.genres.forEach((g: any) => {
            if (g && typeof g.name === 'string') {
              genreSet.add(g.name);
            }
          });
        }
      }
      this.genresCache = Array.from(genreSet).sort();
      return this.genresCache;
    } catch (err) {
      console.error('Failed to fetch genres', err);
      return [];
    }
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
