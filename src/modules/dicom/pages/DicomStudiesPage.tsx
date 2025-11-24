import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Upload,
  FileImage,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button, Card, Table, Badge, SearchInput, Modal } from "@shared/components/ui";
import type { Column } from "@shared/components/ui";
import { dicomService } from "../services/dicom.service";
import { DicomUploader } from "../components/DicomUploader";
import type { DicomStudy, Modality } from "../types";

const MODALITY_COLORS: Record<Modality, string> = {
  CT: "bg-blue-100 text-blue-800",
  MRI: "bg-purple-100 text-purple-800",
  CR: "bg-green-100 text-green-800",
  US: "bg-yellow-100 text-yellow-800",
  DX: "bg-orange-100 text-orange-800",
  MG: "bg-pink-100 text-pink-800",
  NM: "bg-indigo-100 text-indigo-800",
  PT: "bg-red-100 text-red-800",
  XA: "bg-teal-100 text-teal-800",
  RF: "bg-cyan-100 text-cyan-800",
  OT: "bg-gray-100 text-gray-800",
};

export const DicomStudiesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState<Modality | "">("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<DicomStudy | null>(null);

  const {
    data: studiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dicom-studies", page, search, modalityFilter],
    queryFn: () =>
      dicomService.getStudies({
        page,
        page_size: 10,
        search: search || undefined,
        modality: modalityFilter || undefined,
        ordering: "-study_date",
      }),
  });

  const handleViewStudy = (studyId: string) => {
    navigate(`/dicom/viewer/${studyId}`);
  };

  const handleDeleteStudy = async () => {
    if (!studyToDelete) return;

    try {
      await dicomService.deleteStudy(studyToDelete.id);
      setStudyToDelete(null);
      refetch();
    } catch (err) {
      console.error("Error eliminando estudio:", err);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    refetch();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const columns: Column<DicomStudy>[] = [
    {
      key: "patient",
      label: "Paciente",
      render: (study: DicomStudy) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            {study.patient ? (
              <>
                <div className="font-medium">
                  {study.patient.first_name} {study.patient.last_name}
                </div>
                <div className="text-xs text-gray-500">
                  {study.patient.document_number}
                </div>
              </>
            ) : (
              <span className="text-gray-400">Sin paciente asociado</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "study",
      label: "Estudio",
      render: (study: DicomStudy) => (
        <div>
          <div className="font-medium">{study.study_description || "Sin descripción"}</div>
          <div className="text-xs text-gray-500">{study.body_part_examined || "—"}</div>
        </div>
      ),
    },
    {
      key: "modality",
      label: "Modalidad",
      render: (study: DicomStudy) => (
        <Badge className={MODALITY_COLORS[study.modality] || MODALITY_COLORS.OT}>
          {study.modality}
        </Badge>
      ),
    },
    {
      key: "study_date",
      label: "Fecha",
      render: (study: DicomStudy) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-gray-400" />
          {formatDate(study.study_date)}
        </div>
      ),
    },
    {
      key: "series_count",
      label: "Series / Imágenes",
      render: (study: DicomStudy) => (
        <div className="text-sm">
          <span className="font-medium">{study.series_count}</span> series
          <span className="text-gray-400 mx-1">·</span>
          <span className="font-medium">{study.instances_count}</span> imágenes
        </div>
      ),
    },
    {
      key: "has_contrast",
      label: "Contraste",
      render: (study: DicomStudy) =>
        study.has_contrast ? (
          <Badge className="bg-amber-100 text-amber-800">
            {study.contrast_agent || "Sí"}
          </Badge>
        ) : (
          <span className="text-gray-400">No</span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (study: DicomStudy) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewStudy(study.id)}
            title="Ver estudio"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStudyToDelete(study)}
            className="text-red-600 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Estudios DICOM</h1>
            <p className="text-gray-600">
              Gestiona y visualiza estudios de imagen médica
            </p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Estudio
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={search}
                onChange={(value) => setSearch(value)}
                placeholder="Buscar por paciente, descripción..."
              />
            </div>

            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as Modality | "")}
            >
              <option value="">Todas las modalidades</option>
              <option value="CT">CT - Tomografía</option>
              <option value="MRI">MRI - Resonancia</option>
              <option value="CR">CR - Radiografía</option>
              <option value="US">US - Ultrasonido</option>
              <option value="DX">DX - Rayos X Digital</option>
              <option value="MG">MG - Mamografía</option>
            </select>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </Card>

        {/* Tabla de estudios */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-600 max-w-md">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium mb-2">Error al cargar los estudios</p>
              <p className="text-sm text-gray-600">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        ) : studiesData?.results.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay estudios DICOM</p>
              <p className="text-sm mt-1">
                Sube un estudio para comenzar a visualizar imágenes médicas.
              </p>
              <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir primer estudio
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Table columns={columns} data={studiesData?.results || []} />

            {/* Paginación */}
            {studiesData && studiesData.count > 10 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Mostrando {(page - 1) * 10 + 1} -{" "}
                  {Math.min(page * 10, studiesData.count)} de {studiesData.count}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!studiesData.next}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de upload */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Subir Estudio DICOM"
          size="lg"
        >
          <DicomUploader onUploadComplete={handleUploadComplete} />
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal
          isOpen={!!studyToDelete}
          onClose={() => setStudyToDelete(null)}
          title="Eliminar Estudio"
        >
          <div className="space-y-4">
            <p>
              ¿Estás seguro de que deseas eliminar este estudio DICOM?
            </p>
            {studyToDelete && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{studyToDelete.study_description}</p>
                <p className="text-sm text-gray-600">
                  {studyToDelete.series_count} series · {studyToDelete.instances_count} imágenes
                </p>
              </div>
            )}
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStudyToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeleteStudy}>
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
};
