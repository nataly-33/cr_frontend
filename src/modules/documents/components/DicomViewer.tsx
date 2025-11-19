import { useEffect, useRef, useState } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Ruler,
  Move,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button, Card } from '@shared/components/ui';

// Configurar DICOM Image Loader
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

interface DicomViewerProps {
  /** URL del archivo DICOM */
  dicomUrl: string;
  /** Tipo de estudio (CT, MRI, etc.) */
  modality?: string;
  /** Presets de ventana/nivel */
  windowPresets?: {
    name: string;
    windowWidth: number;
    windowCenter: number;
  }[];
}

export const DicomViewer = ({
  dicomUrl,
  modality = 'CT',
  windowPresets
}: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('Pan');
  const [currentPreset, setCurrentPreset] = useState(0);

  // Presets por defecto según modalidad
  const defaultPresets = windowPresets || getDefaultPresets(modality);

  useEffect(() => {
    if (viewerRef.current) {
      setElement(viewerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!element || !dicomUrl) return;

    const loadAndDisplayImage = async () => {
      try {
        // Habilitar elemento para Cornerstone
        cornerstone.enable(element);

        // Cargar imagen DICOM
        const imageId = `wadouri:${dicomUrl}`;
        const image = await cornerstone.loadImage(imageId);

        // Mostrar imagen
        cornerstone.displayImage(element, image);

        // Aplicar preset inicial
        const preset = defaultPresets[0];
        if (preset) {
          const viewport = cornerstone.getViewport(element);
          viewport.voi.windowWidth = preset.windowWidth;
          viewport.voi.windowCenter = preset.windowCenter;
          cornerstone.setViewport(element, viewport);
        }

        // Ajustar al tamaño del contenedor
        cornerstone.resize(element);

        setImageLoaded(true);

        // Configurar herramientas
        initializeTools(element);

      } catch (error) {
        console.error('Error cargando imagen DICOM:', error);
      }
    };

    loadAndDisplayImage();

    // Cleanup
    return () => {
      if (element) {
        cornerstone.disable(element);
      }
    };
  }, [element, dicomUrl]);

  const initializeTools = (el: HTMLDivElement) => {
    // Inicializar herramientas de Cornerstone
    cornerstoneTools.init();

    // Agregar herramientas
    const PanTool = cornerstoneTools.PanTool;
    const ZoomTool = cornerstoneTools.ZoomTool;
    const WwwcTool = cornerstoneTools.WwwcTool; // Window Width/Window Center
    const LengthTool = cornerstoneTools.LengthTool;
    const AngleTool = cornerstoneTools.AngleTool;
    const MagnifyTool = cornerstoneTools.MagnifyTool;

    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTool);
    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.addTool(LengthTool);
    cornerstoneTools.addTool(AngleTool);
    cornerstoneTools.addTool(MagnifyTool);

    // Activar Pan por defecto con click izquierdo
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
  };

  const handleZoomIn = () => {
    if (!element) return;
    const viewport = cornerstone.getViewport(element);
    viewport.scale += 0.2;
    cornerstone.setViewport(element, viewport);
  };

  const handleZoomOut = () => {
    if (!element) return;
    const viewport = cornerstone.getViewport(element);
    viewport.scale = Math.max(0.2, viewport.scale - 0.2);
    cornerstone.setViewport(element, viewport);
  };

  const handleResetView = () => {
    if (!element) return;
    cornerstone.reset(element);
    cornerstone.resize(element);
  };

  const handleRotate = () => {
    if (!element) return;
    const viewport = cornerstone.getViewport(element);
    viewport.rotation = (viewport.rotation + 90) % 360;
    cornerstone.setViewport(element, viewport);
  };

  const handleInvert = () => {
    if (!element) return;
    const viewport = cornerstone.getViewport(element);
    viewport.invert = !viewport.invert;
    cornerstone.setViewport(element, viewport);
  };

  const handleToolChange = (toolName: string) => {
    if (!element) return;

    // Desactivar herramienta anterior
    cornerstoneTools.setToolPassive(activeTool);

    // Activar nueva herramienta
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
    setActiveTool(toolName);
  };

  const handlePresetChange = (index: number) => {
    if (!element) return;

    const preset = defaultPresets[index];
    const viewport = cornerstone.getViewport(element);
    viewport.voi.windowWidth = preset.windowWidth;
    viewport.voi.windowCenter = preset.windowCenter;
    cornerstone.setViewport(element, viewport);

    setCurrentPreset(index);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de herramientas superior */}
      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Herramientas básicas */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTool === 'Pan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolChange('Pan')}
              title="Mover (Pan)"
            >
              <Move className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              title="Rotar 90°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleInvert}
              title="Invertir colores"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              title="Restaurar vista"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Herramientas de medición */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTool === 'Wwwc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolChange('Wwwc')}
              title="Ajustar ventana/nivel"
            >
              <Settings className="h-4 w-4" />
              <span className="ml-2 text-sm">W/L</span>
            </Button>

            <Button
              variant={activeTool === 'Length' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolChange('Length')}
              title="Medir distancia"
            >
              <Ruler className="h-4 w-4" />
              <span className="ml-2 text-sm">Medir</span>
            </Button>

            <Button
              variant={activeTool === 'Angle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolChange('Angle')}
              title="Medir ángulo"
            >
              <span className="text-sm">∠</span>
            </Button>
          </div>

          {/* Presets de ventana/nivel */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Preset:</span>
            <select
              className="px-3 py-1 border rounded-md text-sm"
              value={currentPreset}
              onChange={(e) => handlePresetChange(Number(e.target.value))}
            >
              {defaultPresets.map((preset, index) => (
                <option key={index} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Área del visor DICOM */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        <div
          ref={viewerRef}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p>Cargando imagen DICOM...</p>
            </div>
          </div>
        )}

        {/* Información de la imagen (overlay) */}
        {imageLoaded && (
          <div className="absolute top-4 left-4 text-white text-sm space-y-1 bg-black/60 p-3 rounded">
            <div>Modalidad: {modality}</div>
            <div className="text-xs text-gray-300">
              Click izquierdo: {activeTool}<br />
              Scroll: Zoom
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Presets de ventana/nivel según modalidad
function getDefaultPresets(modality: string) {
  const presets: Record<string, any[]> = {
    CT: [
      { name: 'Pulmón', windowWidth: 1500, windowCenter: -600 },
      { name: 'Mediastino', windowWidth: 350, windowCenter: 50 },
      { name: 'Hueso', windowWidth: 2500, windowCenter: 480 },
      { name: 'Cerebro', windowWidth: 80, windowCenter: 40 },
      { name: 'Hígado', windowWidth: 150, windowCenter: 30 },
    ],
    MRI: [
      { name: 'T1', windowWidth: 600, windowCenter: 300 },
      { name: 'T2', windowWidth: 400, windowCenter: 200 },
      { name: 'FLAIR', windowWidth: 500, windowCenter: 250 },
    ],
    CR: [
      { name: 'Tórax', windowWidth: 2000, windowCenter: 1000 },
      { name: 'Abdomen', windowWidth: 400, windowCenter: 40 },
    ],
    US: [
      { name: 'General', windowWidth: 256, windowCenter: 128 },
    ],
  };

  return presets[modality] || [
    { name: 'General', windowWidth: 400, windowCenter: 40 }
  ];
}
