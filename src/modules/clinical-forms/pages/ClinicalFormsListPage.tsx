import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, FileText } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalForm } from "../types";
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

export const ClinicalFormsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("clinical_record");

  const [forms, setForms] = useState<ClinicalForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [formToDelete, setFormToDelete] = useState<ClinicalForm | null>(null);
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
    loadForms();
  }, [currentPage, pageSize, debouncedSearch, recordId]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const params = {
        ...getPaginationParams,
        ...(recordId && { clinical_record: recordId }),
      };

      const data = await clinicalFormsService.getAll(params);
      setForms(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    } catch (error) {
      console.error("Error loading forms:", error);
      showToast.error("Error al cargar formularios");
      setForms([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (form: ClinicalForm) => {
    setFormToDelete(form);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;

    try {
      setIsDeleting(true);
      await clinicalFormsService.delete(formToDelete.id);
      showToast.success("Formulario eliminado exitosamente");
      deleteModal.close();
      setFormToDelete(null);
      loadForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      showToast.error("Error al eliminar formulario");
    } finally {
      setIsDeleting(false);
    }
  };

  const getFormTypeBadgeColor = (type: string) => {
    const colors: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
      triage: "error",
      consultation: "info",
      evolution: "info",
      prescription: "success",
      lab_order: "warning",
      imaging_order: "warning",
      procedure: "info",
      discharge: "success",
      referral: "info",
      other: "default",
    };
    return colors[type] || "default";
  };

  const columns = [
    {
      key: "form_type",
      label: "Tipo",
      render: (form: ClinicalForm) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <Badge variant={getFormTypeBadgeColor(form.form_type)}>
            {form.form_type_display}
          </Badge>
        </div>
      ),
    },
    {
      key: "patient",
      label: "Paciente",
      render: (form: ClinicalForm) => (
        <div>
          <div className="font-medium">{form.patient_name}</div>
          <div className="text-sm text-gray-500">{form.record_number}</div>
        </div>
      ),
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (form: ClinicalForm) => (
        <div>
          <div className="font-medium">{form.doctor_name}</div>
          {form.doctor_specialty && (
            <div className="text-sm text-gray-500">{form.doctor_specialty}</div>
          )}
        </div>
      ),
    },
    {
      key: "form_date",
      label: "Fecha",
      render: (form: ClinicalForm) => formatDate(form.form_date),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (form: ClinicalForm) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clinical-forms/${form.id}`)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clinical-forms/${form.id}/edit`)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(form)}
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
          title="Formularios Clínicos"
          subtitle={
            recordId
              ? "Formularios de esta historia clínica"
              : "Gestiona todos los formularios clínicos"
          }
          actions={
            <Button onClick={() => navigate("/clinical-forms/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Formulario
            </Button>
          }
        />

        <div className="p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar formularios..."
            />
            <span className="text-sm text-gray-600">
              {totalItems} formulario{totalItems !== 1 ? "s" : ""} encontrado
              {totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando formularios...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No se encontraron formularios
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando un nuevo formulario clínico
              </p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={forms} />
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
        title="Eliminar formulario"
        message={`¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
};
