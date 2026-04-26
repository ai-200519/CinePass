import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFilmsPage from '../pages/admin/AdminFilmsPage';
import AdminParametresPage from '../pages/admin/AdminParametresPage';
import AdminRapportsPage from '../pages/admin/AdminRapportsPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminSallesPage from '../pages/admin/AdminSallesPage';
import AdminSeancesPage from '../pages/admin/AdminSeancesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'films', element: <AdminFilmsPage /> },
      { path: 'seances', element: <AdminSeancesPage /> },
      { path: 'salles', element: <AdminSallesPage /> },
      { path: 'reservations', element: <AdminReservationsPage /> },
      { path: 'rapports', element: <AdminRapportsPage /> },
      { path: 'parametres', element: <AdminParametresPage /> },
    ],
  },
]);
