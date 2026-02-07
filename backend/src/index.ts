import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import cors from 'cors';
import mongoose from 'mongoose';
import { UsersService } from './services/usersService';
import { AuthService } from './services/authService';
import { ContentService } from './services/contentService';
import { WatchlistService } from './services/watchlistService';
import { RatingsService } from './services/ratingsService';
import { MoviesService } from './services/moviesService';
import { SeriesService } from './services/seriesService';
import { createAuthRouter } from './routes/auth';
import { createContentRouter } from './routes/content';
import { createWatchlistRouter } from './routes/watchlist';
import { createRatingsRouter } from './routes/ratings';
import { createMoviesRouter } from './routes/movies';
import { createSeriesRouter } from './routes/series';
import { createUsersRouter } from './routes/users';

dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Services
const usersService = new UsersService();
const authService = new AuthService(usersService);
const contentService = new ContentService();
const watchlistService = new WatchlistService(contentService);
const ratingsService = new RatingsService(contentService);
const moviesService = new MoviesService(contentService, ratingsService);
const seriesService = new SeriesService(contentService, ratingsService);

// Schedule cache updates replacing Nest ScheduleModule with node-cron
cron.schedule('0 2 * * *', () => contentService.updateHomeCaches());

// Routes


const port = Number(process.env.PORT || 8080);
const mongodbUri = process.env.MONGODB_URI;
async function start() {
  try {
    if (!mongodbUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    // Routes
    app.use('/auth', createAuthRouter(authService));
    app.use('/content', createContentRouter(contentService));
    app.use('/watchlist', createWatchlistRouter(watchlistService));
    app.use('/ratings', createRatingsRouter(ratingsService));
    app.use('/movies', createMoviesRouter(moviesService));
    app.use('/series', createSeriesRouter(seriesService));
    app.use('/users', createUsersRouter(usersService));

    app.listen(port, '0.0.0.0', () => {
      console.log(`Express server running on 0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

start();
