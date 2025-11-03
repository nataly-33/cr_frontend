import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ArrowLeft,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Calendar,
  User,
  Edit,
  Trash2,
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
} from "@shared/components/ui";
import { useModal } from "@shared/hooks";
import { showToast, formatDate } from "@shared/utils";

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const DocumentViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<ClinicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteModal = useModal();
  const signModal = useModal();

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentsService.getById(id!);
      setDocument(doc);

      // Obtener URL de descarga
      if (doc.file) {
        const { url } = await documentsService.download(id!);
        setFileUrl(url);
      }
    } catch (error) {
      showToast.error("Error al cargar el documento");
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { url } = await documentsService.download(id!);
      
      // Abrir en nueva pestaña
      window.open(url, "_blank");
      showToast.success("Descargando documento...");
    } catch (error) {
      showToast.error("Error al descargar el documento");
    }
  };

  const handlePrint = () => {
    if (fileUrl) {
      const printWindow = window.open(fileUrl, "_blank");
      printWindow?.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  const handleSign = async () => {
    if (!document) return;

    try {
      await documentsService.sign(id!);
      showToast.success("Documento firmado exitosamente");
      signModal.close();
      loadDocument();
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Error al firmar el documento";
      showToast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await documentsService.delete(id);
      showToast.success("Documento eliminado exitosamente");
      navigate("/documents");
    } catch (error) {
      showToast.error("Error al eliminar el documento");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPDF = document?.file_type === "application/pdf" || document?.file_name?.endsWith(".pdf");
  const isImage = document?.file_type?.startsWith("image/");

  if (loading) {
    return <Loading fullScreen text="Cargando documento..." />;
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate(-1)}
              >
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {document.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {DOCUMENT_TYPES[document.document_type as keyof typeof DOCUMENT_TYPES]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleDownload}
              >
                Descargar
              </Button>
              {isPDF && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={handlePrint}
                >
                  Imprimir
                </Button>
              )}
              {!document.is_signed && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  onClick={signModal.open}
                >
                  Firmar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => navigate(`/documents/${id}/edit`)}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={deleteModal.open}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visor de Documento */}
          <div className="lg:col-span-2">
            <Card padding={false}>
              {/* Controles del Visor */}
              {isPDF && fileUrl && (
                <div className="bg-gray-100 border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {pageNumber} de {numPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={pageNumber >= numPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={scale >= 3.0}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Contenido */}
              <div className="p-4 bg-gray-50">
                <div className="bg-white shadow-lg mx-auto" style={{ maxWidth: "fit-content" }}>
                  {isPDF && fileUrl ? (
                    <Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-96">
                          <Loading />
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-96 text-red-600">
                          <FileText className="h-12 w-12 mb-4" />
                          <p>Error al cargar el documento PDF</p>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                  ) : isImage && fileUrl ? (
                    <div className="p-4">
                      <img
                        src={fileUrl}
                        alt={document.title}
                        className="max-w-full h-auto"
                        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                      <FileText className="h-12 w-12 mb-4" />
                      <p className="font-medium mb-2">Vista previa no disponible</p>
                      <p className="text-sm">
                        Descarga el archivo para verlo
                      </p>
                      <Button
                        className="mt-4"
                        leftIcon={<Download className="h-4 w-4" />}
                        onClick={handleDownload}
                      >
                        Descargar Archivo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Panel de Información */}
          <div className="space-y-6">
            {/* Estado */}
            <Card>
              <CardHeader title="Estado" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <Badge
                    variant={
                      document.status === "final"
                        ? "success"
                        : document.status === "draft"
                        ? "warning"
                        : "default"
                    }
                  >
                    {DOCUMENT_STATUS[document.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Firmado</span>
                  {document.is_signed ? (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Firmado
                    </Badge>
                  ) : (
                    <Badge variant="warning">Sin firmar</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Información del Documento */}
            <Card>
              <CardHeader title="Información" />
              <div className="space-y-3 text-sm">
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha"
                  value={formatDate(document.created_at)}
                />
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Subido por"
                  value={document.uploaded_by_name || "No especificado"}
                />
              </div>
            </Card>

            {/* Paciente */}
            {document.patient_name && (
              <Card>
                <CardHeader title="Paciente" />
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {document.patient_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Historia: {document.clinical_record_number}
                  </p>
                </div>
              </Card>
            )}

            {/* Descripción */}
            {document.description && (
              <Card>
                <CardHeader title="Descripción" />
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {document.description}
                </p>
              </Card>
            )}

            {/* Firma Digital */}
            {document.is_signed && (
              <Card>
                <CardHeader title="Firma Digital" />
                <div className="space-y-2 text-sm">
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Firmado por"
                    value={document.signed_by_name || "N/A"}
                  />
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Fecha de firma"
                    value={formatDate(document.signed_at!)}
                  />
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader title="Metadata" />
              <div className="space-y-2 text-sm">
                <InfoItem
                  label="Archivo"
                  value={document.file_name || "N/A"}
                />
                {document.file_size && (
                  <InfoItem
                    label="Tamaño"
                    value={`${(document.file_size / 1024 / 1024).toFixed(2)} MB`}
                  />
                )}
                <InfoItem
                  label="Subido por"
                  value={document.uploaded_by_name || "N/A"}
                />
                <InfoItem
                  label="Fecha de creación"
                  value={formatDate(document.created_at)}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={signModal.isOpen}
        onClose={signModal.close}
        onConfirm={handleSign}
        title="Firmar Documento"
        message="¿Está seguro que desea firmar digitalmente este documento? Esta acción no se puede deshacer y el documento quedará bloqueado para edición."
        variant="primary"
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Eliminar Documento"
        message={`¿Está seguro que desea eliminar el documento "${document.title}"? Esta acción no se puede deshacer.`}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface InfoItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-start gap-2">
    {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value}</p>
    </div>
  </div>
);
