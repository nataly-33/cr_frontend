import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, User as UserIcon } from "lucide-react";
import { settingsService } from "../services/settings.service";
import type { UserProfile } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Badge,
} from "@shared/components/ui";
import { showToast, formatDate } from "@shared/utils";

const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  last_name: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido no puede exceder 100 caracteres"),
  phone: z
    .string()
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getProfile();
      setProfile(data);
      reset({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      await settingsService.updateProfile(data);
      showToast.success("Perfil actualizado exitosamente");
      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al actualizar el perfil";
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No se pudo cargar el perfil</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <CardHeader
            title="Mi Perfil"
            subtitle="Gestiona tu información personal"
          />

          <div className="mt-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.full_name}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="mt-2">
                  <Badge variant="info">{profile.role_name}</Badge>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombres *"
                    {...register("first_name")}
                    error={errors.first_name?.message}
                    placeholder="Juan"
                  />

                  <Input
                    label="Apellidos *"
                    {...register("last_name")}
                    error={errors.last_name?.message}
                    placeholder="Pérez"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    disabled
                    helperText="El email no puede ser modificado"
                  />

                  <Input
                    label="Teléfono"
                    {...register("phone")}
                    error={errors.phone?.message}
                    placeholder="+595 981 123456"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de la Cuenta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <Badge variant="info">{profile.role_name}</Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Registro
                    </label>
                    <p className="text-sm text-gray-600">
                      {formatDate(profile.date_joined)}
                    </p>
                  </div>

                  {profile.last_login && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Último Acceso
                      </label>
                      <p className="text-sm text-gray-600">
                        {formatDate(profile.last_login)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
        </div>
      </Card>
    </div>
  );
};
