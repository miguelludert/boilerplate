import { Home } from '../pages/Home';
import { RouteObject } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';

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
    element: <ProfilePage />,
    label: 'Profile',
  },
];
