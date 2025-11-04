import { useEffect, useState } from "react";
import { Bell, X, Check, Loader } from "lucide-react";
import { notificationsService } from "../services/notifications.service";
import type { Notification } from "../types";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar contador de no leídas
  const loadUnreadCount = async () => {
    try {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Cargar notificaciones cuando se abre el dropdown
  const loadNotifications = async () => {
    if (isOpen) {
      setIsLoading(true);
      try {
        const data = await notificationsService.getAll({
          page_size: 10,
          ordering: "-created_at",
        });
        setNotifications(data.results);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Marcar como leída
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsService.markAsRead(id);
      // Actualizar lista local
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, status: "read" as const, read_at: new Date().toISOString() } : n
        )
      );
      // Actualizar contador
      await loadUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({
          ...n,
          status: "read" as const,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUnreadCount();

    // Recargar contador cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar notificaciones cuando se abre/cierra el dropdown
  useEffect(() => {
    loadNotifications();
  }, [isOpen]);

  // Obtener display de tipo de notificación
  const getTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      "appointment.created": "📅 Cita creada",
      "appointment.canceled": "❌ Cita cancelada",
      "appointment.reminder": "🔔 Recordatorio",
      "clinical_record.result": "📋 Resultado clínico",
      "document.uploaded": "📄 Documento",
      "inventory.low_stock": "⚠️ Stock bajo",
      "user.added": "👤 Usuario agregado",
      "system.alert": "⚡ Alerta del sistema",
    };
    return types[type] || type;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader size={24} className="animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.status === "read" ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {getTypeDisplay(notification.type)}
                        </span>
                        {notification.status !== "read" && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString("es-ES", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    {notification.status !== "read" && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="flex-shrink-0 p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Marcar como leída"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Marcar todas como leídas
              </button>
              <a
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                Ver todas
              </a>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};
