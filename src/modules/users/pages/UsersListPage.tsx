import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { usersService } from "../services/users.service";
import type { User } from "../types";
import {
  Table,
  Pagination,
  Button,
  SearchInput,
  Card,
  CardHeader,
  Badge,
  ConfirmModal,
} from "@shared/components/ui";
import { useTable, useModal, useDebounce } from "@shared/hooks";
import { showToast, formatDate } from "@shared/utils";

export const UsersListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const deleteModal = useModal();
  const toggleModal = useModal();

  const {
    currentPage,
    pageSize,
    searchQuery,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    getPaginationParams,
  } = useTable({ initialPageSize: 10 });

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = getPaginationParams;
      const data = await usersService.getAll({
        page: params.page,
        page_size: params.page_size,
        search: params.search || undefined,
        ordering: params.ordering,
      });

      setUsers(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (error) {
      console.error("Error loading users:", error);
      showToast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await usersService.delete(userToDelete.id);
      showToast.success("Usuario eliminado exitosamente");
      deleteModal.close();
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast.error("Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActiveClick = (user: User) => {
    setUserToToggle(user);
    toggleModal.open();
  };

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;

    try {
      setIsToggling(true);
      await usersService.toggleActive(userToToggle.id);
      showToast.success(
        `Usuario ${userToToggle.is_active ? "desactivado" : "activado"} exitosamente`
      );
      toggleModal.close();
      setUserToToggle(null);
      loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      showToast.error("Error al cambiar estado del usuario");
    } finally {
      setIsToggling(false);
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "Nombre Completo",
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rol",
      render: (user: User) => (
        <Badge variant="info">{user.role_name || "Sin rol"}</Badge>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (user: User) => (
        <div className="text-sm">{user.phone || "-"}</div>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (user: User) => (
        <Badge variant={user.is_active ? "success" : "error"}>
          {user.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "date_joined",
      label: "Fecha de Registro",
      render: (user: User) => (
        <div className="text-sm text-gray-500">
          {formatDate(user.date_joined)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="text-blue-600 hover:text-blue-900"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleActiveClick(user)}
            className={
              user.is_active
                ? "text-orange-600 hover:text-orange-900"
                : "text-green-600 hover:text-green-900"
            }
            title={user.is_active ? "Desactivar" : "Activar"}
          >
            {user.is_active ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleDeleteClick(user)}
            className="text-red-600 hover:text-red-900"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <CardHeader
            title="Gestión de Usuarios"
            subtitle="Administra los usuarios del sistema"
            actions={
              <Button
                onClick={() => navigate("/users/new")}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Nuevo Usuario
              </Button>
            }
          />
          <div className="mb-4 flex items-center justify-between">
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar usuarios..."
              className="max-w-md"
            />
            <div className="text-sm text-gray-500">
              {totalItems} usuario{totalItems !== 1 ? "s" : ""} encontrado
              {totalItems !== 1 ? "s" : ""}
            </div>
          </div>

          <Table
            columns={columns}
            data={users}
            isLoading={loading}
            emptyMessage="No se encontraron usuarios"
          />

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.first_name} ${userToDelete?.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Toggle Active Status Modal */}
      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={toggleModal.close}
        onConfirm={handleConfirmToggle}
        title={userToToggle?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
        message={`¿Estás seguro de que deseas ${
          userToToggle?.is_active ? "desactivar" : "activar"
        } al usuario ${userToToggle?.first_name} ${userToToggle?.last_name}?`}
        confirmText={userToToggle?.is_active ? "Desactivar" : "Activar"}
        variant={userToToggle?.is_active ? "danger" : "primary"}
        isLoading={isToggling}
      />
    </div>
  );
};
