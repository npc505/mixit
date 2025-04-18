// src/layouts/MainLayout.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

type MainLayoutProps = {
  showFooter?: boolean;
  className?: string;
  pad4?: boolean;
};

function MainLayout({
  showFooter = true,
  className = "",
  pad4 = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-grow ${pad4 ? "p-4" : ""} ${className}`}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default MainLayout;
