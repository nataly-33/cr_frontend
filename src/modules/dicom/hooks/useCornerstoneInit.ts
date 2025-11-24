import { useState, useEffect, useCallback } from "react";
import * as cornerstone from "@cornerstonejs/core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import * as dicomImageLoader from "@cornerstonejs/dicom-image-loader";

// Estado global de inicialización
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Hook para inicializar Cornerstone3D y sus herramientas.
 * Solo inicializa una vez aunque se use en múltiples componentes.
 */
export function useCornerstoneInit() {
  const [initialized, setInitialized] = useState(isInitialized);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isInitialized);

  const initializeCornerstone = useCallback(async () => {
    // Si ya está inicializado, no hacer nada
    if (isInitialized) {
      setInitialized(true);
      setIsLoading(false);
      return;
    }

    // Si hay una inicialización en progreso, esperar
    if (initializationPromise) {
      try {
        await initializationPromise;
        setInitialized(true);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de inicialización");
        setIsLoading(false);
      }
      return;
    }

    // Iniciar nueva inicialización
    initializationPromise = (async () => {
      try {
        // 1. Inicializar Cornerstone Core
        await cornerstone.init();

        // 2. Inicializar el DICOM image loader con configuración completa
        dicomImageLoader.init({
          maxWebWorkers: navigator.hardwareConcurrency || 1,
        });

        // 3. Registrar los image loaders con cornerstone
        cornerstone.imageLoader.registerImageLoader(
          "wadouri",
          dicomImageLoader.wadouri.loadImage as unknown as cornerstone.Types.ImageLoaderFn
        );
        cornerstone.imageLoader.registerImageLoader(
          "wadors",
          dicomImageLoader.wadors.loadImage as unknown as cornerstone.Types.ImageLoaderFn
        );

        // 4. Registrar metadata provider
        cornerstone.metaData.addProvider(
          dicomImageLoader.wadouri.metaData.metaDataProvider,
          10000 // priority
        );

        // 5. Inicializar herramientas
        await cornerstoneTools.init();

        // 4. Agregar herramientas al gestor
        const {
          PanTool,
          ZoomTool,
          WindowLevelTool,
          StackScrollTool,
          LengthTool,
          AngleTool,
          RectangleROITool,
          EllipticalROITool,
          CrosshairsTool,
        } = cornerstoneTools;

        cornerstoneTools.addTool(PanTool);
        cornerstoneTools.addTool(ZoomTool);
        cornerstoneTools.addTool(WindowLevelTool);
        cornerstoneTools.addTool(StackScrollTool);
        cornerstoneTools.addTool(LengthTool);
        cornerstoneTools.addTool(AngleTool);
        cornerstoneTools.addTool(RectangleROITool);
        cornerstoneTools.addTool(EllipticalROITool);
        cornerstoneTools.addTool(CrosshairsTool);

        isInitialized = true;
      } catch (err) {
        initializationPromise = null;
        throw err;
      }
    })();

    try {
      await initializationPromise;
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inicializando Cornerstone");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeCornerstone();
  }, [initializeCornerstone]);

  return {
    initialized,
    isLoading,
    error,
    cornerstone,
    cornerstoneTools,
  };
}

/**
 * Crea un ToolGroup con las herramientas básicas configuradas
 */
export function createBasicToolGroup(toolGroupId: string): cornerstoneTools.Types.IToolGroup {
  const toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);

  if (!toolGroup) {
    throw new Error(`No se pudo crear el tool group: ${toolGroupId}`);
  }

  // Agregar herramientas al grupo
  toolGroup.addTool(cornerstoneTools.PanTool.toolName);
  toolGroup.addTool(cornerstoneTools.ZoomTool.toolName);
  toolGroup.addTool(cornerstoneTools.WindowLevelTool.toolName);
  toolGroup.addTool(cornerstoneTools.StackScrollTool.toolName);
  toolGroup.addTool(cornerstoneTools.LengthTool.toolName);
  toolGroup.addTool(cornerstoneTools.AngleTool.toolName);
  toolGroup.addTool(cornerstoneTools.RectangleROITool.toolName);
  toolGroup.addTool(cornerstoneTools.EllipticalROITool.toolName);

  // Configurar bindings por defecto
  // Click izquierdo: herramienta activa (inicialmente Pan)
  toolGroup.setToolActive(cornerstoneTools.PanTool.toolName, {
    bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
  });

  // Click derecho: Window/Level
  toolGroup.setToolActive(cornerstoneTools.WindowLevelTool.toolName, {
    bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Secondary }],
  });

  // Scroll: navegación de stack
  toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
    bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
  });

  // Herramientas pasivas (disponibles pero no activas por defecto)
  toolGroup.setToolPassive(cornerstoneTools.ZoomTool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.LengthTool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.AngleTool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.RectangleROITool.toolName);
  toolGroup.setToolPassive(cornerstoneTools.EllipticalROITool.toolName);

  return toolGroup;
}

/**
 * Activa una herramienta específica en un ToolGroup
 */
export function setActiveTool(
  toolGroupId: string,
  toolName: string,
  mouseButton: number = cornerstoneTools.Enums.MouseBindings.Primary
): void {
  const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);

  if (!toolGroup) {
    console.warn(`ToolGroup no encontrado: ${toolGroupId}`);
    return;
  }

  // Activar la nueva herramienta
  toolGroup.setToolActive(toolName, {
    bindings: [{ mouseButton }],
  });
}

/**
 * Limpia un ToolGroup
 */
export function destroyToolGroup(toolGroupId: string): void {
  cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroupId);
}
