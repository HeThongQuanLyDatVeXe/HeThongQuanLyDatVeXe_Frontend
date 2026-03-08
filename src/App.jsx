import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SearchPage from "./pages/booking/SearchPage";
import SeatsPage from "./pages/booking/SeatsPage";
import ConfirmPage from "./pages/booking/ConfirmPage";
import MyTickets from "./pages/booking/MyTickets";
import ProfilePage from "./pages/auth/ProfilePage";
import AdminPage from "./pages/admin/AdminPage";
import { isAdminByRoles } from "./utils/auth";

function Guard({ admin = false }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (admin && !isAdminByRoles(user?.roles || []))
    return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route element={<Guard />}>
          <Route path="/booking/:id/seats" element={<SeatsPage />} />
          <Route path="/booking/confirm" element={<ConfirmPage />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<Guard admin />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
