import { useEffect, useState } from "react";
import { Loader, Save, AlertCircle } from "lucide-react";
import { notificationsService } from "../services/notifications.service";
import { Button } from "@shared/components/ui";
import type {
  NotificationType,
  NotificationChannel,
  NotificationUpdatePayload,
} from "../types";
import { toast } from "react-toastify";

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

export const PreferencesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [localPreferences, setLocalPreferences] = useState<
    Record<NotificationType, Record<NotificationChannel, boolean>>
  >({} as any);

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursFrom, setQuietHoursFrom] = useState("22:00");
  const [quietHoursTo, setQuietHoursTo] = useState("08:00");
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);

  // Cargar preferencias
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        console.log("Cargando preferencias...");
        const data = await notificationsService.getPreferences();
        console.log("Datos recibidos:", data);
        
        if (!data.all_preferences) {
          console.error("No se recibió all_preferences:", data);
          throw new Error("Campo all_preferences no encontrado");
        }
        
        setLocalPreferences(data.all_preferences);
        setQuietHoursEnabled(data.quiet_hours_enabled || false);
        setQuietHoursFrom(data.quiet_hours_from ? data.quiet_hours_from.slice(0, 5) : "22:00");
        setQuietHoursTo(data.quiet_hours_to ? data.quiet_hours_to.slice(0, 5) : "08:00");
        setEmailDigestEnabled(data.email_digest_enabled || false);
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error("Error al cargar preferencias");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Actualizar preferencia de canal
  const handleChannelToggle = (type: NotificationType, channel: NotificationChannel) => {
    setLocalPreferences({
      ...localPreferences,
      [type]: {
        ...localPreferences[type],
        [channel]: !localPreferences[type][channel],
      },
    });
  };

  // Guardar preferencias
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const payload: NotificationUpdatePayload = {
        preferences: localPreferences,
        quiet_hours_enabled: quietHoursEnabled,
        quiet_hours_from: `${quietHoursFrom}:00`,
        quiet_hours_to: `${quietHoursTo}:00`,
        email_digest_enabled: emailDigestEnabled,
      };

      await notificationsService.updatePreferences(payload);
      toast.success("Preferencias guardadas correctamente");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Error al guardar preferencias");
    } finally {
      setIsSaving(false);
    }
  };

  // Habilitar todos los canales
  const handleEnableAll = () => {
    const updated = { ...localPreferences };
    NOTIFICATION_TYPES.forEach((type) => {
      updated[type.value] = {
        in_app: true,
        email: true,
        push: true,
      };
    });
    setLocalPreferences(updated);
  };

  // Deshabilitar todos los canales
  const handleDisableAll = () => {
    const updated = { ...localPreferences };
    NOTIFICATION_TYPES.forEach((type) => {
      updated[type.value] = {
        in_app: false,
        email: false,
        push: false,
      };
    });
    setLocalPreferences(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Preferencias de Notificaciones
        </h1>
        <p className="text-gray-600 mt-1">
          Configura cómo deseas recibir notificaciones
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Puedes activar o desactivar notificaciones por tipo y canal.
          Las horas de silencio no aplicarán para alertas del sistema.
        </p>
      </div>

      {/* Controles Rápidos */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleEnableAll}>
          Habilitar todos
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDisableAll}>
          Deshabilitar todos
        </Button>
      </div>

      {/* Matriz de Preferencias */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tipos de Notificaciones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-40">
                  Tipo
                </th>
                {CHANNELS.map((channel) => (
                  <th
                    key={channel.value}
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900"
                  >
                    {channel.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {NOTIFICATION_TYPES.map((type) => (
                <tr key={type.value} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {type.label}
                  </td>
                  {CHANNELS.map((channel) => (
                    <td
                      key={`${type.value}-${channel.value}`}
                      className="px-4 py-4 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={
                          localPreferences[type.value]?.[
                            channel.value as NotificationChannel
                          ] ?? false
                        }
                        onChange={() => handleChannelToggle(type.value, channel.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuración de Horas de Silencio */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Horas de Silencio
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="quietHours"
              checked={quietHoursEnabled}
              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="quietHours" className="text-sm font-medium text-gray-700">
              Activar horas de silencio
            </label>
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="time"
                  value={quietHoursFrom}
                  onChange={(e) => setQuietHoursFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="time"
                  value={quietHoursTo}
                  onChange={(e) => setQuietHoursTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuración de Email Digest */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen por Email
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="emailDigest"
            checked={emailDigestEnabled}
            onChange={(e) => setEmailDigestEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="emailDigest" className="text-sm font-medium text-gray-700">
            Recibir un resumen diario de notificaciones por email
          </label>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex gap-2">
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </div>
    </div>
  );
};
