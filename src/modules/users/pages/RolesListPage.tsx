import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { usersService } from "../services/users.service";
import type { Role } from "../types";
import {
  Table,
  Button,
  Card,
  CardHeader,
  Badge,
  ConfirmModal,
  Loading,
} from "@shared/components/ui";
import { useModal } from "@shared/hooks";
import { showToast, formatDate } from "@shared/utils";

export const RolesListPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteModal = useModal();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await usersService.getRoles();
      setRoles(data || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      showToast.error("Error al cargar roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (role: Role) => {
    if (role.is_system_role) {
      showToast.error("No se puede eliminar un rol del sistema");
      return;
    }
    setRoleToDelete(role);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      setIsDeleting(true);
      await usersService.deleteRole(roleToDelete.id);
      showToast.success("Rol eliminado exitosamente");
      deleteModal.close();
      setRoleToDelete(null);
      loadRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      showToast.error("Error al eliminar rol");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-gray-900">{role.name}</span>
          {role.is_system_role && (
            <Badge variant="info">
              Sistema
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      render: (role: Role) => (
        <span className="text-sm text-gray-600">
          {role.description || "-"}
        </span>
      ),
    },
    {
      key: "permissions_count",
      label: "Permisos",
      render: (role: Role) => (
        <Badge variant="default">
          {role.permissions?.length || 0} permisos
        </Badge>
      ),
    },
    {
      key: "users_count",
      label: "Usuarios",
      render: (role: Role) => (
        <span className="text-sm text-gray-600">
          {(role as any).users_count || 0} usuarios
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de creación",
      render: (role: Role) => (
        <span className="text-sm text-gray-500">
          {formatDate(role.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={() => navigate(`/roles/${role.id}/edit`)}
          >
            Editar
          </Button>
          {!role.is_system_role && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => handleDeleteClick(role)}
            >
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading fullScreen text="Cargando roles..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Gestión de Roles"
          subtitle={`${roles.length} rol(es) en el sistema`}
          actions={
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate("/roles/new")}
            >
              Nuevo Rol
            </Button>
          }
        />

        {roles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No hay roles creados</p>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate("/roles/new")}
            >
              Crear Primer Rol
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={roles} />
        )}
      </Card>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
