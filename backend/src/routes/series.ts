import { Router, Request, Response } from 'express';
import { SeriesService } from '../services/seriesService';

export const createSeriesRouter = (seriesService: SeriesService) => {
  const router = Router();

  router.get('/', async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    let filters: any = {};
    if (typeof req.query.filters === 'string') {
      try {
        filters = JSON.parse(req.query.filters as string);
      } catch {
        // ignore parse errors
      }
    }
    const series = await seriesService.listSeries(page, filters);
    res.json(series);
  });

  router.get(
    '/:tmdbId',
    async (req: Request, res: Response): Promise<void> => {
      const show = await seriesService.findByTmdbId(req.params.tmdbId);
      if (!show) {
        res.status(404).json({ message: 'Not found' });
        return;
      }
      res.json(show);
    },
  );

  return router;
};