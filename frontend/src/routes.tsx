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

interface RouteConfig {
  path: string;
  Component: React.FC;
}

const routes: RouteConfig[] = [
  { path: '/', Component: Home },
  { path: '/auth/register', Component: Register },
  { path: '/auth/login', Component: Login },
  { path: '/watchlist', Component: Watchlist },
  { path: '/movies', Component: Movies },
  { path: '/movies/:id', Component: MovieDetail },
  { path: '/series', Component: Series },
  { path: '/series/:id', Component: SeriesDetail },
  { path: '/ratings', Component: Rating },
  { path: '/history', Component: History },
  { path: '/profile', Component: Profile },
  { path: '/reviews', Component: Reviews },
];

export default routes;