import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { patientsService } from "../services/patients.service";
import type { Patient } from "../types";
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

export const PatientsListPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
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
    loadPatients();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = getPaginationParams;
      const data = await patientsService.getAll({
        page: params.page,
        page_size: params.page_size,
        search: params.search || undefined,
        ordering: params.ordering,
      });

      setPatients(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (error) {
      console.error("Error loading patients:", error);
      showToast.error("Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      setIsDeleting(true);
      await patientsService.delete(patientToDelete.id);
      showToast.success("Paciente eliminado exitosamente");
      deleteModal.close();
      setPatientToDelete(null);
      loadPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      showToast.error("Error al eliminar paciente");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "Nombre Completo",
      render: (patient: Patient) => (
        <div className="font-medium text-gray-900">{patient.full_name}</div>
      ),
    },
    {
      key: "identity_document",
      label: "Documento",
    },
    {
      key: "date_of_birth",
      label: "Fecha de Nacimiento",
      render: (patient: Patient) => formatDate(patient.date_of_birth),
    },
    {
      key: "gender",
      label: "Género",
      render: (patient: Patient) => (
        <Badge variant={patient.gender === "M" ? "info" : "success"}>
          {patient.gender === "M" ? "Masculino" : "Femenino"}
        </Badge>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
    },
    {
      key: "email",
      label: "Email",
      render: (patient: Patient) => (
        <div className="text-sm text-gray-500">{patient.email || "-"}</div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (patient: Patient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
            className="text-yellow-600 hover:text-yellow-900"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(patient)}
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
        <CardHeader
          title="Gestión de Pacientes"
          subtitle={`${totalItems} paciente${totalItems !== 1 ? "s" : ""} registrado${totalItems !== 1 ? "s" : ""}`}
          actions={
            <Button
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => navigate("/patients/new")}
            >
              Nuevo Paciente
            </Button>
          }
        />

        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Buscar por nombre, documento o email..."
            className="max-w-md"
          />
        </div>

        <Table
          data={patients}
          columns={columns}
          isLoading={loading}
          emptyMessage="No se encontraron pacientes"
          keyExtractor={(patient) => patient.id}
        />

        {!loading && patients.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar Paciente"
        message={`¿Estás seguro de que deseas eliminar al paciente ${patientToDelete?.full_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
