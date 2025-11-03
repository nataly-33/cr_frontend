import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { usersService } from "../services/users.service";
import type { Permission } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Loading,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Schema de validación
const roleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Debe seleccionar al menos un permiso"),
});

type FormData = z.infer<typeof roleSchema>;

export const RoleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const selectedPermissions = watch("permissions");

  useEffect(() => {
    loadPermissions();
    if (isEditMode && id) {
      loadRole(id);
    }
  }, [id, isEditMode]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const data = await usersService.getPermissions();
      setPermissions(data || []);
    } catch (error) {
      console.error("Error loading permissions:", error);
      showToast.error("Error al cargar permisos");
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const loadRole = async (roleId: string) => {
    try {
      setLoading(true);
      const role = await usersService.getRoleById(roleId);
      setValue("name", role.name);
      setValue("description", role.description || "");
      setValue("permissions", role.permissions?.map((p) => p.id) || []);
    } catch (error) {
      console.error("Error loading role:", error);
      showToast.error("Error al cargar el rol");
      navigate("/roles");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);

      // El backend espera permissions como array de IDs
      const payload = {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      };

      if (isEditMode && id) {
        await usersService.updateRole(id, payload as any);
        showToast.success("Rol actualizado exitosamente");
      } else {
        await usersService.createRole(payload as any);
        showToast.success("Rol creado exitosamente");
      }

      navigate("/roles");
    } catch (error: any) {
      console.error("Error saving role:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al guardar el rol";
      showToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = selectedPermissions || [];
    if (current.includes(permissionId)) {
      setValue(
        "permissions",
        current.filter((id) => id !== permissionId)
      );
    } else {
      setValue("permissions", [...current, permissionId]);
    }
  };

  const toggleAllInResource = (resource: string) => {
    const resourcePermissions = permissions.filter((p) => p.resource === resource);
    const resourcePermissionIds = resourcePermissions.map((p) => p.id);
    const current = selectedPermissions || [];

    const allSelected = resourcePermissionIds.every((id) => current.includes(id));

    if (allSelected) {
      setValue(
        "permissions",
        current.filter((id) => !resourcePermissionIds.includes(id))
      );
    } else {
      const newPermissions = Array.from(new Set([...current, ...resourcePermissionIds]));
      setValue("permissions", newPermissions);
    }
  };

  // Agrupar permisos por recurso
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const resourceLabels: Record<string, string> = {
    patient: "Pacientes",
    clinical_record: "Historias Clínicas",
    document: "Documentos",
    user: "Usuarios",
    role: "Roles",
    report: "Reportes",
    audit: "Auditoría",
  };

  if (loading || loadingPermissions) {
    return <Loading fullScreen text="Cargando..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/roles")}
        >
          Volver a Roles
        </Button>
      </div>

      <Card>
        <CardHeader
          title={isEditMode ? "Editar Rol" : "Nuevo Rol"}
          subtitle={
            isEditMode
              ? "Modifica los datos del rol"
              : "Completa los datos para crear un nuevo rol"
          }
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <Input
              label="Nombre del Rol *"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Ej: Enfermero, Recepcionista"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe las responsabilidades de este rol..."
              />
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Permisos del Rol
              </h3>
            </div>
            {errors.permissions && (
              <p className="text-sm text-red-600">{errors.permissions.message}</p>
            )}

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const resourcePermissionIds = perms.map((p) => p.id);
                const allSelected = resourcePermissionIds.every((id) =>
                  (selectedPermissions || []).includes(id)
                );

                return (
                  <div key={resource} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {resourceLabels[resource] || resource}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAllInResource(resource)}
                      >
                        {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((permission) => {
                        const isChecked = (selectedPermissions || []).includes(
                          permission.id
                        );
                        return (
                          <label
                            key={permission.id}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </p>
                              {permission.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {permission.code}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/roles")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={saving}
              disabled={saving}
            >
              {isEditMode ? "Actualizar Rol" : "Crear Rol"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
