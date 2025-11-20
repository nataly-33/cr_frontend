import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  RefreshCw,
} from 'lucide-react';
import { Button, Card } from '@shared/components/ui';

interface DicomViewerProps {
  /** URL del archivo DICOM o imagen médica */
  imageUrl: string;
  /** Tipo de estudio (CT, MRI, etc.) */
  modality?: string;
}

/**
 * Visor de imágenes médicas con herramientas básicas
 *
 * NOTA: Este es un visor simplificado para imágenes médicas.
 * Para funcionalidad completa DICOM (windowing, mediciones, etc.)
 * se recomienda integrar Cornerstone.js 3D o OHIF Viewer.
 */
export const DicomViewer = ({
  imageUrl,
  modality = 'CT',
}: DicomViewerProps) => {
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [invert, setInvert] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setScale(1.0);
    setRotation(0);
    setInvert(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleInvert = () => {
    setInvert(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de herramientas superior */}
      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Herramientas básicas */}
          <div className="flex items-center gap-2">
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

            <span className="text-sm text-gray-600 ml-4">
              Zoom: {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Información */}
          <div className="text-sm text-gray-600">
            Modalidad: {modality}
          </div>
        </div>
      </Card>

      {/* Área del visor */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Imagen médica"
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              filter: invert ? 'invert(1)' : 'none',
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out, filter 0.2s ease-out',
            }}
          />
        </div>

        {/* Información de la imagen (overlay) */}
        <div className="absolute top-4 left-4 text-white text-sm space-y-1 bg-black/60 p-3 rounded">
          <div>Modalidad: {modality}</div>
          <div className="text-xs text-gray-300">
            Usar scroll para zoom<br />
            Click y arrastrar para mover
          </div>
        </div>

        {/* Nota sobre funcionalidad avanzada */}
        <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-blue-600/80 p-3 rounded">
          <strong>ℹ️ Visor Simplificado</strong><br />
          Este es un visor básico. Para funcionalidad completa DICOM (windowing, mediciones, MPR),
          se requiere integrar <a href="https://www.cornerstonejs.org/" target="_blank" rel="noopener noreferrer" className="underline">Cornerstone.js 3D</a> o <a href="https://ohif.org/" target="_blank" rel="noopener noreferrer" className="underline">OHIF Viewer</a>.
        </div>
      </div>
    </div>
  );
};
