import { Home } from '../pages/Home';
import { Profile } from '../pages/Profile';
import { RouteObject } from 'react-router-dom';

export type AppRoute = RouteObject & {
  label?: string;
};

export const routes: AppRoute[] = [
  {
    path: '/',
    element: <Home />,
    label: 'Home',
  },
  {
    path: '/profile',
    element: <Profile />,
    label: 'Profile',
  },
];
