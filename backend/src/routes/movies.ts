import { Router, Request, Response } from 'express';
import { MoviesService } from '../services/moviesService';

export const createMoviesRouter = (moviesService: MoviesService) => {
  const router = Router();

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

    let filters: any = {};
    if (typeof req.query.filters === 'string') {
      try {
        filters = JSON.parse(req.query.filters as string);
      } catch {
        // ignore parse errors
      }
    }
    
    if (req.query.genres) filters.genres = parseArray(req.query.genres);
    if (req.query.releaseYear)
      filters.releaseYear = parseInt(req.query.releaseYear as string, 10);
    if (req.query.imdbRating)
      filters.imdbRating = parseFloat(req.query.imdbRating as string);
    if (req.query.rtRating)
      filters.rtRating = parseFloat(req.query.rtRating as string);
    if (req.query.providers) filters.providers = parseArray(req.query.providers);

    const movies = await moviesService.listTrendingMovies(page, filters);
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