import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Bell,
  ChevronDown,
  CreditCard,
  X,
  Brain,
  FileImage,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { NotificationCenter } from "@/modules/notifications/components/NotificationCenter";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobileOpen = false, onClose }: SidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    { icon: Home, label: t("navigation.dashboard"), path: "/dashboard" },
    { icon: UserCog, label: t("navigation.users"), path: "/users" },
    { icon: Shield, label: t("navigation.roles"), path: "/roles" },
    { icon: Users, label: t("navigation.patients"), path: "/patients" },
    {
      icon: FileText,
      label: "Historias Clínicas",
      path: "/clinical-records",
      submenu: [
        { label: "Mis historias", path: "/clinical-records" },
        { label: "Formularios clínicos", path: "/clinical-forms" },
      ],
    },
    { icon: FileText, label: t("navigation.documents"), path: "/documents" },
    {
      icon: FileImage,
      label: "Estudios DICOM",
      path: "/dicom",
      submenu: [
        { label: "Visor Rápido", path: "/dicom/quick-view" },
        { label: "Visor Avanzado", path: "/dicom/advanced" },
      ],
    },
    {
      icon: BarChart3,
      label: t("navigation.reports"),
      path: "/reports",
      submenu: [
        { label: "Reportes Dinámicos", path: "/reports" },
        { label: "Reportes con IA", path: "/reports-ai" },
      ],
    },
    {
      icon: Bell,
      label: "Notificaciones",
      path: "/notifications",
      submenu: [
        { label: "Ver notificaciones", path: "/notifications" },
        { label: "Enviar notificación", path: "/notifications/send" },
        { label: "Preferencias", path: "/notifications/preferences" },
      ],
    },
    {
      icon: CreditCard,
      label: "Facturación",
      path: "/billing",
      submenu: [
        { label: "Planes", path: "/billing" },
        { label: "Pagos", path: "/billing/payments" },
      ],
    },
    {
      icon: Brain,
      label: "IA & Predicciones",
      path: "/ai",
      submenu: [{ label: "Árbol de Decisión", path: "/ai/decision-tree" }],
    },
    { icon: Settings, label: t("navigation.settings"), path: "/settings" },
  ];

  const isSubmenuActive = (submenu?: Array<{ path: string }>) => {
    if (!submenu) return false;
    return submenu.some((item) => location.pathname.startsWith(item.path));
  };

  return (
    <>
      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => onClose && onClose()}
          />
          <div className="relative flex flex-col w-64 bg-white app-sidebar">
            <div className="absolute top-2 right-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
                onClick={() => onClose && onClose()}
                aria-label="Cerrar sidebar"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <div
              className="flex-1 flex flex-col border-r"
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: "rgb(var(--border-color))",
              }}
            >
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isOpen = expandedMenu === item.path;
                    const submenuActive = isSubmenuActive(item.submenu);

                    return (
                      <div key={item.path}>
                        {hasSubmenu ? (
                          <button
                            onClick={() =>
                              setExpandedMenu(isOpen ? null : item.path)
                            }
                            className={`
                        w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors justify-between
                        ${
                          submenuActive
                            ? "bg-primary-100 text-primary-700"
                            : "hover:bg-opacity-10 hover:bg-primary-500"
                        }
                      `}
                            style={
                              !submenuActive
                                ? { color: "rgb(var(--text-primary))" }
                                : undefined
                            }
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.label}
                            </div>
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        ) : (
                          <Link
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-primary-100 text-primary-700"
                            : "hover:bg-opacity-10 hover:bg-primary-500"
                        }
                      `}
                            style={
                              !isActive
                                ? { color: "rgb(var(--text-primary))" }
                                : undefined
                            }
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                          </Link>
                        )}

                        {/* Submenu */}
                        {hasSubmenu && isOpen && (
                          <div className="mt-1 space-y-1 pl-4">
                            {item.submenu.map((subitem) => {
                              const isSubActive = location.pathname.startsWith(
                                subitem.path
                              );
                              return (
                                <Link
                                  key={subitem.path}
                                  to={subitem.path}
                                  onClick={() => onClose && onClose()}
                                  className={`
                              block px-3 py-2 text-xs font-medium rounded-md transition-colors
                              ${
                                isSubActive
                                  ? "bg-primary-100 text-primary-700"
                                  : "hover:bg-opacity-10 hover:bg-primary-500"
                              }
                            `}
                                  style={
                                    !isSubActive
                                      ? { color: "rgb(var(--text-primary))" }
                                      : undefined
                                  }
                                >
                                  {subitem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Notification Center in Sidebar Footer */}
              <div
                className="flex-shrink-0 border-t p-4"
                style={{
                  borderColor: "rgb(var(--border-color))",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notificaciones
                  </span>
                  <NotificationCenter />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:flex-shrink-0">
        <div
          className="flex flex-col w-64 border-r app-sidebar"
          style={{
            backgroundColor: "rgb(var(--bg-primary))",
            borderColor: "rgb(var(--border-color))",
          }}
        >
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isOpen = expandedMenu === item.path;
                const submenuActive = isSubmenuActive(item.submenu);

                return (
                  <div key={item.path}>
                    {hasSubmenu ? (
                      <button
                        onClick={() =>
                          setExpandedMenu(isOpen ? null : item.path)
                        }
                        className={`
                        w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors justify-between
                        ${
                          submenuActive
                            ? "bg-primary-100 text-primary-700"
                            : "hover:bg-opacity-10 hover:bg-primary-500"
                        }
                      `}
                        style={
                          !submenuActive
                            ? { color: "rgb(var(--text-primary))" }
                            : undefined
                        }
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-primary-100 text-primary-700"
                            : "hover:bg-opacity-10 hover:bg-primary-500"
                        }
                      `}
                        style={
                          !isActive
                            ? { color: "rgb(var(--text-primary))" }
                            : undefined
                        }
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    )}

                    {/* Submenu */}
                    {hasSubmenu && isOpen && (
                      <div className="mt-1 space-y-1 pl-4">
                        {item.submenu.map((subitem) => {
                          const isSubActive = location.pathname.startsWith(
                            subitem.path
                          );
                          return (
                            <Link
                              key={subitem.path}
                              to={subitem.path}
                              className={`
                              block px-3 py-2 text-xs font-medium rounded-md transition-colors
                              ${
                                isSubActive
                                  ? "bg-primary-100 text-primary-700"
                                  : "hover:bg-opacity-10 hover:bg-primary-500"
                              }
                            `}
                              style={
                                !isSubActive
                                  ? { color: "rgb(var(--text-primary))" }
                                  : undefined
                              }
                            >
                              {subitem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Notification Center in Sidebar Footer */}
          <div
            className="flex-shrink-0 border-t p-4"
            style={{
              borderColor: "rgb(var(--border-color))",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Notificaciones
              </span>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
