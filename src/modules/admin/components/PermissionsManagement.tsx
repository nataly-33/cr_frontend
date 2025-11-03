import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { rolesPermissionsService, type Permission } from "../services/roles-permissions.service";

const RESOURCES = [
  { value: "patient", label: "Pacientes" },
  { value: "clinical_record", label: "Historias Clínicas" },
  { value: "document", label: "Documentos" },
  { value: "user", label: "Usuarios" },
  { value: "role", label: "Roles" },
  { value: "report", label: "Reportes" },
  { value: "audit", label: "Auditoría" },
];

const ACTIONS = [
  { value: "create", label: "Crear" },
  { value: "read", label: "Leer" },
  { value: "update", label: "Actualizar" },
  { value: "delete", label: "Eliminar" },
  { value: "export", label: "Exportar" },
  { value: "sign", label: "Firmar" },
];

export const PermissionsManagement = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    resource: "",
    action: "",
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await rolesPermissionsService.getAllPermissions();
      setPermissions(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los permisos");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      code: permission.code,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    });
    setShowForm(true);
  };

  const handleNewPermission = () => {
    setEditingPermission(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      resource: "",
      action: "",
    });
    setShowForm(true);
  };

  const handleSavePermission = async () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.resource || !formData.action) {
      setError("Todos los campos son requeridos");
      return;
    }

    setLoading(true);
    try {
      if (editingPermission) {
        await rolesPermissionsService.updatePermission(editingPermission.id, formData);
      } else {
        await rolesPermissionsService.createPermission(formData);
      }

      await loadPermissions();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al guardar el permiso");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este permiso?")) {
      return;
    }

    setLoading(true);
    try {
      await rolesPermissionsService.deletePermission(id);
      await loadPermissions();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al eliminar el permiso");
    } finally {
      setLoading(false);
    }
  };

  const updateCode = () => {
    if (formData.resource && formData.action) {
      setFormData({
        ...formData,
        code: `${formData.resource}.${formData.action}`,
      });
    }
  };

  useEffect(() => {
    updateCode();
  }, [formData.resource, formData.action]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Permisos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Crea y administra los permisos del sistema
          </p>
        </div>
        <button
          onClick={handleNewPermission}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          <Plus size={18} />
          Nuevo Permiso
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingPermission ? "Editar Permiso" : "Crear Nuevo Permiso"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Crear Paciente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código (Auto-generado)
              </label>
              <input
                type="text"
                value={formData.code}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurso
              </label>
              <select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un recurso</option>
                {RESOURCES.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acción
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una acción</option>
                {ACTIONS.map((act) => (
                  <option key={act.value} value={act.value}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe este permiso"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={() => setShowForm(false)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePermission}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Permissions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && !showForm ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Cargando permisos...</p>
          </div>
        ) : permissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No hay permisos disponibles</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Acción
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{permission.name}</div>
                      {permission.tenant_id === null && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          Global
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {permission.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {RESOURCES.find((r) => r.value === permission.resource)?.label || permission.resource}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {ACTIONS.find((a) => a.value === permission.action)?.label || permission.action}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditPermission(permission)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-gray-400 transition"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePermission(permission.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:text-gray-400 transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PermissionsManagement;
