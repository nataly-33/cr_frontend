import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { usersService } from "../services/users.service";
import { Button, Input, Card, CardHeader, Select } from "@shared/components/ui";
import { showToast } from "@shared/utils";
import type { Role } from "../types";

const userSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email inválido"),
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
  role: z.string().min(1, "El rol es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional()
    .or(z.literal("")),
  password_confirmation: z
    .string()
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => {
    // If password is provided, confirmation must match
    if (data.password && data.password.length > 0) {
      return data.password === data.password_confirmation;
    }
    return true;
  },
  {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  }
);

type UserFormDataType = z.infer<typeof userSchema>;

export const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormDataType>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    loadRoles();
    if (isEdit && id) {
      loadUser(id);
    }
  }, [id, isEdit]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const rolesData = await usersService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading roles:", error);
      showToast.error("Error al cargar los roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUser = async (userId: string) => {
    try {
      setLoadingData(true);
      const user = await usersService.getById(userId);
      reset({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || "",
        role: user.role,
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error("Error loading user:", error);
      showToast.error("Error al cargar los datos del usuario");
      navigate("/users");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UserFormDataType) => {
    try {
      setLoading(true);
      
      // Prepare data for submission
      const submitData: any = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        role: data.role,
      };

      // Only include password if provided (for create or update)
      if (data.password && data.password.length > 0) {
        submitData.password = data.password;
      }

      if (isEdit && id) {
        await usersService.update(id, submitData);
        showToast.success("Usuario actualizado exitosamente");
      } else {
        await usersService.create(submitData);
        showToast.success("Usuario creado exitosamente");
      }
      navigate("/users");
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Error al ${isEdit ? "actualizar" : "crear"} el usuario`;
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || loadingRoles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/users")}
        >
          Volver a Usuarios
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <CardHeader
            title={isEdit ? "Editar Usuario" : "Nuevo Usuario"}
            subtitle={
              isEdit
                ? "Actualiza la información del usuario"
                : "Completa el formulario para registrar un nuevo usuario"
            }
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Información Personal */}
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
                  label="Email *"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder="usuario@ejemplo.com"
                  disabled={isEdit}
                />

                <Input
                  label="Teléfono"
                  {...register("phone")}
                  error={errors.phone?.message}
                  placeholder="+595 981 123456"
                />
              </div>
            </div>

            {/* Información del Sistema */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Rol *"
                  {...register("role")}
                  error={errors.role?.message}
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Seguridad - Password */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Seguridad
                {isEdit && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Dejar en blanco para mantener la contraseña actual)
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Contraseña ${!isEdit ? "*" : ""}`}
                  type="password"
                  {...register("password")}
                  error={errors.password?.message}
                  placeholder="••••••••"
                />

                <Input
                  label={`Confirmar Contraseña ${!isEdit ? "*" : ""}`}
                  type="password"
                  {...register("password_confirmation")}
                  error={errors.password_confirmation?.message}
                  placeholder="••••••••"
                />
              </div>
              {!isEdit && (
                <p className="text-sm text-gray-500 mt-2">
                  La contraseña debe tener al menos 8 caracteres.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                leftIcon={<Save className="h-4 w-4" />}
                disabled={loading || isSubmitting}
                isLoading={loading}
              >
                {isEdit ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
