import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-background">
      <Header />
      <main className={`flex-grow ${isHomePage ? "" : "pt-20"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
