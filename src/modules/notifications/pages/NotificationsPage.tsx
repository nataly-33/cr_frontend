import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Trash2, AlertCircle, CheckCircle2, Clock, Send, Loader, Plus } from "lucide-react";
import { notificationsService } from "../services/notifications.service";
import { Button } from "@shared/components/ui";
import type {
  Notification,
  NotificationType,
  NotificationStatus,
} from "../types";

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: "appointment.created", label: "📅 Cita creada" },
  { value: "appointment.canceled", label: "❌ Cita cancelada" },
  { value: "appointment.reminder", label: "🔔 Recordatorio" },
  { value: "clinical_record.result", label: "📋 Resultado clínico" },
  { value: "document.uploaded", label: "📄 Documento" },
  { value: "inventory.low_stock", label: "⚠️ Stock bajo" },
  { value: "user.added", label: "👤 Usuario agregado" },
  { value: "system.alert", label: "⚡ Alerta del sistema" },
];

const STATUS_OPTIONS: { value: NotificationStatus; label: string }[] = [
  { value: "queued", label: "Encolada" },
  { value: "sent", label: "Enviada" },
  { value: "delivered", label: "Entregada" },
  { value: "failed", label: "Fallida" },
  { value: "read", label: "Leída" },
];

const STATUS_ICONS: Record<NotificationStatus, React.ReactNode> = {
  queued: <Clock size={18} className="text-yellow-500" />,
  sent: <Send size={18} className="text-blue-500" />,
  delivered: <CheckCircle2 size={18} className="text-green-500" />,
  failed: <AlertCircle size={18} className="text-red-500" />,
  read: <CheckCircle2 size={18} className="text-gray-500" />,
};

export const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  // Filtros
  const selectedType = searchParams.get("type") as NotificationType | null;
  const selectedStatus = searchParams.get("status") as NotificationStatus | null;
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Cargar notificaciones
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsService.getAll({
        page: currentPage,
        page_size: 20,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        ordering: "-created_at",
      });
      setNotifications(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentPage, selectedType, selectedStatus]);

  // Marcar como leída
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(
        notifications.map((n) =>
          n.id === id
            ? { ...n, status: "read" as const, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    try {
      await notificationsService.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      setPagination({ ...pagination, count: pagination.count - 1 });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Cambiar filtro de tipo
  const handleTypeChange = (type: NotificationType | null) => {
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  // Cambiar filtro de estado
  const handleStatusChange = (status: NotificationStatus | null) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  // Cambiar página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.count} notificaciones
          </p>
        </div>
        <Link to="/notifications/send">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            Enviar Notificación
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro de tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de notificación
            </label>
            <select
              value={selectedType || ""}
              onChange={(e) =>
                handleTypeChange(e.target.value as NotificationType | null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={selectedStatus || ""}
              onChange={(e) =>
                handleStatusChange(e.target.value as NotificationStatus | null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No hay notificaciones que mostrar</p>
        </div>
      )}

      {/* Notificaciones List */}
      {!isLoading && notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.status === "read" ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Tipo y Estado */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {notification.type_display}
                        </span>
                        {STATUS_ICONS[notification.status as NotificationStatus]}
                      </div>
                      {notification.status !== "read" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nuevo
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>

                    {/* Body */}
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.body}
                    </p>

                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Creada:{" "}
                        {new Date(notification.created_at).toLocaleString(
                          "es-ES"
                        )}
                      </span>
                      {notification.sent_at && (
                        <span>
                          Enviada:{" "}
                          {new Date(notification.sent_at).toLocaleString(
                            "es-ES"
                          )}
                        </span>
                      )}
                      {notification.read_at && (
                        <span>
                          Leída:{" "}
                          {new Date(notification.read_at).toLocaleString(
                            "es-ES"
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notification.status !== "read" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marcar como leída
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.count > 20 && (
            <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * 20 + 1} a{" "}
                {Math.min(currentPage * 20, pagination.count)} de{" "}
                {pagination.count}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.previous}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Página {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.next}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
