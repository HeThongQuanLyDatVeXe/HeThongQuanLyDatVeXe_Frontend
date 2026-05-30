import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/user-service/useAuth';

// ─── Lazy-loaded Page Components ────────────────────────────────────────────
// Only the component that is being navigated to will be downloaded/parsed.
// This dramatically reduces the initial bundle size.
const LandingPage = React.lazy(() => import('../pages/LandingPage').then(m => ({ default: m.LandingPage })));
const RoutesPage = React.lazy(() => import('../pages/RoutesPage').then(m => ({ default: m.RoutesPage })));
const RouteTripsPage = React.lazy(() => import('../pages/RouteTripsPage').then(m => ({ default: m.RouteTripsPage })));
const TripDetailPage = React.lazy(() => import('../pages/TripDetailPage').then(m => ({ default: m.TripDetailPage })));
const SeatSelectionPage = React.lazy(() => import('../pages/SeatSelectionPage').then(m => ({ default: m.SeatSelectionPage })));
const CheckoutPage = React.lazy(() => import('../pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const BookingPage = React.lazy(() => import('../pages/BookingPage').then(m => ({ default: m.BookingPage })));
const BookingSuccessfulPage = React.lazy(() => import('../pages/BookingSuccessfulPage').then(m => ({ default: m.BookingSuccessfulPage })));
const LoginPage = React.lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MyBookingsPage = React.lazy(() => import('../pages/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));
const ChangeCancelTicketPage = React.lazy(() => import('../pages/ChangeCancelTicketPage').then(m => ({ default: m.ChangeCancelTicketPage })));
const GoogleCallbackPage = React.lazy(() => import('../pages/GoogleCallbackPage').then(m => ({ default: m.GoogleCallbackPage })));
const AdminLoginPage = React.lazy(() => import('../pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsersPage = React.lazy(() => import('../pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminRolesPage = React.lazy(() => import('../pages/AdminRolesPage').then(m => ({ default: m.AdminRolesPage })));
const AdminPermissionsPage = React.lazy(() => import('../pages/AdminPermissionsPage').then(m => ({ default: m.AdminPermissionsPage })));
const AdminRoutesPage = React.lazy(() => import('../pages/admin-routes/AdminRoutesPage').then(m => ({ default: m.AdminRoutesPage })));
const AdminCitiesPage = React.lazy(() => import('../pages/admin-routes/AdminCitiesPage').then(m => ({ default: m.AdminCitiesPage })));
const AdminPointsPage = React.lazy(() => import('../pages/admin-routes/AdminPointsPage').then(m => ({ default: m.AdminPointsPage })));
const AdminVehiclesPage = React.lazy(() => import('../pages/admin-vehicle/AdminVehiclesPage').then(m => ({ default: m.AdminVehiclesPage })));
const AdminVehicleTypesPage = React.lazy(() => import('../pages/admin-vehicle/AdminVehicleTypesPage').then(m => ({ default: m.AdminVehicleTypesPage })));
const AdminMaintenancePage = React.lazy(() => import('../pages/admin-vehicle/AdminMaintenancePage').then(m => ({ default: m.AdminMaintenancePage })));
const AdminSeatLayoutsPage = React.lazy(() => import('../pages/admin-vehicle/AdminSeatLayoutsPage').then(m => ({ default: m.AdminSeatLayoutsPage })));
const AdminTripSeatOverridesPage = React.lazy(() => import('../pages/admin-vehicle/AdminTripSeatOverridesPage').then(m => ({ default: m.AdminTripSeatOverridesPage })));
const AdminTripsPage = React.lazy(() => import('../pages/admin-trip/AdminTripsPage').then(m => ({ default: m.AdminTripsPage })));
const AdminTripDetailPage = React.lazy(() => import('../pages/admin-trip/AdminTripDetailPage').then(m => ({ default: m.AdminTripDetailPage })));
const AdminTripTemplatesPage = React.lazy(() => import('../pages/admin-trip/AdminTripTemplatesPage').then(m => ({ default: m.AdminTripTemplatesPage })));
const AdminDriversPage = React.lazy(() => import('../pages/admin-driver/AdminDriversPage').then(m => ({ default: m.AdminDriversPage })));
const AdminDriverDetailPage = React.lazy(() => import('../pages/admin-driver/AdminDriverDetailPage').then(m => ({ default: m.AdminDriverDetailPage })));
const AdminPricesPage = React.lazy(() => import('../pages/admin-price/AdminPricesPage').then(m => ({ default: m.AdminPricesPage })));
const AdminBookingsPage = React.lazy(() => import('../pages/AdminBookingsPage').then(m => ({ default: m.AdminBookingsPage })));


// ─── Loading Fallback ───────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-500 font-medium">Đang tải trang...</span>
        </div>
    </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    return isAuthenticated ? <Navigate to={ROUTES.PROFILE} replace /> : <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
    }

    const hasAdminRole = user?.roles?.some((role) => role.name.toLowerCase().includes('admin'));
    return hasAdminRole ? <>{children}</> : <Navigate to={ROUTES.HOME} replace />;
};

export const AppRouter: React.FC = () => {
    return (
        <Suspense fallback={<PageLoader />}>
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

                    <Route
                        path={ROUTES.CHANGE_CANCEL}
                        element={(
                            <ProtectedRoute>
                                <ChangeCancelTicketPage />
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
                        path={ROUTES.ADMIN_BOOKINGS}
                        element={(
                            <AdminRoute>
                                <AdminBookingsPage />
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
        </Suspense>
    );
};
