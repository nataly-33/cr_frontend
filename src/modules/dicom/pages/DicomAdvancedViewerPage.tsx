import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import {
  Upload,
  Loader2,
  ZoomIn,
  ZoomOut,
  Move,
  Settings,
  Maximize,
  RotateCw,
  AlertCircle,
  Contrast,
  ChevronLeft,
  ChevronRight,
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { Button, Card } from "@shared/components/ui";

// Inicializar cornerstone-wado-image-loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
  useWebWorkers: false,
});

type ViewerTool = "Pan" | "Zoom" | "WindowLevel";

interface DicomFile {
  file: File;
  imageId: string;
  instanceNumber: number;
  sliceLocation?: number;
}

interface SeriesInfo {
  patientName: string;
  patientId: string;
  modality: string;
  studyDescription: string;
  seriesDescription: string;
  totalImages: number;
}

/**
 * Visor DICOM Avanzado - Soporta series completas con navegación entre cortes
 */
export const DicomAdvancedViewerPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const [files, setFiles] = useState<DicomFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);
  const [activeTool, setActiveTool] = useState<ViewerTool>("WindowLevel");
  const [windowLevel, setWindowLevel] = useState({ width: 400, center: 40 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(100); // ms entre frames
  const [highQuality, setHighQuality] = useState(true); // Mejora de calidad de imagen

  // Controles individuales de mejora de imagen
  const [imageFilters, setImageFilters] = useState({
    contrast: 130,      // 100 = normal, rango 50-200
    brightness: 110,    // 100 = normal, rango 50-200
    saturation: 130,    // 100 = normal, rango 0-200
    sharpness: 50,      // 0-100 (simula nitidez con drop-shadow)
  });

  // Referencias para interacción del mouse (evita re-renders)
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Referencia para el intervalo de reproducción
  const playIntervalRef = useRef<number | null>(null);

  // Dropzone para seleccionar archivos
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setFiles([]);
    setSeriesInfo(null);
    setCurrentIndex(0);

    try {
      const dicomFiles: DicomFile[] = [];
      let firstDataset: {
        patientName?: string;
        patientId?: string;
        modality?: string;
        studyDescription?: string;
        seriesDescription?: string;
      } | null = null;

      // Procesar cada archivo
      for (const file of acceptedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);

        try {
          const dataSet = dicomParser.parseDicom(byteArray);

          // Extraer información del primer archivo
          if (!firstDataset) {
            firstDataset = {
              patientName: dataSet.string("x00100010") || "Desconocido",
              patientId: dataSet.string("x00100020") || "",
              modality: dataSet.string("x00080060") || "OT",
              studyDescription: dataSet.string("x00081030") || "",
              seriesDescription: dataSet.string("x0008103e") || "",
            };
          }

          // Obtener número de instancia para ordenar
          const instanceNumber = dataSet.intString("x00200013") || 0;
          const sliceLocation = dataSet.floatString("x00201041");

          // Crear blob URL para el archivo
          const blob = new Blob([byteArray], { type: "application/dicom" });
          const objectUrl = URL.createObjectURL(blob);
          const imageId = `wadouri:${objectUrl}`;

          dicomFiles.push({
            file,
            imageId,
            instanceNumber: instanceNumber as number,
            sliceLocation: sliceLocation as number | undefined,
          });
        } catch (parseError) {
          console.warn(`No se pudo parsear ${file.name}:`, parseError);
        }
      }

      if (dicomFiles.length === 0) {
        throw new Error("No se encontraron archivos DICOM válidos");
      }

      // Ordenar por número de instancia o ubicación del corte
      dicomFiles.sort((a, b) => {
        if (a.sliceLocation !== undefined && b.sliceLocation !== undefined) {
          return a.sliceLocation - b.sliceLocation;
        }
        return a.instanceNumber - b.instanceNumber;
      });

      setFiles(dicomFiles);
      setSeriesInfo({
        patientName: firstDataset?.patientName || "Desconocido",
        patientId: firstDataset?.patientId || "",
        modality: firstDataset?.modality || "OT",
        studyDescription: firstDataset?.studyDescription || "",
        seriesDescription: firstDataset?.seriesDescription || "",
        totalImages: dicomFiles.length,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar archivos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/dicom": [".dcm", ".dicom"],
      "application/octet-stream": [".dcm"],
    },
    multiple: true,
  });

  // Aplicar mejoras de calidad al canvas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applyHighQualityRendering = useCallback((canvas: HTMLCanvasElement) => {
    // Aumentar resolución del canvas para mejor nitidez (supersampling)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Escalar el canvas para alta resolución
    canvas.width = rect.width * dpr * 2; // 2x supersampling
    canvas.height = rect.height * dpr * 2;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Escalar el contexto
      ctx.scale(dpr * 2, dpr * 2);

      // Configuración de máxima calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Aplicar filtros CSS para mejorar nitidez
      canvas.style.imageRendering = "high-quality";
      canvas.style.filter = "contrast(1.02) saturate(1.05)";
    }
  }, []);

  // Referencia para mantener el viewport entre cambios de imagen
  const savedViewportRef = useRef<{
    scale?: number;
    rotation?: number;
    invert?: boolean;
    hflip?: boolean;
    vflip?: boolean;
    translation?: { x: number; y: number };
  }>({});

  // Cargar imagen cuando cambia el índice o archivos
  useEffect(() => {
    if (!containerRef.current || files.length === 0) return;

    const element = containerRef.current;

    const loadImage = async () => {
      try {
        // Habilitar el elemento si no está habilitado
        if (!isEnabled) {
          cornerstone.enable(element, {
            renderer: "webgl", // Siempre usar WebGL para mejor rendimiento
          });
          setIsEnabled(true);
        }

        const currentFile = files[currentIndex];
        const image = await cornerstone.loadImage(currentFile.imageId);

        // Configurar viewport - mantener transformaciones si existen
        const defaultViewport = cornerstone.getDefaultViewportForImage(element, image);
        const saved = savedViewportRef.current;

        const viewportConfig = {
          ...defaultViewport,
          pixelReplication: false,
          // Mantener transformaciones guardadas
          scale: saved.scale ?? defaultViewport.scale,
          rotation: saved.rotation ?? defaultViewport.rotation,
          invert: saved.invert ?? defaultViewport.invert,
          hflip: saved.hflip ?? defaultViewport.hflip,
          vflip: saved.vflip ?? defaultViewport.vflip,
          translation: saved.translation ?? defaultViewport.translation,
        };

        cornerstone.displayImage(element, image, viewportConfig);

        // Obtener viewport actual para mantener W/L
        const viewport = cornerstone.getViewport(element);
        if (viewport) {
          setWindowLevel({
            width: Math.round(viewport.voi.windowWidth),
            center: Math.round(viewport.voi.windowCenter),
          });
        }

      } catch (err) {
        console.error("Error loading image:", err);
        setError("Error al cargar la imagen");
      }
    };

    loadImage();
  }, [files, currentIndex, isEnabled]);

  // Aplicar filtros CSS cuando cambian (sin recargar imagen)
  useEffect(() => {
    if (!containerRef.current || files.length === 0) return;

    const element = containerRef.current;
    const canvas = element.querySelector("canvas") as HTMLCanvasElement;

    if (!canvas) return;

    if (highQuality) {
      // MODO HD: Aplicar múltiples mejoras con valores personalizados
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }

      // Calcular valores de filtro CSS desde los controles
      const contrastVal = imageFilters.contrast / 100;
      const brightnessVal = imageFilters.brightness / 100;
      const saturationVal = imageFilters.saturation / 100;
      const sharpnessVal = imageFilters.sharpness / 100;

      // Crear filtro de nitidez simulado con drop-shadow
      const sharpnessFilter = sharpnessVal > 0
        ? `drop-shadow(0 0 ${sharpnessVal * 1.5}px rgba(255,255,255,${sharpnessVal * 0.5}))`
        : '';

      // Aplicar filtros CSS
      canvas.style.imageRendering = "auto";
      canvas.style.filter = `contrast(${contrastVal}) brightness(${brightnessVal}) saturate(${saturationVal}) ${sharpnessFilter}`.trim();
    } else {
      // MODO SD: Sin mejoras
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
      canvas.style.imageRendering = "pixelated";
      canvas.style.filter = "none";
    }
  }, [files.length, highQuality, imageFilters]);

  // Reproducción automática
  useEffect(() => {
    if (isPlaying && files.length > 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % files.length);
      }, playSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, files.length, playSpeed]);

  // Navegación con teclado y scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (files.length === 0) return;

      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(files.length - 1, prev + 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;
      if (files.length === 0) return;

      e.preventDefault();
      if (e.deltaY > 0) {
        setCurrentIndex((prev) => Math.min(files.length - 1, prev + 1));
      } else {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [files.length]);

  // Mouse handlers para herramientas (optimizado sin re-renders)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;
    // Pausar reproducción al empezar a arrastrar para evitar lag
    if (isPlaying) {
      setIsPlaying(false);
    }
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [isEnabled, isPlaying]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !isEnabled || !containerRef.current) return;

    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    const element = containerRef.current;

    try {
      const viewport = cornerstone.getViewport(element);
      if (!viewport) return;

      switch (activeTool) {
        case "Pan": {
          viewport.translation.x += deltaX;
          viewport.translation.y += deltaY;
          // Guardar traslación para mantener entre cambios de imagen
          savedViewportRef.current.translation = { ...viewport.translation };
          break;
        }
        case "Zoom": {
          const zoomFactor = 1 + deltaY * 0.01;
          viewport.scale *= zoomFactor;
          // Guardar zoom para mantener entre cambios de imagen
          savedViewportRef.current.scale = viewport.scale;
          break;
        }
        case "WindowLevel": {
          viewport.voi.windowWidth += deltaX * 2;
          viewport.voi.windowCenter += deltaY * 2;
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

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [isEnabled, activeTool]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Controles
  const handleZoom = (factor: number) => {
    if (!isEnabled || !containerRef.current) return;
    const viewport = cornerstone.getViewport(containerRef.current);
    if (viewport) {
      viewport.scale *= factor;
      cornerstone.setViewport(containerRef.current, viewport);
      // Guardar para mantener entre cambios de imagen
      savedViewportRef.current.scale = viewport.scale;
    }
  };

  const handleReset = () => {
    if (!isEnabled || !containerRef.current) return;
    cornerstone.reset(containerRef.current);
    // Limpiar transformaciones guardadas
    savedViewportRef.current = {};
  };

  const handleInvert = () => {
    if (!isEnabled || !containerRef.current) return;
    const viewport = cornerstone.getViewport(containerRef.current);
    if (viewport) {
      viewport.invert = !viewport.invert;
      cornerstone.setViewport(containerRef.current, viewport);
      // Guardar para mantener entre cambios de imagen
      savedViewportRef.current.invert = viewport.invert;
    }
  };

  const handleRotate = () => {
    if (!isEnabled || !containerRef.current) return;
    const viewport = cornerstone.getViewport(containerRef.current);
    if (viewport) {
      viewport.rotation = (viewport.rotation || 0) + 90;
      cornerstone.setViewport(containerRef.current, viewport);
      // Guardar para mantener entre cambios de imagen
      savedViewportRef.current.rotation = viewport.rotation;
    }
  };

  const handleClear = () => {
    setIsPlaying(false);
    if (isEnabled && containerRef.current) {
      try {
        cornerstone.disable(containerRef.current);
      } catch { /* ignore */ }
      setIsEnabled(false);
    }
    // Liberar URLs de blobs
    files.forEach((f) => {
      const url = f.imageId.replace("wadouri:", "");
      URL.revokeObjectURL(url);
    });
    setFiles([]);
    setSeriesInfo(null);
    setError(null);
    setCurrentIndex(0);
    // Limpiar transformaciones guardadas
    savedViewportRef.current = {};
  };

  const getButtonVariant = (tool: ViewerTool): "primary" | "outline" =>
    activeTool === tool ? "primary" : "outline";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Visor DICOM Avanzado</h1>
        <p className="text-gray-600">
          Carga series completas de imágenes DICOM para navegar entre cortes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel izquierdo */}
        <div className="space-y-4">
          {/* 1. Dropzone - Cargar archivos */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Cargar Serie DICOM</h3>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : files.length > 0
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              {files.length > 0 ? (
                <div className="text-green-600">
                  <Layers className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">{files.length} imágenes cargadas</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Arrastra múltiples archivos DICOM</p>
                  <p className="text-xs">o haz clic para seleccionar</p>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <Button variant="outline" onClick={handleClear} className="w-full mt-3">
                Limpiar
              </Button>
            )}

            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                {error}
              </div>
            )}
          </Card>

          {/* 2. Navegación - Controles de navegación */}
          {files.length > 1 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Navegación</h3>
              <div className="space-y-3">
                {/* Slider de posición */}
                <div>
                  <input
                    type="range"
                    min={0}
                    max={files.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span className="font-medium text-gray-700">
                      {currentIndex + 1} / {files.length}
                    </span>
                    <span>{files.length}</span>
                  </div>
                </div>

                {/* Botones de reproducción */}
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(0)}
                    title="Ir al inicio"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    title="Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isPlaying ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    title={isPlaying ? "Pausar" : "Reproducir"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => Math.min(files.length - 1, prev + 1))}
                    title="Siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(files.length - 1)}
                    title="Ir al final"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Velocidad de reproducción */}
                <div className="text-xs text-gray-500">
                  <label className="block mb-1">Velocidad: {1000 / playSpeed} fps</label>
                  <input
                    type="range"
                    min={50}
                    max={500}
                    step={50}
                    value={playSpeed}
                    onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Mejoras de Imagen */}
          {files.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Mejoras de Imagen</h3>
                <Button
                  variant={highQuality ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setHighQuality(!highQuality)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {highQuality ? "HD" : "SD"}
                </Button>
              </div>
              {highQuality ? (
                <div className="space-y-4">
                  {/* Contraste */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Contraste</span>
                      <span className="font-mono text-primary-600">{imageFilters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      value={imageFilters.contrast}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>

                  {/* Brillo */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Brillo</span>
                      <span className="font-mono text-primary-600">{imageFilters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      value={imageFilters.brightness}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>

                  {/* Saturación */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Saturación</span>
                      <span className="font-mono text-primary-600">{imageFilters.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      value={imageFilters.saturation}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>

                  {/* Nitidez */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Nitidez</span>
                      <span className="font-mono text-primary-600">{imageFilters.sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={imageFilters.sharpness}
                      onChange={(e) => setImageFilters(prev => ({ ...prev, sharpness: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>

                  {/* Botón para resetear */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageFilters({ contrast: 130, brightness: 110, saturation: 130, sharpness: 50 })}
                    className="w-full mt-2"
                  >
                    Restaurar valores HD
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Modo estándar sin mejoras. Activa HD para ajustes personalizados.
                </p>
              )}
            </Card>
          )}

          {/* 4. Información de la serie */}
          {seriesInfo && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Información</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paciente:</span>
                  <span className="font-medium truncate ml-2">{seriesInfo.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modalidad:</span>
                  <span className="font-medium">{seriesInfo.modality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Serie:</span>
                  <span className="truncate ml-2">{seriesInfo.seriesDescription || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Imágenes:</span>
                  <span className="font-medium">{seriesInfo.totalImages}</span>
                </div>
              </div>
            </Card>
          )}

          {/* 5. Window/Level */}
          {files.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Window / Level</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Width:</span>
                  <span className="font-mono">{windowLevel.width}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Center:</span>
                  <span className="font-mono">{windowLevel.center}</span>
                </div>
              </div>
            </Card>
          )}

          {/* 6. Instrucciones */}
          <Card className="p-4">
            <h4 className="font-medium mb-2 text-sm">Controles</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Scroll:</strong> Navegar entre cortes</li>
              <li>• <strong>Flechas:</strong> Anterior/Siguiente</li>
              <li>• <strong>Espacio:</strong> Play/Pausa</li>
              <li>• <strong>Arrastrar:</strong> Herramienta activa</li>
            </ul>
          </Card>
        </div>

        {/* Visor */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            {/* Barra de herramientas */}
            {files.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={getButtonVariant("WindowLevel")}
                  size="sm"
                  onClick={() => setActiveTool("WindowLevel")}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  W/L
                </Button>
                <Button
                  variant={getButtonVariant("Pan")}
                  size="sm"
                  onClick={() => setActiveTool("Pan")}
                >
                  <Move className="h-4 w-4 mr-1" />
                  Mover
                </Button>
                <Button
                  variant={getButtonVariant("Zoom")}
                  size="sm"
                  onClick={() => setActiveTool("Zoom")}
                >
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom
                </Button>

                <div className="border-l h-6 mx-2" />

                <Button variant="outline" size="sm" onClick={() => handleZoom(1.2)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleZoom(0.8)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleInvert}>
                  <Contrast className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <Maximize className="h-4 w-4" />
                </Button>

                <div className="border-l h-6 mx-2" />

                {/* Botón de calidad de imagen */}
                <Button
                  variant={highQuality ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setHighQuality(!highQuality)}
                  title={highQuality ? "Calidad alta activada" : "Calidad estándar"}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {highQuality ? "HD" : "SD"}
                </Button>
              </div>
            )}

            {/* Área del visor */}
            <div
              className="bg-black rounded-lg overflow-hidden relative"
              style={{ height: "700px" }}
            >
              {files.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Carga una serie de archivos DICOM</p>
                    <p className="text-sm mt-1">Selecciona múltiples archivos para navegar entre cortes</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Procesando archivos DICOM...</p>
                  </div>
                </div>
              ) : null}

              <div
                ref={containerRef}
                className="w-full h-full"
                style={{
                  display: files.length > 0 && !isLoading ? "block" : "none",
                  cursor: activeTool === "Pan" ? "move" : activeTool === "Zoom" ? "ns-resize" : "crosshair",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Overlay de información */}
              {files.length > 0 && seriesInfo && !isLoading && (
                <>
                  <div className="absolute top-4 left-4 text-white text-xs space-y-1 bg-black/60 p-2 rounded pointer-events-none">
                    <div>{seriesInfo.patientName}</div>
                    <div>{seriesInfo.modality} - {seriesInfo.seriesDescription || "Serie"}</div>
                  </div>
                  <div className="absolute top-4 right-4 text-white text-sm bg-black/60 px-3 py-1 rounded pointer-events-none">
                    <span className="font-bold">{currentIndex + 1}</span>
                    <span className="text-gray-300"> / {files.length}</span>
                  </div>
                  <div className="absolute bottom-4 right-4 text-white text-xs bg-black/60 p-2 rounded pointer-events-none">
                    <div>W: {windowLevel.width} / L: {windowLevel.center}</div>
                  </div>
                  {isPlaying && (
                    <div className="absolute bottom-4 left-4 text-green-400 text-xs bg-black/60 px-2 py-1 rounded pointer-events-none flex items-center gap-1">
                      <Play className="h-3 w-3" /> Reproduciendo
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
