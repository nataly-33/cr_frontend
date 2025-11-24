import { useRef, useState, useEffect, useCallback } from "react";
import * as cornerstone from "@cornerstonejs/core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Ruler,
  Move,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button, Card } from "@shared/components/ui";
import {
  useCornerstoneInit,
  createBasicToolGroup,
  destroyToolGroup,
} from "../hooks/useCornerstoneInit";
import type { SeriesViewerConfig, ViewerTool } from "../types";

interface DicomViewerProps {
  /** Configuración de la serie a visualizar */
  seriesConfig: SeriesViewerConfig;
  /** Callback cuando cambia el índice de imagen */
  onImageChange?: (index: number, total: number) => void;
  /** Altura del visor */
  height?: string;
}

const TOOL_GROUP_ID = "DICOM_VIEWER_TOOL_GROUP";
const VIEWPORT_ID = "DICOM_VIEWPORT";
const RENDERING_ENGINE_ID = "DICOM_RENDERING_ENGINE";

/**
 * Visor DICOM completo con Cornerstone3D
 * Soporta navegación de stack, herramientas de medición y ajuste de ventana/nivel
 */
export const DicomViewer = ({
  seriesConfig,
  onImageChange,
  height = "600px",
}: DicomViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<cornerstone.Types.IStackViewport | null>(null);
  const renderingEngineRef = useRef<cornerstone.RenderingEngine | null>(null);

  const { initialized, isLoading: initLoading, error: initError } = useCornerstoneInit();

  const [activeTool, setActiveTool] = useState<ViewerTool>("Pan");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [windowLevel, setWindowLevel] = useState({
    width: seriesConfig.default_window.window_width,
    center: seriesConfig.default_window.window_center,
  });
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);

  const totalImages = seriesConfig.image_ids.length;

  // Inicializar el viewport cuando Cornerstone está listo
  useEffect(() => {
    if (!initialized || !containerRef.current) return;

    const setupViewport = async () => {
      try {
        setIsImageLoading(true);
        setViewerError(null);

        // Crear rendering engine
        const renderingEngine = new cornerstone.RenderingEngine(RENDERING_ENGINE_ID);
        renderingEngineRef.current = renderingEngine;

        // Configurar viewport
        const viewportInput: cornerstone.Types.PublicViewportInput = {
          viewportId: VIEWPORT_ID,
          type: cornerstone.Enums.ViewportType.STACK,
          element: containerRef.current!,
          defaultOptions: {
            background: [0, 0, 0] as cornerstone.Types.Point3,
          },
        };

        renderingEngine.enableElement(viewportInput);

        // Obtener el viewport
        const viewport = renderingEngine.getViewport(
          VIEWPORT_ID
        ) as cornerstone.Types.IStackViewport;
        viewportRef.current = viewport;

        // Crear tool group y asociar al viewport
        createBasicToolGroup(TOOL_GROUP_ID);
        const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
        toolGroup?.addViewport(VIEWPORT_ID, RENDERING_ENGINE_ID);

        // Cargar las imágenes
        await viewport.setStack(seriesConfig.image_ids, 0);

        // Aplicar window/level inicial
        viewport.setProperties({
          voiRange: {
            lower: windowLevel.center - windowLevel.width / 2,
            upper: windowLevel.center + windowLevel.width / 2,
          },
        });

        viewport.render();
        setIsImageLoading(false);

        // Escuchar cambios de imagen
        containerRef.current?.addEventListener(
          cornerstone.Enums.Events.STACK_NEW_IMAGE,
          handleImageRendered as EventListener
        );
      } catch (err) {
        console.error("Error inicializando viewport:", err);
        setViewerError(err instanceof Error ? err.message : "Error al cargar las imágenes");
        setIsImageLoading(false);
      }
    };

    setupViewport();

    // Cleanup
    return () => {
      containerRef.current?.removeEventListener(
        cornerstone.Enums.Events.STACK_NEW_IMAGE,
        handleImageRendered as EventListener
      );
      destroyToolGroup(TOOL_GROUP_ID);
      renderingEngineRef.current?.destroy();
      renderingEngineRef.current = null;
      viewportRef.current = null;
    };
  }, [initialized, seriesConfig.image_ids]);

  // Handler para cuando se renderiza una nueva imagen
  const handleImageRendered = useCallback(
    (event: cornerstone.Types.EventTypes.StackNewImageEvent) => {
      const { imageIdIndex } = event.detail;
      setCurrentImageIndex(imageIdIndex);
      onImageChange?.(imageIdIndex, totalImages);
    },
    [onImageChange, totalImages]
  );

  // Navegación de imágenes
  const goToImage = useCallback(
    (index: number) => {
      if (!viewportRef.current) return;
      const clampedIndex = Math.max(0, Math.min(index, totalImages - 1));
      viewportRef.current.setImageIdIndex(clampedIndex);
      setCurrentImageIndex(clampedIndex);
    },
    [totalImages]
  );

  const goToPrevious = useCallback(() => {
    goToImage(currentImageIndex - 1);
  }, [currentImageIndex, goToImage]);

  const goToNext = useCallback(() => {
    goToImage(currentImageIndex + 1);
  }, [currentImageIndex, goToImage]);

  // Cambiar herramienta activa
  const handleToolChange = useCallback((tool: ViewerTool) => {
    const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) return;

    const toolNameMap: Record<ViewerTool, string> = {
      Pan: cornerstoneTools.PanTool.toolName,
      Zoom: cornerstoneTools.ZoomTool.toolName,
      WindowLevel: cornerstoneTools.WindowLevelTool.toolName,
      Length: cornerstoneTools.LengthTool.toolName,
      Angle: cornerstoneTools.AngleTool.toolName,
      Rectangle: cornerstoneTools.RectangleROITool.toolName,
      Ellipse: cornerstoneTools.EllipticalROITool.toolName,
      Crosshairs: cornerstoneTools.CrosshairsTool.toolName,
      StackScroll: cornerstoneTools.StackScrollTool.toolName,
    };

    const toolName = toolNameMap[tool];
    if (toolName) {
      toolGroup.setToolActive(toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
      });
      setActiveTool(tool);
    }
  }, []);

  // Aplicar preset de window/level
  const applyPreset = useCallback(
    (index: number) => {
      if (!viewportRef.current) return;

      const preset = seriesConfig.window_presets[index];
      if (!preset) return;

      setCurrentPresetIndex(index);
      setWindowLevel({ width: preset.window_width, center: preset.window_center });

      viewportRef.current.setProperties({
        voiRange: {
          lower: preset.window_center - preset.window_width / 2,
          upper: preset.window_center + preset.window_width / 2,
        },
      });
      viewportRef.current.render();
    },
    [seriesConfig.window_presets]
  );

  // Reset del visor
  const handleReset = useCallback(() => {
    if (!viewportRef.current) return;
    viewportRef.current.resetCamera();
    viewportRef.current.render();
  }, []);

  // Zoom
  const handleZoom = useCallback((factor: number) => {
    if (!viewportRef.current) return;
    const camera = viewportRef.current.getCamera();
    const newZoom = (camera.parallelScale || 1) / factor;
    viewportRef.current.setCamera({ parallelScale: newZoom });
    viewportRef.current.render();
  }, []);

  // Rotación (usando flip en lugar de rotation que no existe en StackViewport)
  const handleRotate = useCallback(() => {
    if (!viewportRef.current) return;
    // StackViewport no soporta rotation directamente, usamos flip horizontal como alternativa
    const currentFlipH = viewportRef.current.getCamera().flipHorizontal || false;
    viewportRef.current.setCamera({ flipHorizontal: !currentFlipH });
    viewportRef.current.render();
  }, []);

  // Helper para variant del botón - usando tipos correctos de ButtonVariant
  const getButtonVariant = (tool: ViewerTool): "primary" | "outline" =>
    activeTool === tool ? "primary" : "outline";

  // Estados de carga y error
  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Inicializando visor DICOM...</p>
        </div>
      </div>
    );
  }

  if (initError || viewerError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-red-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Error en el visor</p>
          <p className="text-sm text-gray-400 mt-1">{initError || viewerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Barra de herramientas */}
      <Card className="p-3 mb-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Herramientas de navegación */}
          <div className="flex items-center gap-2">
            <Button
              variant={getButtonVariant("Pan")}
              size="sm"
              onClick={() => handleToolChange("Pan")}
              title="Mover (Pan)"
            >
              <Move className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => handleZoom(1.2)} title="Acercar">
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => handleZoom(0.8)} title="Alejar">
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleRotate} title="Rotar 90°">
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset} title="Restaurar vista">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Herramientas de medición */}
          <div className="flex items-center gap-2">
            <Button
              variant={getButtonVariant("WindowLevel")}
              size="sm"
              onClick={() => handleToolChange("WindowLevel")}
              title="Ajustar ventana/nivel"
            >
              <Settings className="h-4 w-4" />
              <span className="ml-1 text-xs">W/L</span>
            </Button>

            <Button
              variant={getButtonVariant("Length")}
              size="sm"
              onClick={() => handleToolChange("Length")}
              title="Medir distancia"
            >
              <Ruler className="h-4 w-4" />
            </Button>

            <Button
              variant={getButtonVariant("Angle")}
              size="sm"
              onClick={() => handleToolChange("Angle")}
              title="Medir ángulo"
            >
              <span className="text-sm">∠</span>
            </Button>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Preset:</span>
            <select
              className="px-3 py-1 border rounded-md text-sm"
              value={currentPresetIndex}
              onChange={(e) => applyPreset(Number(e.target.value))}
            >
              {seriesConfig.window_presets.map((preset, index) => (
                <option key={index} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navegación de imágenes */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono min-w-[80px] text-center">
              {currentImageIndex + 1} / {totalImages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentImageIndex >= totalImages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Área del visor */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Cargando imágenes...</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Overlay de información */}
        <div className="absolute top-4 left-4 text-white text-xs space-y-1 bg-black/60 p-2 rounded pointer-events-none">
          <div>Modalidad: {seriesConfig.modality}</div>
          <div>Serie: {seriesConfig.description || "Sin descripción"}</div>
          <div>
            W: {windowLevel.width} / L: {windowLevel.center}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white text-xs bg-black/60 p-2 rounded pointer-events-none">
          <div>Herramienta: {activeTool}</div>
          <div>
            Imagen: {currentImageIndex + 1}/{totalImages}
          </div>
        </div>
      </div>
    </div>
  );
};
