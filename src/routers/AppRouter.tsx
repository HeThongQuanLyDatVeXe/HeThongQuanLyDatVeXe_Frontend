import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { LandingPage } from '../pages/LandingPage';
import { RoutesPage } from '../pages/RoutesPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminRolesPage } from '../pages/AdminRolesPage';
import { AdminPermissionsPage } from '../pages/AdminPermissionsPage';
import { GoogleCallbackPage } from '../pages/GoogleCallbackPage';
import { useAuth } from '../hooks/user-service/useAuth';
import { TripDetailPage } from '../pages/TripDetailPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingSuccessfulPage } from '../pages/BookingSuccessfulPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to={ROUTES.PROFILE} replace /> : <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
    }

    const hasAdminRole = user?.roles?.some((role) => role.name.toLowerCase().includes('admin'));
    return hasAdminRole ? <>{children}</> : <Navigate to={ROUTES.HOME} replace />;
};

export const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.HOME} element={<LandingPage />} />
                <Route path={ROUTES.ROUTES} element={<RoutesPage />} />
                <Route path={ROUTES.TRIP_DETAIL} element={<TripDetailPage />} />
                <Route path={ROUTES.SEAT_SELECTION} element={<SeatSelectionPage />} />
                <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                <Route path={ROUTES.BOOKING_SUCCESSFUL} element={<BookingSuccessfulPage />} />

                <Route
                    path={ROUTES.LOGIN}
                    element={(
                        <PublicOnlyRoute>
                            <LoginPage />
                        </PublicOnlyRoute>
                    )}
                />

                <Route
                    path={ROUTES.REGISTER}
                    element={(
                        <PublicOnlyRoute>
                            <RegisterPage />
                        </PublicOnlyRoute>
                    )}
                />

                <Route
                    path={ROUTES.PROFILE}
                    element={(
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    )}
                />

                <Route
                    path={ROUTES.MY_BOOKINGS}
                    element={(
                        <ProtectedRoute>
                            <MyBookingsPage />
                        </ProtectedRoute>
                    )}
                />

                <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallbackPage />} />
                <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />

                <Route
                    path={ROUTES.ADMIN_DASHBOARD}
                    element={(
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_USERS}
                    element={(
                        <AdminRoute>
                            <AdminUsersPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_ROLES}
                    element={(
                        <AdminRoute>
                            <AdminRolesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_PERMISSIONS}
                    element={(
                        <AdminRoute>
                            <AdminPermissionsPage />
                        </AdminRoute>
                    )}
                />

                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </BrowserRouter>
    );
};
