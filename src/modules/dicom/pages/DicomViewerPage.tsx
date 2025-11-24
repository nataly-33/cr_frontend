import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  FileImage,
  Info,
  List,
} from "lucide-react";
import { Button, Badge } from "@shared/components/ui";
import { dicomService } from "../services/dicom.service";
import { DicomViewer } from "../components/DicomViewer";
import type { SeriesViewerConfig, Modality } from "../types";

const MODALITY_LABELS: Record<Modality, string> = {
  CT: "Tomografía Computarizada",
  MRI: "Resonancia Magnética",
  CR: "Radiografía Computarizada",
  US: "Ultrasonido",
  DX: "Radiografía Digital",
  MG: "Mamografía",
  NM: "Medicina Nuclear",
  PT: "PET",
  XA: "Angiografía",
  RF: "Fluoroscopia",
  OT: "Otro",
};

export const DicomViewerPage = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState(0);
  const [showSeriesList, setShowSeriesList] = useState(true);

  const {
    data: viewerConfig,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dicom-viewer-config", studyId],
    queryFn: () => dicomService.getStudyViewerConfig(studyId!),
    enabled: !!studyId,
  });

  const selectedSeries: SeriesViewerConfig | undefined =
    viewerConfig?.series[selectedSeriesIndex];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Cargando estudio DICOM...</p>
        </div>
      </div>
    );
  }

  if (error || !viewerConfig) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Error al cargar el estudio</p>
          <p className="text-sm text-gray-400 mt-2">
            No se pudo obtener la configuración del visor.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/dicom")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dicom")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <div className="border-l pl-4">
              <h1 className="font-semibold">
                {viewerConfig.study_description || "Estudio DICOM"}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {viewerConfig.patient && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {viewerConfig.patient.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(viewerConfig.study_date)}
                </span>
                <Badge>{viewerConfig.modality}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {viewerConfig.total_instances} imágenes en{" "}
              {viewerConfig.series.length} serie(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSeriesList(!showSeriesList)}
            >
              <List className="h-4 w-4 mr-2" />
              Series
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel lateral de series */}
        {showSeriesList && (
          <aside className="w-72 bg-white border-r overflow-y-auto">
            <div className="p-3 border-b">
              <h2 className="font-medium text-sm text-gray-700">
                Series del Estudio
              </h2>
            </div>
            <div className="divide-y">
              {viewerConfig.series.map((series, index) => (
                <button
                  key={series.series_id}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedSeriesIndex === index
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedSeriesIndex(index)}
                >
                  <div className="flex items-start gap-2">
                    <FileImage className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {series.description || `Serie ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {series.modality} · {series.instances_count} imágenes
                      </div>
                      {series.volume_config.is_volumetric && (
                        <Badge className="mt-1 text-xs bg-purple-100 text-purple-700">
                          Volumétrico
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Visor principal */}
        <main className="flex-1 p-4 overflow-hidden">
          {selectedSeries ? (
            <DicomViewer
              seriesConfig={selectedSeries}
              height="calc(100vh - 140px)"
              onImageChange={() => {
                // Opcional: actualizar estado o UI externa
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>Selecciona una serie para visualizar</p>
              </div>
            </div>
          )}
        </main>

        {/* Panel de información (opcional) */}
        {selectedSeries && (
          <aside className="w-64 bg-white border-l overflow-y-auto hidden xl:block">
            <div className="p-3 border-b">
              <h2 className="font-medium text-sm text-gray-700">
                Información de la Serie
              </h2>
            </div>
            <div className="p-3 space-y-3 text-sm">
              <div>
                <label className="text-gray-500 text-xs">Modalidad</label>
                <div className="font-medium">
                  {MODALITY_LABELS[selectedSeries.modality] || selectedSeries.modality}
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-xs">Descripción</label>
                <div className="font-medium">
                  {selectedSeries.description || "—"}
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-xs">Imágenes</label>
                <div className="font-medium">{selectedSeries.instances_count}</div>
              </div>

              {selectedSeries.volume_config.is_volumetric && (
                <>
                  <div className="border-t pt-3">
                    <label className="text-gray-500 text-xs">Dimensiones</label>
                    <div className="font-medium font-mono text-xs">
                      {selectedSeries.volume_config.dimensions.join(" × ")}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 text-xs">Espaciado (mm)</label>
                    <div className="font-medium font-mono text-xs">
                      {selectedSeries.volume_config.spacing
                        .map((s) => s.toFixed(2))
                        .join(" × ")}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-3">
                <label className="text-gray-500 text-xs">Presets de Ventana</label>
                <div className="space-y-1 mt-1">
                  {selectedSeries.window_presets.map((preset, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{preset.name}:</span>{" "}
                      <span className="text-gray-500">
                        W:{preset.window_width} L:{preset.window_center}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
