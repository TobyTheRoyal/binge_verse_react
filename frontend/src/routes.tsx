import Home from './features/Home';
import Register from './features/Auth/Register';
import Login from './features/Auth/Login';
import Watchlist from './features/Watchlist/Watchlist';
import Movies from './features/Movies/Movies';
import MovieDetail from './features/MovieDetail/MovieDetail';
import Series from './features/Series/Series';
import SeriesDetail from './features/SeriesDetail/SeriesDetail';
import Rating from './features/Rating/Rating';
import History from './features/History/History';
import Profile from './features/Profile';
import Reviews from './features/Reviews';

export interface RouteConfig {
  path: string;
  Component: React.FC;
  requiresAuth?: boolean;
}

const routes: RouteConfig[] = [
  { path: '/', Component: Home },
  { path: '/auth/register', Component: Register },
  { path: '/auth/login', Component: Login },
  { path: '/watchlist', Component: Watchlist, requiresAuth: true },
  { path: '/movies', Component: Movies, requiresAuth: true },
  { path: '/movies/:id', Component: MovieDetail, requiresAuth: true },
  { path: '/series', Component: Series, requiresAuth: true },
  { path: '/series/:id', Component: SeriesDetail, requiresAuth: true },
  { path: '/ratings', Component: Rating, requiresAuth: true },
  { path: '/history', Component: History, requiresAuth: true },
  { path: '/profile', Component: Profile, requiresAuth: true },
  { path: '/reviews', Component: Reviews, requiresAuth: true },
];

export default routes;