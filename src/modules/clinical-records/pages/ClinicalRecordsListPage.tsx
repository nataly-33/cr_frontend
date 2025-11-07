import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, FileText } from "lucide-react";
import { clinicalRecordsService } from "../services/clinical-records.service";
import type { ClinicalRecord } from "../types";
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

export const ClinicalRecordsListPage = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [recordToDelete, setRecordToDelete] = useState<ClinicalRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteModal = useModal();

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
    loadRecords();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = getPaginationParams;

      const data = await clinicalRecordsService.getAll(params);
      setRecords(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    } catch (error) {
      console.error("Error loading records:", error);
      showToast.error("Error al cargar historias clínicas");
      setRecords([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (record: ClinicalRecord) => {
    setRecordToDelete(record);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      setIsDeleting(true);
      await clinicalRecordsService.delete(recordToDelete.id);
      showToast.success("Historia clínica eliminada exitosamente");
      deleteModal.close();
      setRecordToDelete(null);
      loadRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      showToast.error("Error al eliminar historia clínica");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeColor = (
    status: string
  ): "success" | "error" | "warning" | "info" | "default" => {
    const colors: Record<
      string,
      "success" | "error" | "warning" | "info" | "default"
    > = {
      active: "success",
      inactive: "error",
      archived: "warning",
      pending: "info",
    };
    return colors[status.toLowerCase()] || "default";
  };

  const columns = [
    {
      key: "record_number",
      label: "Número de Historia",
      render: (record: ClinicalRecord) => (
        <div>
          <div className="font-medium">{record.record_number}</div>
          <div className="text-sm text-gray-500">
            {record.patient_info?.first_name} {record.patient_info?.last_name}
          </div>
        </div>
      ),
    },
    {
      key: "patient",
      label: "Paciente",
      render: (record: ClinicalRecord) => 
        record.patient_info?.identity_document || "-",
    },
    {
      key: "status",
      label: "Estado",
      render: (record: ClinicalRecord) => (
        <Badge variant={getStatusBadgeColor(record.status)}>
          {record.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      render: (record: ClinicalRecord) => formatDate(record.created_at),
    },
    {
      key: "updated_at",
      label: "Última Actualización",
      render: (record: ClinicalRecord) => 
        record.updated_at ? formatDate(record.updated_at) : "-",
    },
    {
      key: "actions",
      label: "Acciones",
      render: (record: ClinicalRecord) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clinical-records/${record.id}`)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clinical-records/${record.id}/edit`)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(record)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Historias Clínicas"
          subtitle="Gestiona todas las historias clínicas de los pacientes"
          actions={
            <Button onClick={() => navigate("/clinical-records/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Historia
            </Button>
          }
        />

        <div className="p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar por número de historia, paciente o cédula..."
            />
            <span className="text-sm text-gray-600">
              {totalItems} historia{totalItems !== 1 ? "s" : ""} encontrada
              {totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando historias clínicas...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No se encontraron historias clínicas
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando una nueva historia clínica
              </p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={records} />
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar historia clínica"
        message={`¿Estás seguro de que deseas eliminar esta historia clínica? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
