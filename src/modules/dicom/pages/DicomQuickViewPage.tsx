import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import {
  Upload,
  FileImage,
  Loader2,
  ZoomIn,
  ZoomOut,
  Move,
  Settings,
  Maximize,
  RotateCw,
  AlertCircle,
  Contrast,
} from "lucide-react";
import { Button, Card } from "@shared/components/ui";
import { dicomService } from "../services/dicom.service";
import { API_CONFIG } from "@core/config/api.config";

// Inicializar cornerstone-wado-image-loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Configurar para NO usar web workers (evita errores de decodeTask)
cornerstoneWADOImageLoader.configure({
  useWebWorkers: false,
});

type ViewerTool = "Pan" | "Zoom" | "WindowLevel";

interface DicomMetadata {
  patient_name: string;
  patient_id: string;
  modality: string;
  study_description: string;
  series_description: string;
  rows: number;
  columns: number;
  window_center: number;
  window_width: number;
}

/**
 * Página de visualización rápida de DICOM usando cornerstone-legacy
 * Permite subir un archivo y verlo inmediatamente sin guardar en BD
 */
export const DicomQuickViewPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DicomMetadata | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ViewerTool>("WindowLevel");
  const [windowLevel, setWindowLevel] = useState({ width: 400, center: 40 });

  // Estado para interacción del mouse
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Dropzone para seleccionar archivo
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const dicomFile = acceptedFiles[0];
      const ext = dicomFile.name.toLowerCase().split(".").pop();
      if (ext === "dcm" || ext === "dicom" || !dicomFile.name.includes(".")) {
        setFile(dicomFile);
        setError(null);
        setMetadata(null);
        setStreamUrl(null);
      } else {
        setError("Por favor selecciona un archivo DICOM válido (.dcm)");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/dicom": [".dcm", ".dicom"],
      "application/octet-stream": [".dcm"],
    },
    multiple: false,
  });

  // Subir archivo al backend
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await dicomService.tempUpload(file);

      const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
      const fullStreamUrl = `${baseUrl}${response.stream_url}`;

      console.log("Stream URL:", fullStreamUrl);

      setStreamUrl(fullStreamUrl);
      setMetadata(response.metadata);

      if (response.metadata) {
        setWindowLevel({
          width: response.metadata.window_width || 400,
          center: response.metadata.window_center || 40,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir el archivo";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Inicializar visor cuando tenemos la URL del stream
  useEffect(() => {
    if (!containerRef.current || !streamUrl) return;

    const element = containerRef.current;

    const loadImage = async () => {
      try {
        setIsViewerLoading(true);
        setError(null);

        // Habilitar el elemento para cornerstone
        if (!isEnabled) {
          cornerstone.enable(element);
          setIsEnabled(true);
        }

        // Crear imageId para Cornerstone (wadouri scheme)
        const imageId = `wadouri:${streamUrl}`;
        console.log("Loading image:", imageId);

        // Cargar y mostrar la imagen
        const image = await cornerstone.loadImage(imageId);
        console.log("Image loaded:", image);

        // Mostrar la imagen
        cornerstone.displayImage(element, image);

        // Aplicar window/level desde metadata si existe
        if (metadata) {
          const viewport = cornerstone.getViewport(element);
          if (viewport) {
            viewport.voi.windowWidth = metadata.window_width || 400;
            viewport.voi.windowCenter = metadata.window_center || 40;
            cornerstone.setViewport(element, viewport);
          }
        }

        setIsViewerLoading(false);
      } catch (err) {
        console.error("Error loading DICOM:", err);
        setError(err instanceof Error ? err.message : "Error al cargar la imagen DICOM");
        setIsViewerLoading(false);
      }
    };

    loadImage();

    // Cleanup
    return () => {
      if (isEnabled && containerRef.current) {
        try {
          cornerstone.disable(containerRef.current);
        } catch {
          // Ignorar errores de cleanup
        }
        setIsEnabled(false);
      }
    };
  }, [streamUrl]);

  // Manejar interacciones del mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isEnabled || !containerRef.current) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    const element = containerRef.current;

    try {
      const viewport = cornerstone.getViewport(element);
      if (!viewport) return;

      switch (activeTool) {
        case "Pan": {
          viewport.translation.x += deltaX;
          viewport.translation.y += deltaY;
          break;
        }
        case "Zoom": {
          const zoomFactor = 1 + deltaY * 0.01;
          viewport.scale *= zoomFactor;
          break;
        }
        case "WindowLevel": {
          viewport.voi.windowWidth += deltaX * 2;
          viewport.voi.windowCenter += deltaY * 2;
          // Actualizar estado para mostrar valores
          setWindowLevel({
            width: Math.round(viewport.voi.windowWidth),
            center: Math.round(viewport.voi.windowCenter),
          });
          break;
        }
      }

      cornerstone.setViewport(element, viewport);
    } catch (err) {
      console.error("Error updating viewport:", err);
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom con botones
  const handleZoom = (factor: number) => {
    if (!isEnabled || !containerRef.current) return;
    const element = containerRef.current;
    const viewport = cornerstone.getViewport(element);
    if (viewport) {
      viewport.scale *= factor;
      cornerstone.setViewport(element, viewport);
    }
  };

  // Reset
  const handleReset = () => {
    if (!isEnabled || !containerRef.current) return;
    cornerstone.reset(containerRef.current);
  };

  // Invertir colores
  const handleInvert = () => {
    if (!isEnabled || !containerRef.current) return;
    const element = containerRef.current;
    const viewport = cornerstone.getViewport(element);
    if (viewport) {
      viewport.invert = !viewport.invert;
      cornerstone.setViewport(element, viewport);
    }
  };

  // Rotar (flip horizontal)
  const handleRotate = () => {
    if (!isEnabled || !containerRef.current) return;
    const element = containerRef.current;
    const viewport = cornerstone.getViewport(element);
    if (viewport) {
      viewport.hflip = !viewport.hflip;
      cornerstone.setViewport(element, viewport);
    }
  };

  // Limpiar todo
  const handleClear = () => {
    if (isEnabled && containerRef.current) {
      try {
        cornerstone.disable(containerRef.current);
      } catch {
        // Ignorar
      }
      setIsEnabled(false);
    }
    setFile(null);
    setStreamUrl(null);
    setMetadata(null);
    setError(null);
  };

  const getButtonVariant = (tool: ViewerTool): "primary" | "outline" =>
    activeTool === tool ? "primary" : "outline";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Visor DICOM Rápido</h1>
        <p className="text-gray-600">
          Sube un archivo DICOM para visualizarlo inmediatamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Upload y metadata */}
        <div className="space-y-4">
          {/* Dropzone */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Archivo DICOM</h3>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-green-600">
                  <FileImage className="h-10 w-10 mx-auto mb-2" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="h-10 w-10 mx-auto mb-2" />
                  <p>Arrastra un archivo DICOM aquí</p>
                  <p className="text-sm">o haz clic para seleccionar</p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || !!streamUrl}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Visualizar
                  </>
                )}
              </Button>
              {streamUrl && (
                <Button variant="outline" onClick={handleClear}>
                  Limpiar
                </Button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {error}
              </div>
            )}
          </Card>

          {/* Metadata */}
          {metadata && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Información DICOM</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paciente:</span>
                  <span className="font-medium">{metadata.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Paciente:</span>
                  <span className="font-mono">{metadata.patient_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modalidad:</span>
                  <span className="font-medium">{metadata.modality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estudio:</span>
                  <span>{metadata.study_description || "Sin descripción"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Serie:</span>
                  <span>{metadata.series_description || "Sin descripción"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensiones:</span>
                  <span>{metadata.columns} x {metadata.rows} px</span>
                </div>
              </div>
            </Card>
          )}

          {/* Window/Level info */}
          {streamUrl && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Window / Level</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Window Width:</span>
                  <span className="font-mono">{windowLevel.width}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Window Center:</span>
                  <span className="font-mono">{windowLevel.center}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Panel derecho: Visor */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            {/* Barra de herramientas */}
            {streamUrl && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={getButtonVariant("WindowLevel")}
                  size="sm"
                  onClick={() => setActiveTool("WindowLevel")}
                  title="Window/Level (arrastrar)"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  W/L
                </Button>
                <Button
                  variant={getButtonVariant("Pan")}
                  size="sm"
                  onClick={() => setActiveTool("Pan")}
                  title="Mover (arrastrar)"
                >
                  <Move className="h-4 w-4 mr-1" />
                  Mover
                </Button>
                <Button
                  variant={getButtonVariant("Zoom")}
                  size="sm"
                  onClick={() => setActiveTool("Zoom")}
                  title="Zoom (arrastrar arriba/abajo)"
                >
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom
                </Button>

                <div className="border-l h-6 mx-2" />

                <Button variant="outline" size="sm" onClick={() => handleZoom(1.2)} title="Acercar">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleZoom(0.8)} title="Alejar">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleInvert} title="Invertir">
                  <Contrast className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate} title="Voltear">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} title="Restaurar">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Área del visor */}
            <div
              className="bg-black rounded-lg overflow-hidden relative"
              style={{ height: "600px" }}
            >
              {!streamUrl ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Sube un archivo DICOM para visualizarlo</p>
                    <p className="text-sm mt-1">Formatos soportados: .dcm, .dicom</p>
                  </div>
                </div>
              ) : isViewerLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Cargando imagen DICOM...</p>
                  </div>
                </div>
              ) : null}

              <div
                ref={containerRef}
                className="w-full h-full"
                style={{
                  display: streamUrl ? "block" : "none",
                  cursor: activeTool === "Pan" ? "move" : activeTool === "Zoom" ? "ns-resize" : "crosshair"
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Overlay de información */}
              {streamUrl && metadata && !isViewerLoading && (
                <>
                  <div className="absolute top-4 left-4 text-white text-xs space-y-1 bg-black/60 p-2 rounded pointer-events-none">
                    <div>Paciente: {metadata.patient_name}</div>
                    <div>Modalidad: {metadata.modality}</div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-white text-xs bg-black/60 p-2 rounded pointer-events-none">
                    <div>Herramienta: {activeTool}</div>
                    <div>W: {windowLevel.width} / L: {windowLevel.center}</div>
                    <div>{metadata.columns} x {metadata.rows}</div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
