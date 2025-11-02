import { LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@core/store/auth.store";

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Clinic Records";
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Menu className="h-6 w-6 text-gray-600 lg:hidden" />
            <span className="ml-4 text-xl font-bold text-primary-600">
              {APP_TITLE}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.full_name ?? ""}
            </span>
            <span className="text-xs text-gray-500">
              {user?.tenant?.name ?? ""}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
