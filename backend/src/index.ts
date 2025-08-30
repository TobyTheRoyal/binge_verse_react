import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import mongoose from 'mongoose';
import { UsersService } from './services/usersService';
import { AuthService } from './services/authService';
import { ContentService } from './services/contentService';
import { WatchlistService } from './services/watchlistService';
import { RatingsService } from './services/ratingsService';
import { MoviesService } from './services/moviesService';
import { createAuthRouter } from './routes/auth';
import { createContentRouter } from './routes/content';
import { createWatchlistRouter } from './routes/watchlist';
import { createRatingsRouter } from './routes/ratings';
import { createMoviesRouter } from './routes/movies';
import { createUsersRouter } from './routes/users';

dotenv.config();

const app = express();
app.use(express.json());

// Services
const usersService = new UsersService();
const authService = new AuthService(usersService);
const contentService = new ContentService();
const watchlistService = new WatchlistService();
const ratingsService = new RatingsService();
const moviesService = new MoviesService(contentService);

// Schedule cache updates replacing Nest ScheduleModule with node-cron
cron.schedule('0 2 * * *', () => contentService.updateHomeCaches());

// Routes


const port = process.env.PORT || 3000;
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Routes
    app.use('/auth', createAuthRouter(authService));
    app.use('/content', createContentRouter(contentService));
    app.use('/watchlist', createWatchlistRouter(watchlistService));
    app.use('/ratings', createRatingsRouter(ratingsService));
    app.use('/movies', createMoviesRouter(moviesService));
    app.use('/users', createUsersRouter(usersService));

    app.listen(port, () => {
      console.log(`Express server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

start();