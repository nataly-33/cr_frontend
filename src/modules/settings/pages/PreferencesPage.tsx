import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { settingsService } from "../services/settings.service";
import type { UserPreferences } from "../types";
import { THEMES, LANGUAGES } from "../types";
import {
  Button,
  Card,
  CardHeader,
  Select,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export const PreferencesPage = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: "system",
      language: "es",
      email_notifications: true,
      push_notifications: false,
    },
  });

  const currentTheme = watch("theme");

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPreferences();
      setPreferences(data);
      reset({
        theme: data.theme,
        language: data.language,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
      });
    } catch (error) {
      console.error("Error loading preferences:", error);
      showToast.error("Error al cargar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PreferencesFormData) => {
    try {
      setSaving(true);
      await settingsService.updatePreferences(data);
      showToast.success("Preferencias actualizadas exitosamente");
      loadPreferences();
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al actualizar las preferencias";
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando preferencias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <CardHeader
            title="Preferencias"
            subtitle="Personaliza tu experiencia en el sistema"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Apariencia */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Apariencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tema"
                  {...register("theme")}
                  error={errors.theme?.message}
                >
                  {Object.entries(THEMES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Idioma"
                  {...register("language")}
                  error={errors.language?.message}
                >
                  {Object.entries(LANGUAGES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Vista previa del tema:{" "}
                    <span className="font-medium">
                      {THEMES[currentTheme as keyof typeof THEMES]}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notificaciones
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("email_notifications")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Notificaciones por Email
                    </p>
                    <p className="text-sm text-gray-500">
                      Recibe actualizaciones y alertas importantes por correo electrónico
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("push_notifications")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Notificaciones Push
                    </p>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones en tiempo real en tu navegador
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Settings (if any) */}
            {preferences?.custom_settings && Object.keys(preferences.custom_settings).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configuración Personalizada
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(preferences.custom_settings, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                leftIcon={<Save className="h-4 w-4" />}
                disabled={saving}
                isLoading={saving}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
