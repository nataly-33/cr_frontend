import { Home, Users, FileText, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { icon: Home, label: t('navigation.dashboard'), path: "/dashboard" },
    { icon: Users, label: t('navigation.patients'), path: "/patients" },
    { icon: FileText, label: t('navigation.documents'), path: "/documents" },
    { icon: BarChart3, label: t('navigation.reports'), path: "/reports" },
    { icon: Settings, label: t('navigation.settings'), path: "/settings" },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r" style={{
        backgroundColor: 'rgb(var(--bg-primary))',
        borderColor: 'rgb(var(--border-color))'
      }}>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "hover:bg-opacity-10 hover:bg-primary-500"
                    }
                  `}
                  style={!isActive ? { color: 'rgb(var(--text-primary))' } : undefined}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
