import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileImage, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Card } from "@shared/components/ui";
import { dicomService } from "../services/dicom.service";
import type { PatientMatchingStrategy, DicomIngestResponse } from "../types";

interface DicomUploaderProps {
  /** ID del paciente (opcional) */
  patientId?: string;
  /** ID del registro clínico (opcional) */
  clinicalRecordId?: string;
  /** Callback cuando se completa la subida */
  onUploadComplete?: (response: DicomIngestResponse) => void;
  /** Callback cuando hay error */
  onError?: (error: string) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const DicomUploader = ({
  patientId,
  clinicalRecordId: _clinicalRecordId,
  onUploadComplete,
  onError,
}: DicomUploaderProps) => {
  void _clinicalRecordId; // Se usará cuando se implemente asociación con registros clínicos
  void onUploadComplete; // Se usa en la versión completa con ingestFiles
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [matchingStrategy, setMatchingStrategy] = useState<PatientMatchingStrategy>(
    patientId ? "ALWAYS_USE_PROVIDED" : "MATCH_OR_CREATE"
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filtrar archivos .dcm o sin extensión (típico de DICOM)
    const dicomFiles = acceptedFiles.filter((file) => {
      const extension = file.name.toLowerCase().split(".").pop();
      return extension === "dcm" || extension === "dicom" || !file.name.includes(".");
    });

    setFiles((prev) => [...prev, ...dicomFiles]);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/dicom": [".dcm", ".dicom"],
      "application/octet-stream": [".dcm"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setStatus("idle");
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setStatus("uploading");
    setErrorMessage(null);

    try {
      // Usar endpoint de ingestión que guarda en BD
      const response = await dicomService.ingestFiles(files, {
        patient_id: patientId,
        matching_strategy: matchingStrategy,
      });

      setStatus("success");

      // Llamar callback con la respuesta
      if (onUploadComplete) {
        onUploadComplete(response);
      }

      // Limpiar después de éxito
      setTimeout(() => {
        setFiles([]);
        setStatus("idle");
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir archivos DICOM";
      setStatus("error");
      setErrorMessage(message);
      onError?.(message);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Subir Estudios DICOM</h3>

      {/* Dropzone */}
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
        {isDragActive ? (
          <p className="text-blue-600">Suelta los archivos DICOM aquí...</p>
        ) : (
          <div>
            <p className="text-gray-600">
              Arrastra archivos DICOM aquí, o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Formatos aceptados: .dcm, .dicom
            </p>
          </div>
        )}
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {files.length} archivo(s) - {formatSize(totalSize)}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFiles}>
              Limpiar todo
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-gray-400" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={status === "uploading"}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opciones de matching */}
      {!patientId && files.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estrategia de asociación de paciente
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={matchingStrategy}
            onChange={(e) => setMatchingStrategy(e.target.value as PatientMatchingStrategy)}
            disabled={status === "uploading"}
          >
            <option value="MATCH_OR_FAIL">
              Buscar paciente existente (fallar si no existe)
            </option>
            <option value="MATCH_OR_CREATE">
              Buscar o crear paciente automáticamente
            </option>
            <option value="REQUIRE_EXISTING">
              Requerir paciente existente por ID
            </option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            El sistema intentará asociar el estudio con un paciente según los datos DICOM.
          </p>
        </div>
      )}

      {/* Estado y acciones */}
      <div className="mt-4 flex items-center justify-between">
        {status === "uploading" && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Subiendo archivos...</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Estudio DICOM procesado correctamente</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {status === "idle" && <div />}

        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || status === "uploading"}
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {files.length > 0 && `(${files.length})`}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
