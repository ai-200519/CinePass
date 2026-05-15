import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';
import AdminCinemasPage from '../pages/admin/AdminCinemasPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFilmsPage from '../pages/admin/AdminFilmsPage';
import AdminParametresPage from '../pages/admin/AdminParametresPage';
import AdminRapportsPage from '../pages/admin/AdminRapportsPage';
import AdminReservationsPage from '../pages/admin/AdminReservationsPage';
import AdminSallesPage from '../pages/admin/AdminSallesPage';
import AdminSeancesPage from '../pages/admin/AdminSeancesPage';
import AdminTarificationPage from '../pages/admin/AdminTarificationPage';
import AdminUtilisateursPage from '../pages/admin/AdminUtilisateursPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import BookingHistoryPage from '../pages/BookingHistoryPage';
import FilmDetailPage from '../pages/FilmDetailPage';
import HomePage from '../pages/HomePage';
import ReservationsPage from '../pages/ReservationsPage';
import SeatSelectionPage from '../pages/SeatSelectionPage';
import TicketPage from '../pages/TicketPage';
import UserProfilePage from '../pages/UserProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'films/:id', element: <FilmDetailPage /> },
      { path: 'seances/:id/seats', element: <SeatSelectionPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'historique', element: <BookingHistoryPage /> },
      { path: 'reservations/:id/ticket', element: <TicketPage /> },
      { path: 'profil', element: <UserProfilePage /> },
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
      { path: 'tarifs', element: <AdminTarificationPage /> },
      { path: 'reservations', element: <AdminReservationsPage /> },
      { path: 'utilisateurs', element: <AdminUtilisateursPage /> },
      { path: 'rapports', element: <AdminRapportsPage /> },
      { path: 'parametres', element: <AdminParametresPage /> },
    ],
  },
]);