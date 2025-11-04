import { useState, useEffect } from "react";
import { Send, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { notificationsService } from "../services/notifications.service";
import { Button } from "@shared/components/ui";
import { toast } from "react-toastify";
import type { NotificationChannel, NotificationType } from "../types";
import type { User } from "@modules/users/types";

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

const CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: "in_app", label: "En la aplicación" },
  { value: "email", label: "Correo electrónico" },
  { value: "push", label: "Notificación push" },
];

export const SendNotificationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("system.alert");
  const [channel, setChannel] = useState<NotificationChannel>("in_app");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        console.log("Cargando usuarios desde /notifications/get_recipients/");
        
        const response = await notificationsService.getRecipients();
        console.log("Usuarios cargados:", response);
        
        // Mapear response a formato User
        const usersList = response.recipients.map((r: any) => ({
          id: r.id,
          email: r.email,
          first_name: r.first_name,
          last_name: r.last_name,
          full_name: r.full_name,
          phone: '',
          role: null,
          role_name: '',
          tenant_id: '',
          is_active: true,
          is_staff: false,
        }));
        
        setUsers(usersList as any);
        
        if (!usersList || usersList.length === 0) {
          console.warn("No se encontraron usuarios en la respuesta");
          toast.info("No hay usuarios disponibles");
        }
      } catch (error: any) {
        console.error("Error cargando usuarios:", error);
        console.error("Error detail:", error.response?.data || error.message);
        toast.error(`Error cargando usuarios: ${error.response?.data?.detail || error.message}`);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title || title.length < 5) {
      newErrors.title = "Título debe tener al menos 5 caracteres";
    }
    if (!body || body.length < 10) {
      newErrors.body = "Cuerpo debe tener al menos 10 caracteres";
    }
    if (selectedUsers.length === 0) {
      newErrors.recipients = "Selecciona al menos un usuario";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSendSuccess(false);

    try {
      const result = await notificationsService.send({
        title,
        body,
        type,
        channel,
        recipient_ids: selectedUsers,
      });

      toast.success(
        `✅ Notificación enviada a ${result.notifications_created} usuario(s)`
      );
      setSendSuccess(true);
      setTitle("");
      setBody("");
      setType("system.alert");
      setChannel("in_app");
      setSelectedUsers([]);
      setErrors({});

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error(
        error.response?.data?.error || "Error al enviar notificación"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((u: any) => u.id));
  };

  const clearUsers = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Enviar Notificación
        </h1>
        <p className="text-gray-600 mt-1">
          Envía notificaciones personalizadas a usuarios del hospital
        </p>
      </div>

      {/* Success Message */}
      {sendSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            ✅ Notificación(es) enviada(s) correctamente
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Título */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            placeholder="ej: Actualización importante"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Cuerpo */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido del mensaje *
          </label>
          <textarea
            placeholder="ej: El sistema se actualizará mañana a las 2 AM"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.body && (
            <p className="text-red-600 text-sm mt-1">{errors.body}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 10 caracteres, máximo 500
          </p>
        </div>

        {/* Tipo y Canal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de notificación
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {NOTIFICATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canal de envío
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selección de Usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Enviar a: *
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllUsers}
                disabled={users.length === 0}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                onClick={clearUsers}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-2">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                No hay usuarios disponibles en tu tenant
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {users.map((user: User) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer transition-colors rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedUsers.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Selecciona al menos un usuario para enviar la notificación
                  </p>
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    ✓ {selectedUsers.length} usuario(s) seleccionado(s)
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botón Enviar */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading || selectedUsers.length === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isLoading ? "Enviando..." : "Enviar Notificación"}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Nota</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Las notificaciones se envían inmediatamente a los usuarios
            seleccionados
          </li>
          <li>
            • Requiere permiso: <code className="bg-blue-100 px-1 rounded">notification.create</code>
          </li>
          <li>
            • Los usuarios respetarán sus preferencias y horas de silencio
          </li>
          <li>• Se registra un audit log de cada notificación enviada</li>
        </ul>
      </div>
    </div>
  );
};
