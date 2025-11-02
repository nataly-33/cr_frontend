import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Edit,
  Search,
  Filter,
} from "lucide-react";
import { documentsService } from "../services/documents.service";
import type { ClinicalDocument } from "../types";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "../types";
import {
  Button,
  Card,
  CardHeader,
  Badge,
  Loading,
  ConfirmModal,
  SearchInput,
  Table,
} from "@shared/components/ui";
import { useTable, useModal } from "@shared/hooks";
import { showToast, formatDate, formatFileSize } from "@shared/utils";

export const DocumentsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clinicalRecordId = searchParams.get("clinical_record");

  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] =
    useState<ClinicalDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [signedFilter, setSignedFilter] = useState<string>("");

  const deleteModal = useModal();

  const { page, pageSize, search, setSearch, debouncedSearch, handlePageChange } =
    useTable();

  useEffect(() => {
    loadDocuments();
  }, [page, pageSize, debouncedSearch, documentTypeFilter, statusFilter, signedFilter, clinicalRecordId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsService.getAll({
        page,
        page_size: pageSize,
        search: debouncedSearch,
        ordering: "-created_at",
        clinical_record: clinicalRecordId || undefined,
        document_type: documentTypeFilter || undefined,
        status: statusFilter || undefined,
        is_signed: signedFilter === "true" ? true : signedFilter === "false" ? false : undefined,
      });
      setDocuments(response.results);
    } catch (error) {
      console.error("Error loading documents:", error);
      showToast.error("Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      setIsDeleting(true);
      await documentsService.delete(selectedDocument.id);
      showToast.success("Documento eliminado exitosamente");
      deleteModal.close();
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast.error("Error al eliminar el documento");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (document: ClinicalDocument) => {
    try {
      const { url } = await documentsService.download(document.id);
      window.open(url, "_blank");
      showToast.success("Descargando documento...");
    } catch (error) {
      console.error("Error downloading document:", error);
      showToast.error("Error al descargar el documento");
    }
  };

  const handleSign = async (document: ClinicalDocument) => {
    try {
      await documentsService.sign(document.id);
      showToast.success("Documento firmado exitosamente");
      loadDocuments();
    } catch (error) {
      console.error("Error signing document:", error);
      showToast.error("Error al firmar el documento");
    }
  };

  const handleView = (document: ClinicalDocument) => {
    navigate(`/documents/${document.id}`);
  };

  const handleUploadNew = () => {
    if (clinicalRecordId) {
      navigate(`/documents/upload?clinical_record=${clinicalRecordId}`);
    } else {
      navigate("/documents/upload");
    }
  };

  const clearFilters = () => {
    setDocumentTypeFilter("");
    setStatusFilter("");
    setSignedFilter("");
    setSearch("");
  };

  const columns = [
    {
      key: "title",
      label: "T\u00edtulo",
      render: (doc: ClinicalDocument) => (
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{doc.title}</span>
            {doc.is_signed && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES] ||
              doc.document_type}
          </p>
        </div>
      ),
    },
    {
      key: "clinical_record",
      label: "Historia Cl\u00ednica",
      render: (doc: ClinicalDocument) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {doc.clinical_record_number || "N/A"}
          </p>
          {doc.patient_name && (
            <p className="text-sm text-gray-500">{doc.patient_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (doc: ClinicalDocument) => (
        <Badge
          variant={
            doc.status === "final"
              ? "success"
              : doc.status === "draft"
              ? "warning"
              : "default"
          }
        >
          {DOCUMENT_STATUS[doc.status]}
        </Badge>
      ),
    },
    {
      key: "file",
      label: "Archivo",
      render: (doc: ClinicalDocument) => (
        <div className="text-sm text-gray-600">
          <p>{doc.file_name}</p>
          {doc.file_size && (
            <p className="text-xs text-gray-400">
              {formatFileSize(doc.file_size)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (doc: ClinicalDocument) => (
        <div className="text-sm text-gray-600">
          <p>{formatDate(doc.created_at)}</p>
          {doc.uploaded_by_name && (
            <p className="text-xs text-gray-400">por {doc.uploaded_by_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (doc: ClinicalDocument) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            onClick={() => handleView(doc)}
            title="Ver documento"
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleDownload(doc)}
            title="Descargar"
          />
          {!doc.is_signed && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCircle className="h-4 w-4" />}
              onClick={() => handleSign(doc)}
              title="Firmar documento"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={() => navigate(`/documents/${doc.id}/edit`)}
            title="Editar"
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
            onClick={() => {
              setSelectedDocument(doc);
              deleteModal.open();
            }}
            title="Eliminar"
          />
        </div>
      ),
    },
  ];

  if (loading && documents.length === 0) {
    return <Loading fullScreen text="Cargando documentos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Documentos Cl\u00ednicos
          </h1>
          <p className="text-gray-600 mt-2">
            {clinicalRecordId
              ? "Documentos de la historia cl\u00ednica"
              : "Gestiona todos los documentos cl\u00ednicos"}
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleUploadNew}
        >
          Subir Documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar documentos..."
              className="md:col-span-2"
            />

            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              {Object.entries(DOCUMENT_STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <select
              value={signedFilter}
              onChange={(e) => setSignedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos (firmados y sin firmar)</option>
              <option value="true">Solo firmados</option>
              <option value="false">Sin firmar</option>
            </select>

            {(documentTypeFilter || statusFilter || signedFilter || search) && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader
          title={`Documentos (${documents.length})`}
          subtitle={
            loading
              ? "Cargando..."
              : `Mostrando ${documents.length} documento(s)`
          }
        />
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <Loading />
            </div>
          ) : documents.length > 0 ? (
            <Table
              columns={columns}
              data={documents}
              currentPage={page}
              onPageChange={handlePageChange}
              totalPages={Math.ceil(documents.length / pageSize)}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No se encontraron documentos</p>
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleUploadNew}
              >
                Subir Primer Documento
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Eliminar Documento"
        message={`\u00bfEst\u00e1s seguro de que deseas eliminar el documento "${selectedDocument?.title}"? Esta acci\u00f3n no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
