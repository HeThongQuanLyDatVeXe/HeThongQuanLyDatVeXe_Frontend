import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { LandingPage } from '../pages/LandingPage';
import { RoutesPage } from '../pages/RoutesPage';
import { RouteTripsPage } from '../pages/RouteTripsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminRolesPage } from '../pages/AdminRolesPage';
import { AdminPermissionsPage } from '../pages/AdminPermissionsPage';
import { AdminRoutesPage } from '../pages/admin-routes/AdminRoutesPage';
import { AdminCitiesPage } from '../pages/admin-routes/AdminCitiesPage';
import { AdminPointsPage } from '../pages/admin-routes/AdminPointsPage';
import { AdminVehiclesPage } from '../pages/admin-vehicle/AdminVehiclesPage';
import { AdminVehicleTypesPage } from '../pages/admin-vehicle/AdminVehicleTypesPage';
import { AdminMaintenancePage } from '../pages/admin-vehicle/AdminMaintenancePage';
import { AdminSeatLayoutsPage } from '../pages/admin-vehicle/AdminSeatLayoutsPage';
import { AdminTripSeatOverridesPage } from '../pages/admin-vehicle/AdminTripSeatOverridesPage';
import { AdminTripsPage } from '../pages/admin-trip/AdminTripsPage';
import { AdminTripDetailPage } from '../pages/admin-trip/AdminTripDetailPage';
import { AdminTripTemplatesPage } from '../pages/admin-trip/AdminTripTemplatesPage';
import { AdminDriversPage } from '../pages/admin-driver/AdminDriversPage';
import { AdminDriverDetailPage } from '../pages/admin-driver/AdminDriverDetailPage';
import { AdminPricesPage } from '../pages/admin-price/AdminPricesPage';
import { GoogleCallbackPage } from '../pages/GoogleCallbackPage';
import { useAuth } from '../hooks/user-service/useAuth';
import { TripDetailPage } from '../pages/TripDetailPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingSuccessfulPage } from '../pages/BookingSuccessfulPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { BookingPage } from '../pages/BookingPage';

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
                <Route path={ROUTES.ROUTE_TRIPS} element={<RouteTripsPage />} />
                <Route path={ROUTES.TRIP_DETAIL} element={<TripDetailPage />} />
                <Route path={ROUTES.SEAT_SELECTION} element={<SeatSelectionPage />} />
                <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                <Route path={ROUTES.BOOKING} element={<BookingPage />} />
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
                    path={ROUTES.FORGOT_PASSWORD}
                    element={(
                        <PublicOnlyRoute>
                            <ForgotPasswordPage />
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

                <Route
                    path={ROUTES.ADMIN_ROUTES}
                    element={(
                        <AdminRoute>
                            <AdminRoutesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_VEHICLES}
                    element={(
                        <AdminRoute>
                            <AdminVehiclesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_VEHICLE_TYPES}
                    element={(
                        <AdminRoute>
                            <AdminVehicleTypesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_MAINTENANCE}
                    element={(
                        <AdminRoute>
                            <AdminMaintenancePage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_SEAT_LAYOUTS}
                    element={(
                        <AdminRoute>
                            <AdminSeatLayoutsPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_TRIP_OVERRIDES}
                    element={(
                        <AdminRoute>
                            <AdminTripSeatOverridesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_TRIP_DETAIL}
                    element={(
                        <AdminRoute>
                            <AdminTripDetailPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_TRIPS}
                    element={(
                        <AdminRoute>
                            <AdminTripsPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_TRIP_TEMPLATES}
                    element={(
                        <AdminRoute>
                            <AdminTripTemplatesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_DRIVERS}
                    element={(
                        <AdminRoute>
                            <AdminDriversPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_DRIVER_DETAIL}
                    element={(
                        <AdminRoute>
                            <AdminDriverDetailPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_CITIES}
                    element={(
                        <AdminRoute>
                            <AdminCitiesPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_POINTS}
                    element={(
                        <AdminRoute>
                            <AdminPointsPage />
                        </AdminRoute>
                    )}
                />

                <Route
                    path={ROUTES.ADMIN_PRICING}
                    element={(
                        <AdminRoute>
                            <AdminPricesPage />
                        </AdminRoute>
                    )}
                />

                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </BrowserRouter>
    );
};
