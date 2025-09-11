import { Router, Request, Response } from 'express';
import { MoviesService, MovieFilters } from '../services/moviesService';
import { jwtAuth } from '../middleware/jwt';

export const createMoviesRouter = (moviesService: MoviesService) => {
  const router = Router();
  const auth = jwtAuth();

  router.use(auth);

  router.get('/', async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const parseArray = (val: any): string[] | undefined => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.map(String);
      if (typeof val === 'string') {
        return val.split(',').map(v => v.trim()).filter(Boolean);
      }
      return undefined;
    };

    let filters: Partial<MovieFilters> = {};
    if (typeof req.query.filters === 'string') {
      try {
        filters = JSON.parse(req.query.filters as string);
        if (typeof filters.releaseYearMin === 'string') {
          filters.releaseYearMin = parseInt(filters.releaseYearMin, 10);
        }
        if (typeof filters.releaseYearMax === 'string') {
          filters.releaseYearMax = parseInt(filters.releaseYearMax, 10);
        }
        if (typeof filters.imdbRatingMin === 'string') {
          filters.imdbRatingMin = parseFloat(filters.imdbRatingMin);
        }
        if (typeof filters.rtRatingMin === 'string') {
          filters.rtRatingMin = parseFloat(filters.rtRatingMin);
        }
        if (typeof filters.userRatingMin === 'string') {
          filters.userRatingMin = parseFloat(filters.userRatingMin);
        }
      } catch {
        // ignore parse errors
      }
    }

    if (req.query.genres) filters.genres = parseArray(req.query.genres);
    if (req.query.releaseYear)
      filters.releaseYear = parseInt(req.query.releaseYear as string, 10);
    if (req.query.releaseYearMin)
      filters.releaseYearMin = parseInt(req.query.releaseYearMin as string, 10);
    if (req.query.releaseYearMax)
      filters.releaseYearMax = parseInt(req.query.releaseYearMax as string, 10);
    if (req.query.imdbRating)
      filters.imdbRating = parseFloat(req.query.imdbRating as string);
    if (req.query.imdbRatingMin)
      filters.imdbRatingMin = parseFloat(req.query.imdbRatingMin as string);
    if (req.query.rtRating)
      filters.rtRating = parseFloat(req.query.rtRating as string);
    if (req.query.rtRatingMin)
      filters.rtRatingMin = parseFloat(req.query.rtRatingMin as string);
    
    if (req.query.providers) filters.providers = parseArray(req.query.providers);
    if (req.query.userRatingMin)
      filters.userRatingMin = parseFloat(req.query.userRatingMin as string);

    if (
      filters.imdbRatingMin !== undefined &&
      filters.imdbRating === undefined
    ) {
      filters.imdbRating = filters.imdbRatingMin;
    }
    if (
      filters.rtRatingMin !== undefined &&
      filters.rtRating === undefined
    ) {
      filters.rtRating = filters.rtRatingMin;
    }

    const user = (req as any).user;
    const movies = await moviesService.listTrendingMovies(page, filters, user.id);
    res.json(movies);
  });

  router.get(
    '/:tmdbId',
    async (req: Request, res: Response): Promise<void> => {
      const movie = await moviesService.findByTmdbId(req.params.tmdbId);
      if (!movie) {
        res.status(404).json({ message: 'Not found' });
        return;
      }
      res.json(movie);
    },
  );

  return router;
};