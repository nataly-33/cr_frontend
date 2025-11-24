import { useState } from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Info,
  Monitor,
  Layers,
  Move3D,
  Crosshair,
} from "lucide-react";
import { Button, Card } from "@shared/components/ui";

/**
 * Página que integra OHIF Viewer (visor DICOM avanzado)
 * OHIF es un visor médico open-source usado en hospitales
 * Soporta: MPR, 3D, fusión PET-CT, mediciones, anotaciones, etc.
 */
export const OHIFViewerPage = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>("basic");

  // Demos disponibles de OHIF
  const demos = [
    {
      id: "basic",
      name: "Visor Básico",
      description: "Navegación de series CT/MR con herramientas estándar",
      url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=1.3.6.1.4.1.25403.345050719074.3824.20170125095438.5",
      icon: Monitor,
    },
    {
      id: "mpr",
      name: "MPR (Multiplanar)",
      description: "Reconstrucción multiplanar: Axial, Sagital, Coronal",
      url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=1.3.6.1.4.1.25403.345050719074.3824.20170125095438.5&hangingprotocolId=mpr",
      icon: Layers,
    },
    {
      id: "3d",
      name: "Volumen 3D",
      description: "Renderizado volumétrico 3D de estudios CT",
      url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=1.3.6.1.4.1.25403.345050719074.3824.20170125095438.5&hangingprotocolId=3d",
      icon: Move3D,
    },
    {
      id: "petct",
      name: "Fusión PET-CT",
      description: "Visualización fusionada de estudios PET y CT con crosshairs sincronizados",
      url: "https://viewer.ohif.org/viewer?StudyInstanceUIDs=1.3.6.1.4.1.32722.99.99.62087908445911357848990987523264512595",
      icon: Crosshair,
    },
  ];

  const selectedDemoData = demos.find((d) => d.id === selectedDemo);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    if (selectedDemoData) {
      window.open(selectedDemoData.url, "_blank");
    }
  };

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-6"}`}>
      {/* Header - oculto en fullscreen */}
      {!isFullscreen && (
        <div>
          <h1 className="text-2xl font-bold">Visor DICOM Avanzado (OHIF)</h1>
          <p className="text-gray-600">
            Visor médico profesional con soporte para MPR, 3D, fusión PET-CT y más
          </p>
        </div>
      )}

      <div className={`${isFullscreen ? "h-full" : "grid grid-cols-1 lg:grid-cols-4 gap-6"}`}>
        {/* Panel de selección - oculto en fullscreen */}
        {!isFullscreen && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Demos Disponibles</h3>
              <div className="space-y-2">
                {demos.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setSelectedDemo(demo.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedDemo === demo.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{demo.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{demo.description}</p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 mb-1">Sobre OHIF Viewer</p>
                  <p>
                    OHIF es un visor DICOM open-source usado en hospitales y centros de
                    investigación. Soporta DICOM, WADO-RS, y múltiples formatos de imagen médica.
                  </p>
                  <a
                    href="https://ohif.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Más información <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Controles del Visor</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Click izquierdo:</strong> Herramienta activa</li>
                <li>• <strong>Click medio:</strong> Pan (mover)</li>
                <li>• <strong>Click derecho:</strong> Zoom</li>
                <li>• <strong>Scroll:</strong> Navegar entre cortes</li>
                <li>• <strong>Ctrl + Scroll:</strong> Zoom</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Visor OHIF */}
        <div className={isFullscreen ? "h-full" : "lg:col-span-3"}>
          <Card className={`overflow-hidden ${isFullscreen ? "h-full rounded-none" : ""}`}>
            {/* Barra de herramientas del iframe */}
            <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedDemoData?.name || "Visor OHIF"}
                </span>
                <span className="text-xs text-gray-500">
                  ({selectedDemoData?.description})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={openInNewTab} title="Abrir en nueva pestaña">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleFullscreen} title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* iframe con OHIF */}
            <div className={isFullscreen ? "h-[calc(100%-48px)]" : "h-[700px]"}>
              <iframe
                src={selectedDemoData?.url}
                className="w-full h-full border-0"
                title="OHIF DICOM Viewer"
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Botón flotante para salir de fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
          title="Salir de pantalla completa"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
