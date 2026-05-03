import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFilmsPage from '../pages/admin/AdminFilmsPage';
import AdminParametresPage from '../pages/admin/AdminParametresPage';
import AdminRapportsPage from '../pages/admin/AdminRapportsPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminSallesPage from '../pages/admin/AdminSallesPage';
import AdminSeancesPage from '../pages/admin/AdminSeancesPage';
import AdminCinemasPage from '../pages/admin/AdminCinemasPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'films', element: <AdminFilmsPage /> },
      { path: 'cinemas', element: <AdminCinemasPage /> },
      { path: 'seances', element: <AdminSeancesPage /> },
      { path: 'salles', element: <AdminSallesPage /> },
      { path: 'reservations', element: <AdminReservationsPage /> },
      { path: 'rapports', element: <AdminRapportsPage /> },
      { path: 'parametres', element: <AdminParametresPage /> },
    ],
  },
]);
