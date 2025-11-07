import type { ReactNode } from "react";
import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((s) => !s);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: "rgb(var(--bg-secondary))" }}
    >
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={closeMobileSidebar} />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
