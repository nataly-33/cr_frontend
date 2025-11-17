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
  FileSearch,
  Copy,
  Loader,
  Eye,
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
  const [activeTab, setActiveTab] = useState<"viewer" | "ocr">("viewer");

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

      console.log("Documento cargado:", doc);
      console.log("file_path:", doc.file_path);
      console.log("file_name:", doc.file_name);

      // Obtener URL de visualización SOLO si hay archivo físico
      if (doc.file_path && doc.file_name) {
        try {
          // Usar el endpoint 'view' en lugar de 'download' para previsualización
          const viewData = await documentsService.view(id!);
          console.log("View data:", viewData);

          // Verificar que la URL sea válida antes de establecerla
          if (viewData.url && viewData.url.trim() !== '') {
            setFileUrl(viewData.url);
          } else {
            console.warn("URL de visualización vacía o inválida");
            showToast.warning("El archivo existe pero no se pudo generar la URL de previsualización");
          }
        } catch (error) {
          console.error("Error al obtener URL de visualización:", error);
          showToast.error("No se pudo cargar el archivo para previsualización");
        }
      } else {
        console.log("No hay archivo físico, mostrando contenido JSON");
      }
    } catch (error) {
      console.error("Error al cargar documento:", error);
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

      // El backend ya configura Content-Disposition para forzar descarga
      // Simplemente abrimos la URL y el navegador descargará automáticamente
      window.open(url, '_blank');

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

  const handleCopyOCRText = () => {
    if (document?.ocr_text) {
      navigator.clipboard.writeText(document.ocr_text);
      showToast.success("Texto copiado al portapapeles");
    }
  };

  const isPDF =
    document?.file_type === "application/pdf" ||
    document?.file_name?.endsWith(".pdf");
  const isImage = document?.file_type?.startsWith("image/");
  const hasOCR = document?.ocr_processed && document?.ocr_text;

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
                  {
                    DOCUMENT_TYPES[
                      document.document_type as keyof typeof DOCUMENT_TYPES
                    ]
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(document.file_path || fileUrl) && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleDownload}
                >
                  Descargar
                </Button>
              )}
              {isPDF && fileUrl && (
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
            {/* Tab Navigation - Solo si hay OCR */}
            {hasOCR && (
              <div className="flex border-b border-gray-200 bg-white mb-4 rounded-t-lg">
                <button
                  onClick={() => setActiveTab("viewer")}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === "viewer"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Eye className="inline-block mr-2 h-4 w-4" />
                  Visor de Documento
                </button>
                <button
                  onClick={() => setActiveTab("ocr")}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === "ocr"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <FileSearch className="inline-block mr-2 h-4 w-4" />
                  Texto Extraído (OCR)
                </button>
              </div>
            )}

            {/* Documento Viewer Tab */}
            {activeTab === "viewer" && (
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
                  <div
                    className="bg-white shadow-lg mx-auto"
                    style={{ maxWidth: "fit-content" }}
                  >
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
                          style={{
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                          }}
                        />
                      </div>
                    ) : document.content &&
                      Object.keys(document.content).length > 0 ? (
                      // Mostrar contenido estructurado (JSON)
                      <div className="p-8 max-w-4xl">
                        <DocumentContentViewer
                          content={document.content}
                          documentType={document.document_type}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="font-medium mb-2">
                          Vista previa no disponible
                        </p>
                        <p className="text-sm">
                          {document.file_path
                            ? "Descarga el archivo para verlo"
                            : "Este documento no tiene contenido disponible"}
                        </p>
                        {document.file_path && (
                          <Button
                            className="mt-4"
                            leftIcon={<Download className="h-4 w-4" />}
                            onClick={handleDownload}
                          >
                            Descargar Archivo
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* OCR Text Viewer Tab */}
            {activeTab === "ocr" && (
              <Card>
                <CardHeader title="Texto Extraído por OCR" />

                {/* OCR Status */}
                {document.ocr_status && (
                  <div className="mb-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Estado del procesamiento:
                      </span>
                      {document.ocr_status === "processing" ||
                      document.ocr_status === "async_processing" ? (
                        <span className="flex items-center text-sm text-blue-600">
                          <Loader className="h-4 w-4 mr-1 animate-spin" />
                          Procesando...
                        </span>
                      ) : document.ocr_status === "completed" ? (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Completado
                        </span>
                      ) : document.ocr_status === "failed" ? (
                        <span className="text-sm text-red-600 font-medium">
                          ✗ Error
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Pendiente</span>
                      )}
                    </div>

                    {/* Confidence Score */}
                    {document.ocr_confidence &&
                      document.ocr_status === "completed" && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              Confianza del OCR:
                            </span>
                            <span className="text-xs font-medium text-gray-800">
                              {Math.round(
                                parseFloat(document.ocr_confidence.toString())
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                parseFloat(
                                  document.ocr_confidence.toString()
                                ) >= 80
                                  ? "bg-green-500"
                                  : parseFloat(
                                      document.ocr_confidence.toString()
                                    ) >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  parseFloat(document.ocr_confidence.toString())
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* OCR Text Content */}
                {document.ocr_text ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Texto extraído:
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Copy className="h-4 w-4" />}
                        onClick={handleCopyOCRText}
                      >
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                        {document.ocr_text}
                      </pre>
                    </div>
                  </div>
                ) : document.ocr_status === "failed" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileSearch className="h-12 w-12 mb-4 text-red-400" />
                    <p className="font-medium text-red-600 mb-2">
                      Error al procesar el documento
                    </p>
                    <p className="text-sm text-center">
                      No se pudo extraer el texto de este documento. Por favor,
                      intenta subirlo nuevamente.
                    </p>
                  </div>
                ) : document.ocr_status === "processing" ||
                  document.ocr_status === "async_processing" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader className="h-12 w-12 mb-4 text-blue-500 animate-spin" />
                    <p className="font-medium mb-2">Procesando documento...</p>
                    <p className="text-sm text-center">
                      El texto se está extrayendo del documento. Esto puede
                      tomar unos momentos.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileSearch className="h-12 w-12 mb-4" />
                    <p className="font-medium mb-2">OCR no disponible</p>
                    <p className="text-sm text-center">
                      Este documento aún no ha sido procesado para extracción de
                      texto.
                    </p>
                  </div>
                )}
              </Card>
            )}
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
                <InfoItem label="Archivo" value={document.file_name || "N/A"} />
                {document.file_size && (
                  <InfoItem
                    label="Tamaño"
                    value={`${(document.file_size / 1024 / 1024).toFixed(
                      2
                    )} MB`}
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

// Componente para visualizar contenido estructurado del documento
interface DocumentContentViewerProps {
  content: Record<string, any>;
  documentType: string;
}

const DocumentContentViewer = ({
  content,
  documentType,
}: DocumentContentViewerProps) => {
  // Renderizar contenido según el tipo de documento
  const renderConsultation = () => {
    return (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Consulta Médica</h2>
        </div>

        {content.chief_complaint && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Motivo de Consulta
            </h3>
            <p className="text-gray-700">{content.chief_complaint}</p>
          </div>
        )}

        {content.history_present_illness && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Historia de Enfermedad Actual
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {content.history_present_illness}
            </p>
          </div>
        )}

        {content.vital_signs && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Signos Vitales
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              {content.vital_signs.blood_pressure && (
                <div>
                  <p className="text-sm text-gray-600">Presión Arterial</p>
                  <p className="font-medium">
                    {content.vital_signs.blood_pressure} mmHg
                  </p>
                </div>
              )}
              {content.vital_signs.heart_rate && (
                <div>
                  <p className="text-sm text-gray-600">Frecuencia Cardíaca</p>
                  <p className="font-medium">
                    {content.vital_signs.heart_rate} lpm
                  </p>
                </div>
              )}
              {content.vital_signs.temperature && (
                <div>
                  <p className="text-sm text-gray-600">Temperatura</p>
                  <p className="font-medium">
                    {content.vital_signs.temperature}°C
                  </p>
                </div>
              )}
              {content.vital_signs.respiratory_rate && (
                <div>
                  <p className="text-sm text-gray-600">
                    Frecuencia Respiratoria
                  </p>
                  <p className="font-medium">
                    {content.vital_signs.respiratory_rate} rpm
                  </p>
                </div>
              )}
              {content.vital_signs.oxygen_saturation && (
                <div>
                  <p className="text-sm text-gray-600">Saturación O₂</p>
                  <p className="font-medium">
                    {content.vital_signs.oxygen_saturation}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {content.physical_examination && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Examen Físico
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {content.physical_examination}
            </p>
          </div>
        )}

        {content.diagnosis && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Diagnóstico
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-900 font-medium">{content.diagnosis}</p>
            </div>
          </div>
        )}

        {content.treatment_plan && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Plan de Tratamiento
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {content.treatment_plan}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderLabResult = () => {
    return (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Resultados de Laboratorio
          </h2>
          {content.test_name && (
            <p className="text-gray-600 mt-1">{content.test_name}</p>
          )}
        </div>

        {content.test_date && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Fecha del examen</p>
            <p className="font-medium">{content.test_date}</p>
          </div>
        )}

        {content.results && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Resultados
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Parámetro
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Unidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Referencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(content.results).map(
                    ([key, value]: [string, any]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {value.value}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {value.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {value.reference}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {content.interpretation && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interpretación
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">{content.interpretation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPrescription = () => {
    return (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Receta Médica</h2>
        </div>

        {content.diagnosis && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Diagnóstico</p>
            <p className="font-medium text-gray-900">{content.diagnosis}</p>
          </div>
        )}

        {content.medications && content.medications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Medicamentos Prescritos
            </h3>
            <div className="space-y-4">
              {content.medications.map((med: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {med.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {med.dose && (
                      <div>
                        <span className="text-gray-600">Dosis:</span>
                        <span className="ml-2 font-medium">{med.dose}</span>
                      </div>
                    )}
                    {med.frequency && (
                      <div>
                        <span className="text-gray-600">Frecuencia:</span>
                        <span className="ml-2 font-medium">
                          {med.frequency}
                        </span>
                      </div>
                    )}
                    {med.duration && (
                      <div>
                        <span className="text-gray-600">Duración:</span>
                        <span className="ml-2 font-medium">{med.duration}</span>
                      </div>
                    )}
                    {med.via && (
                      <div>
                        <span className="text-gray-600">Vía:</span>
                        <span className="ml-2 font-medium">{med.via}</span>
                      </div>
                    )}
                  </div>
                  {med.instructions && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      {med.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {content.instructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Instrucciones</h3>
            <p className="text-gray-700">{content.instructions}</p>
          </div>
        )}

        {content.duration && (
          <div className="text-sm text-gray-600">
            <strong>Duración del tratamiento:</strong> {content.duration}
          </div>
        )}
      </div>
    );
  };

  const renderGeneric = () => {
    return (
      <div className="space-y-4">
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Contenido del Documento
          </h2>
        </div>

        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
              {key.replace(/_/g, " ")}
            </h3>
            <div className="text-gray-900">
              {typeof value === "object" ? (
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <p>{String(value)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Seleccionar el renderizador según el tipo de documento
  switch (documentType) {
    case "consultation":
      return renderConsultation();
    case "lab_result":
      return renderLabResult();
    case "prescription":
      return renderPrescription();
    default:
      return renderGeneric();
  }
};
