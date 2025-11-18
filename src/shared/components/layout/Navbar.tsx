import { LogOut, Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@core/store/auth.store";
import { NotificationBell } from "@modules/notifications/components";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Clinic Records";
  return (
    <nav
      className="shadow-sm border-b"
      style={{
        backgroundColor: "rgb(var(--bg-primary))",
        borderColor: "rgb(var(--border-color))",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onToggleSidebar && onToggleSidebar()}
              className="p-2 lg:hidden rounded-md mr-2"
              aria-label="Abrir menú"
              title="Abrir menú"
            >
              <Menu
                className="h-6 w-6"
                style={{ color: "rgb(var(--text-primary))" }}
              />
            </button>
            <span className="ml-2 text-2xl font-bold text-primary">
              {APP_TITLE}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span
              className="text-sm"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              {user?.full_name ?? ""}
            </span>
            <span
              className="text-xs"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              {user?.tenant?.name ?? ""}
            </span>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Notification Preferences Link */}
            <Link
              to="/notifications/preferences"
              className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-primary-500 transition-colors"
              title="Preferencias de notificaciones"
            >
              <Settings
                className="h-5 w-5"
                style={{ color: "rgb(var(--text-primary))" }}
              />
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-primary-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut
                className="h-5 w-5"
                style={{ color: "rgb(var(--text-primary))" }}
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
