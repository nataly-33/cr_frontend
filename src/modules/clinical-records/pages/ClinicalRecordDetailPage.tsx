import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Edit,
  Trash2,
  Archive,
  XCircle,
  Calendar,
  User,
  Activity,
  Clock,
} from "lucide-react";
import { clinicalRecordsService } from "../services/clinical-records.service";
import type { ClinicalRecord, TimelineEvent } from "../types";
import { Card, CardHeader } from "@shared/components/ui/Card";
import { Button } from "@shared/components/ui/Button";
import { Badge } from "@shared/components/ui/Badge";
import { Loading } from "@shared/components/ui/Loading";
import { ConfirmModal } from "@shared/components/ui/Modal";
import { useModal } from "@shared/hooks/useModal";
import { showToast } from "@shared/utils/toast";
import { formatDate } from "@shared/utils/formatters";

export const ClinicalRecordDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ClinicalRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const deleteModal = useModal();
  const archiveModal = useModal();
  const closeModal = useModal();

  useEffect(() => {
    if (id) {
      loadRecord();
      loadTimeline();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const data = await clinicalRecordsService.getById(id!);
      setRecord(data);
    } catch (error) {
      showToast.error("Error al cargar la historia clínica");
      navigate("/clinical-records");
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      setLoadingTimeline(true);
      const data = await clinicalRecordsService.getTimeline(id!);
      setTimeline(data);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clinicalRecordsService.delete(id!);
      showToast.success("Historia clínica eliminada exitosamente");
      navigate("/clinical-records");
    } catch (error) {
      showToast.error("Error al eliminar la historia clínica");
    } finally {
      deleteModal.close();
    }
  };

  const handleArchive = async () => {
    try {
      await clinicalRecordsService.archive(id!);
      showToast.success("Historia clínica archivada exitosamente");
      loadRecord();
    } catch (error) {
      showToast.error("Error al archivar la historia clínica");
    } finally {
      archiveModal.close();
    }
  };

  const handleClose = async () => {
    try {
      await clinicalRecordsService.close(id!);
      showToast.success("Historia clínica cerrada exitosamente");
      loadRecord();
    } catch (error) {
      showToast.error("Error al cerrar la historia clínica");
    } finally {
      closeModal.close();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Activa", variant: "success" as const },
      archived: { label: "Archivada", variant: "warning" as const },
      closed: { label: "Cerrada", variant: "default" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "default" as const,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historia Clínica {record.record_number}
          </h1>
          <p className="text-gray-600 mt-2">
            Paciente: {record.patient_info?.full_name || "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          {record.status === "active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Archive className="w-4 h-4" />}
                onClick={archiveModal.open}
              >
                Archivar
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={closeModal.open}
              >
                Cerrar
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/clinical-records/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={deleteModal.open}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader title="Información General" />
        <div className="p-6 grid grid-cols-2 gap-6">
          <InfoItem
            icon={<FileText className="w-5 h-5" />}
            label="Número de Expediente"
            value={record.record_number}
          />
          <InfoItem
            icon={<Activity className="w-5 h-5" />}
            label="Estado"
            value={getStatusBadge(record.status)}
          />
          <InfoItem
            icon={<User className="w-5 h-5" />}
            label="Paciente"
            value={record.patient_info?.full_name || "N/A"}
          />
          <InfoItem
            icon={<FileText className="w-5 h-5" />}
            label="Tipo de Sangre"
            value={record.blood_type || "No especificado"}
          />
          <InfoItem
            icon={<User className="w-5 h-5" />}
            label="Creado por"
            value={record.created_by_name || "N/A"}
          />
          <InfoItem
            icon={<Calendar className="w-5 h-5" />}
            label="Fecha de Creación"
            value={formatDate(record.created_at)}
          />
          <InfoItem
            icon={<FileText className="w-5 h-5" />}
            label="Total Documentos"
            value={record.documents_count.toString()}
          />
        </div>
      </Card>

      {/* Información del Paciente */}
      {record.patient_info && (
        <Card>
          <CardHeader title="Información del Paciente" />
          <div className="p-6 grid grid-cols-2 gap-6">
            <InfoItem
              label="Documento de Identidad"
              value={record.patient_info.identity_document}
            />
            <InfoItem
              label="Fecha de Nacimiento"
              value={formatDate(record.patient_info.date_of_birth)}
            />
            <InfoItem
              label="Género"
              value={record.patient_info.gender === "M" ? "Masculino" : "Femenino"}
            />
            <InfoItem label="Teléfono" value={record.patient_info.phone} />
            {record.patient_info.email && (
              <InfoItem label="Email" value={record.patient_info.email} />
            )}
            {record.patient_info.address && (
              <InfoItem
                label="Dirección"
                value={record.patient_info.address}
                className="col-span-2"
              />
            )}
          </div>
        </Card>
      )}

      {/* Alergias */}
      {record.allergies && record.allergies.length > 0 && (
        <Card>
          <CardHeader title="Alergias" />
          <div className="p-6">
            <div className="space-y-4">
              {record.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Alérgeno</p>
                      <p className="font-medium">{allergy.allergen}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Severidad</p>
                      <p className="font-medium">{allergy.severity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reacción</p>
                      <p className="font-medium">{allergy.reaction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Condiciones Crónicas */}
      {record.chronic_conditions && record.chronic_conditions.length > 0 && (
        <Card>
          <CardHeader title="Condiciones Crónicas" />
          <div className="p-6">
            <ul className="list-disc list-inside space-y-2">
              {record.chronic_conditions.map((condition, index) => (
                <li key={index} className="text-gray-700">
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Medicamentos Actuales */}
      {record.medications && record.medications.length > 0 && (
        <Card>
          <CardHeader title="Medicamentos Actuales" />
          <div className="p-6">
            <div className="space-y-4">
              {record.medications.map((medication, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Medicamento</p>
                      <p className="font-medium">{medication.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dosis</p>
                      <p className="font-medium">{medication.dose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Frecuencia</p>
                      <p className="font-medium">{medication.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Antecedentes */}
      <div className="grid grid-cols-2 gap-6">
        {record.family_history && (
          <Card>
            <CardHeader title="Antecedentes Familiares" />
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {record.family_history}
              </p>
            </div>
          </Card>
        )}

        {record.social_history && (
          <Card>
            <CardHeader title="Antecedentes Sociales" />
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {record.social_history}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Timeline de Documentos */}
      <Card>
        <CardHeader
          title="Línea de Tiempo de Documentos"
          actions={
            <Button
              size="sm"
              onClick={() => navigate(`/patients/${record.patient}/documents/new`)}
            >
              Agregar Documento
            </Button>
          }
        />
        <div className="p-6">
          {loadingTimeline ? (
            <Loading />
          ) : timeline.length > 0 ? (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/documents/${event.id}`)}
                >
                  <div className="flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {event.document_type}
                          {event.specialty && ` - ${event.specialty}`}
                        </p>
                        {event.doctor_name && (
                          <p className="text-sm text-gray-500">
                            Dr. {event.doctor_name}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay documentos en esta historia clínica
            </p>
          )}
        </div>
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Eliminar Historia Clínica"
        message="¿Está seguro que desea eliminar esta historia clínica? Esta acción no se puede deshacer."
        variant="danger"
      />

      <ConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={handleArchive}
        title="Archivar Historia Clínica"
        message="¿Está seguro que desea archivar esta historia clínica?"
        variant="primary"
      />

      <ConfirmModal
        isOpen={closeModal.isOpen}
        onClose={closeModal.close}
        onConfirm={handleClose}
        title="Cerrar Historia Clínica"
        message="¿Está seguro que desea cerrar esta historia clínica?"
        variant="primary"
      />
    </div>
  );
};

interface InfoItemProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoItem = ({ icon, label, value, className = "" }: InfoItemProps) => (
  <div className={className}>
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-gray-900 font-medium">{value}</div>
  </div>
);
