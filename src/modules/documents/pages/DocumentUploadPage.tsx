import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, ArrowLeft, Save, FileSearch } from "lucide-react";
import { documentsService } from "../services/documents.service";
import { clinicalRecordsService } from "@modules/clinical-records/services/clinical-records.service";
import type { ClinicalRecord } from "@modules/clinical-records/types";
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
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  document_type: z.string().min(1, "El tipo de documento es requerido"),
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  document_date: z.string().optional(),
  specialty: z.string().max(100).optional(),
  doctor_name: z.string().max(200).optional(),
  doctor_license: z.string().max(50).optional(),
});

type FormData = z.infer<typeof documentSchema>;

export const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clinicalRecordIdFromUrl = searchParams.get("clinical_record");

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processOCR, setProcessOCR] = useState(false); // Estado para OCR automático

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      clinical_record: clinicalRecordIdFromUrl || "",
      document_type: "",
      title: "",
      description: "",
      document_date: new Date().toISOString().split("T")[0],
      specialty: "",
      doctor_name: "",
      doctor_license: "",
    },
  });

  const selectedRecordId = watch("clinical_record");

  // Configurar dropzone
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

        // Auto-generar título si está vacío
        if (!watch("title")) {
          setValue("title", file.name.replace(/\.[^/.]+$/, ""));
        }
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
  });

  useEffect(() => {
    loadClinicalRecords();
  }, []);

  const loadClinicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const response = await clinicalRecordsService.getAll({
        page_size: 1000,
        status: "active",
      });
      setClinicalRecords(response.results || []);
    } catch (error) {
      showToast.error("Error al cargar historias clínicas");
      setClinicalRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      showToast.error("Debe seleccionar un archivo");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(10);

      // Crear FormData
      const formData = {
        ...data,
        file: selectedFile,
      };

      setUploadProgress(30);

      // Subir documento
      const uploadedDocument = await documentsService.upload(formData);

      setUploadProgress(60);

      // Si el checkbox está activado, procesar OCR automáticamente
      if (processOCR && uploadedDocument?.id) {
        try {
          await documentsService.processOCR(uploadedDocument.id);
          showToast.success("Documento subido y OCR iniciado");
        } catch (ocrError) {
          console.error("Error al procesar OCR:", ocrError);
          showToast.warning("Documento subido pero OCR falló");
        }
      } else {
        showToast.success("Documento subido exitosamente");
      }

      setUploadProgress(100);

      // Redirigir según el contexto
      if (clinicalRecordIdFromUrl) {
        navigate(`/clinical-records/${clinicalRecordIdFromUrl}`);
      } else {
        navigate("/documents");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al subir el documento";
      showToast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  if (loadingRecords) {
    return <Loading fullScreen text="Cargando..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Subir Documento Clínico"
          subtitle="Complete la información y seleccione el archivo a subir"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Zona de Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo *
            </label>
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">
                    Suelta el archivo aquí...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium mb-2">
                      Arrastra y suelta un archivo aquí, o haz clic para
                      seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, Imágenes, DOC, DOCX (máx. 50MB)
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    {getFileIcon(selectedFile) ? (
                      <img
                        src={getFileIcon(selectedFile)!}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedFile.type.split("/")[1] || "archivo"}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex-shrink-0 text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress bar */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Subiendo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información del Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Historia Clínica *
              </label>
              <select
                {...register("clinical_record")}
                disabled={!!clinicalRecordIdFromUrl}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clinical_record ? "border-red-500" : "border-gray-300"
                } ${
                  clinicalRecordIdFromUrl
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">Seleccione una historia clínica</option>
                {clinicalRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.record_number} - {record.patient_info?.full_name}
                  </option>
                ))}
              </select>
              {errors.clinical_record && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.clinical_record.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                {...register("document_type")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.document_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccione un tipo</option>
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

            <Input
              label="Fecha del Documento"
              type="date"
              {...register("document_date")}
              error={errors.document_date?.message}
            />

            <div className="md:col-span-2">
              <Input
                label="Título *"
                {...register("title")}
                error={errors.title?.message}
                placeholder="Ej: Examen de sangre - Hemograma completo"
              />
            </div>

            <Input
              label="Especialidad"
              {...register("specialty")}
              error={errors.specialty?.message}
              placeholder="Ej: Cardiología, Pediatría"
            />

            <Input
              label="Nombre del Doctor"
              {...register("doctor_name")}
              error={errors.doctor_name?.message}
              placeholder="Dr. Juan Pérez"
            />

            <Input
              label="Licencia/Matrícula"
              {...register("doctor_license")}
              error={errors.doctor_license?.message}
              placeholder="MP-12345"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción adicional del documento..."
              />
            </div>

            {/* Checkbox para OCR automático */}
            {selectedFile &&
              (selectedFile.type === "application/pdf" ||
                selectedFile.type.startsWith("image/")) && (
                <div className="md:col-span-2">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="processOCR"
                      checked={processOCR}
                      onChange={(e) => setProcessOCR(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="processOCR"
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Procesar OCR automáticamente
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Activar esta opción extraerá el texto del documento
                        usando AWS Textract después de subirlo. Esto consume
                        créditos de AWS.
                      </p>
                    </div>
                    <FileSearch className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={loading}
              disabled={!selectedFile || loading}
            >
              Subir Documento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
