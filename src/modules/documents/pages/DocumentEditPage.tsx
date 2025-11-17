import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { documentsService } from "../services/documents.service";
import type { ClinicalDocument } from "../types";
import { DOCUMENT_TYPES } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Loading,
} from "@shared/components/ui";
import { showToast, formatFileSize } from "@shared/utils";

// Schema de validación
const documentSchema = z.object({
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  document_date: z.string().optional(),
  specialty: z.string().max(100).optional(),
  doctor_name: z.string().max(200).optional(),
  doctor_license: z.string().max(50).optional(),
});

type FormData = z.infer<typeof documentSchema>;

export const DocumentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [document, setDocument] = useState<ClinicalDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replaceFile, setReplaceFile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(documentSchema),
  });

  // Configurar dropzone para reemplazar archivo
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setReplaceFile(true);
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        showToast.error("El archivo es demasiado grande. Máximo 50MB");
      } else if (error?.code === "file-invalid-type") {
        showToast.error("Tipo de archivo no permitido");
      } else {
        showToast.error("Error al seleccionar el archivo");
      }
    },
    disabled: !replaceFile, // Solo permitir drop cuando se active el reemplazo
  });

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoadingDocument(true);
      const doc = await documentsService.getById(id!);
      setDocument(doc);

      // Pre-llenar el formulario
      reset({
        document_type: doc.document_type,
        title: doc.title,
        description: doc.description || "",
        document_date: doc.created_at?.split("T")[0] || "",
        specialty: "",
        doctor_name: "",
        doctor_license: "",
      });
    } catch (error) {
      showToast.error("Error al cargar el documento");
      navigate("/documents");
    } finally {
      setLoadingDocument(false);
    }
  };

  const removeNewFile = () => {
    setSelectedFile(null);
    setReplaceFile(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Preparar datos para actualizar
      const updateData: any = { ...data };

      // Si se va a reemplazar el archivo, incluirlo en los datos
      if (replaceFile && selectedFile) {
        updateData.file = selectedFile;
      }

      // Actualizar documento (con o sin archivo nuevo)
      await documentsService.update(id!, updateData);

      showToast.success("Documento actualizado exitosamente");
      navigate(`/documents/${id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Error al actualizar el documento";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate(`/documents/${id}`)}
              >
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Editar Documento
                </h1>
                <p className="text-sm text-gray-500">
                  Paciente: {document.patient_name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Documento */}
          <Card>
            <CardHeader title="Información del Documento" />
            <div className="space-y-4">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("document_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tipo...</option>
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.document_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.document_type.message}
                  </p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("title")}
                  placeholder="Ej: Consulta Médica - Paciente Juan Pérez"
                  error={errors.title?.message}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del documento..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Fecha del Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Documento
                </label>
                <Input {...register("document_date")} type="date" />
              </div>
            </div>
          </Card>

          {/* Archivo Actual */}
          <Card>
            <CardHeader title="Archivo" />
            <div className="space-y-4">
              {/* Mostrar archivo actual */}
              {document.file_name && !replaceFile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {document.file_name}
                      </p>
                      {document.file_size && (
                        <p className="text-sm text-gray-500">
                          {formatFileSize(document.file_size)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload className="h-4 w-4" />}
                    onClick={() => setReplaceFile(true)}
                  >
                    Reemplazar Archivo
                  </Button>
                </div>
              )}

              {/* Zona de reemplazo de archivo */}
              {replaceFile && (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">
                          Reemplazar archivo del documento
                        </p>
                        <p>
                          El archivo actual será eliminado y reemplazado con el nuevo archivo que selecciones.
                          {document.file_name && ` Archivo actual: ${document.file_name}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!selectedFile ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {isDragActive
                          ? "Suelta el archivo aquí"
                          : "Arrastra un archivo o haz clic para seleccionar"}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Imágenes, Word (máx. 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={removeNewFile}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/documents/${id}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={loading}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
