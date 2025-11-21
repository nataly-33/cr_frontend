import { useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Ruler,
  Move,
  Settings,
} from "lucide-react";
import { Button, Card } from "@shared/components/ui";

interface DicomViewerProps {
  /** URL del archivo DICOM o imagen médica */
  dicomUrl?: string;
  /** Legacy prop name used elsewhere */
  imageUrl?: string;
  /** Tipo de estudio (CT, MRI, etc.) */
  modality?: string;
  /** Presets de ventana/nivel opcionales */
  windowPresets?: Array<{
    name: string;
    windowWidth: number;
    windowCenter: number;
  }>;
}

/**
 * Visor DICOM simplificado
 *
 * TODO: Implementar cornerstoneJS v3 con las APIs actualizadas
 * Actualmente muestra un placeholder mientras se configura la librería
 */
export const DicomViewer = ({
  dicomUrl,
  imageUrl,
  modality = "CT",
  windowPresets,
}: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<string>("Pan");
  const [currentPreset, setCurrentPreset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Presets por defecto según modalidad
  const defaultPresets = windowPresets || getDefaultPresets(modality);

  // Accept both `dicomUrl` and legacy `imageUrl`
  const sourceUrl = dicomUrl ?? imageUrl ?? undefined;

  const handleZoomIn = () => {
    setZoom((z) => z + 0.2);
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.2, z - 0.2));
  };

  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
  };

  const handlePresetChange = (index: number) => {
    setCurrentPreset(index);
  };

  const getVariant = (toolName: string): any => {
    return activeTool === toolName ? "default" : "outline";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de herramientas superior */}
      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Herramientas básicas */}
          <div className="flex items-center gap-2">
            <Button
              variant={getVariant("Pan") as any}
              size="sm"
              onClick={() => handleToolChange("Pan")}
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
              onClick={handleResetView}
              title="Restaurar vista"
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600 ml-4">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Herramientas de medición */}
          <div className="flex items-center gap-2">
            <Button
              variant={getVariant("Wwwc") as any}
              size="sm"
              onClick={() => handleToolChange("Wwwc")}
              title="Ajustar ventana/nivel"
            >
              <Settings className="h-4 w-4" />
              <span className="ml-2 text-sm">W/L</span>
            </Button>

            <Button
              variant={getVariant("Length") as any}
              size="sm"
              onClick={() => handleToolChange("Length")}
              title="Medir distancia"
            >
              <Ruler className="h-4 w-4" />
              <span className="ml-2 text-sm">Medir</span>
            </Button>

            <Button
              variant={getVariant("Angle") as any}
              size="sm"
              onClick={() => handleToolChange("Angle")}
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
              {defaultPresets.map((preset: { name: string }, index: number) => (
                <option key={index} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Área del visor DICOM */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
        <div
          ref={viewerRef}
          className="w-full h-full flex items-center justify-center"
          style={{
            minHeight: "500px",
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease-in-out",
          }}
        >
          {/* Placeholder - Imagen DICOM */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-gray-400 text-center">
              <p className="mb-2">Visor DICOM</p>
              <p className="text-sm text-gray-500">Modalidad: {modality}</p>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2 break-all max-w-xs"
                >
                  {sourceUrl}
                </a>
              )}
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>Zoom: {(zoom * 100).toFixed(0)}%</p>
                <p>Rotación: {rotation}°</p>
                <p>Herramienta activa: {activeTool}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la imagen (overlay) */}
        <div className="absolute top-4 left-4 text-white text-sm space-y-1 bg-black/60 p-3 rounded">
          <div>Modalidad: {modality}</div>
          <div className="text-xs text-gray-300">
            Herramienta: {activeTool}
            <br />
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <strong>Nota:</strong> El visor DICOM completo con cornerstoneJS está en
        desarrollo. Actualmente se puede descargar la imagen mediante el enlace
        proporcionado.
      </div>
    </div>
  );
};

// Presets de ventana/nivel según modalidad
function getDefaultPresets(modality: string) {
  const presets: Record<
    string,
    Array<{ name: string; windowWidth: number; windowCenter: number }>
  > = {
    CT: [
      { name: "Pulmón", windowWidth: 1500, windowCenter: -600 },
      { name: "Mediastino", windowWidth: 350, windowCenter: 50 },
      { name: "Hueso", windowWidth: 2500, windowCenter: 480 },
      { name: "Cerebro", windowWidth: 80, windowCenter: 40 },
      { name: "Hígado", windowWidth: 150, windowCenter: 30 },
    ],
    MRI: [
      { name: "T1", windowWidth: 600, windowCenter: 300 },
      { name: "T2", windowWidth: 400, windowCenter: 200 },
      { name: "FLAIR", windowWidth: 500, windowCenter: 250 },
    ],
    CR: [
      { name: "Tórax", windowWidth: 2000, windowCenter: 1000 },
      { name: "Abdomen", windowWidth: 400, windowCenter: 40 },
    ],
    US: [{ name: "General", windowWidth: 256, windowCenter: 128 }],
  };

  return (
    presets[modality] || [
      { name: "General", windowWidth: 400, windowCenter: 40 },
    ]
  );
}
