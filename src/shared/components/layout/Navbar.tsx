import { LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@core/store/auth.store";

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Clinic Records";
  return (
    <nav className="shadow-sm border-b" style={{
      backgroundColor: 'rgb(var(--bg-primary))',
      borderColor: 'rgb(var(--border-color))'
    }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 lg:hidden" style={{ color: 'rgb(var(--text-primary))' }} />
            <span className="ml-4 text-xl font-bold text-primary-600">
              {APP_TITLE}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
              {user?.full_name ?? ""}
            </span>
            <span className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
              {user?.tenant?.name ?? ""}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-primary-500 transition-colors"
            >
              <LogOut className="h-5 w-5" style={{ color: 'rgb(var(--text-primary))' }} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
