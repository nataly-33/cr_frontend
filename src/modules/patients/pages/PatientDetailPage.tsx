import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, User, Phone, Mail, MapPin, Heart, AlertCircle, FileText, Plus, Activity } from "lucide-react";
import { patientsService } from "../services/patients.service";
import { clinicalRecordsService } from "@modules/clinical-records/services/clinical-records.service";
import type { Patient } from "../types";
import type { ClinicalRecord } from "@modules/clinical-records/types";
import {
  Button,
  Card,
  CardHeader,
  Badge,
  Loading,
  ConfirmModal,
} from "@shared/components/ui";
import { useModal } from "@shared/hooks";
import { showToast, formatDate } from "@shared/utils";

export const PatientDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteModal = useModal();

  useEffect(() => {
    if (id) {
      loadPatient(id);
      loadClinicalRecords(id);
    }
  }, [id]);

  const loadPatient = async (patientId: string) => {
    try {
      setLoading(true);
      const data = await patientsService.getById(patientId);
      setPatient(data);
    } catch (error) {
      console.error("Error loading patient:", error);
      showToast.error("Error al cargar los datos del paciente");
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  const loadClinicalRecords = async (patientId: string) => {
    try {
      setLoadingRecords(true);
      const response = await clinicalRecordsService.getAll({ patient: patientId });
      setClinicalRecords(response.results || []);
    } catch (error) {
      console.error("Error loading clinical records:", error);
      setClinicalRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await patientsService.delete(id);
      showToast.success("Paciente eliminado exitosamente");
      navigate("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);
      showToast.error("Error al eliminar el paciente");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Cargando información del paciente..." />;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <Button onClick={() => navigate("/patients")} className="mt-4">
          Volver a Pacientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/patients")}
        >
          Volver a Pacientes
        </Button>
      </div>

      {/* Información Principal */}
      <Card>
        <CardHeader
          title={patient.full_name}
          subtitle={`Paciente desde ${formatDate(patient.created_at)}`}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => navigate(`/patients/${id}/edit`)}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={deleteModal.open}
              >
                Eliminar
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Información Personal
            </h3>

            <div className="space-y-3">
              <InfoItem
                icon={<User className="h-5 w-5" />}
                label="Documento"
                value={patient.identity_document}
              />

              <InfoItem
                icon={<User className="h-5 w-5" />}
                label="Género"
                value={
                  <Badge variant={patient.gender === "M" ? "info" : "success"}>
                    {patient.gender === "M" ? "Masculino" : "Femenino"}
                  </Badge>
                }
              />

              <InfoItem
                icon={<User className="h-5 w-5" />}
                label="Fecha de Nacimiento"
                value={formatDate(patient.date_of_birth)}
              />

              {(patient as any).blood_type && (
                <InfoItem
                  icon={<Heart className="h-5 w-5 text-red-500" />}
                  label="Tipo de Sangre"
                  value={(patient as any).blood_type}
                />
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Información de Contacto
            </h3>

            <div className="space-y-3">
              <InfoItem
                icon={<Phone className="h-5 w-5" />}
                label="Teléfono"
                value={patient.phone}
              />

              {patient.email && (
                <InfoItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={patient.email}
                />
              )}

              {(patient as any).address && (
                <InfoItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Dirección"
                  value={(patient as any).address}
                />
              )}
            </div>
          </div>

          {/* Contacto de Emergencia */}
          {((patient as any).emergency_contact_name || (patient as any).emergency_contact_phone) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Contacto de Emergencia
              </h3>

              <div className="space-y-3">
                {(patient as any).emergency_contact_name && (
                  <InfoItem
                    icon={<User className="h-5 w-5" />}
                    label="Nombre"
                    value={(patient as any).emergency_contact_name}
                  />
                )}

                {(patient as any).emergency_contact_phone && (
                  <InfoItem
                    icon={<Phone className="h-5 w-5" />}
                    label="Teléfono"
                    value={(patient as any).emergency_contact_phone}
                  />
                )}
              </div>
            </div>
          )}

          {/* Información Médica */}
          {((patient as any).allergies || (patient as any).chronic_conditions) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Información Médica
              </h3>

              <div className="space-y-3">
                {(patient as any).allergies && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Alergias
                    </p>
                    <p className="text-sm text-gray-600">
                      {(patient as any).allergies}
                    </p>
                  </div>
                )}

                {(patient as any).chronic_conditions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Condiciones Crónicas
                    </p>
                    <p className="text-sm text-gray-600">
                      {(patient as any).chronic_conditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Predicción de Diabetes */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Análisis Predictivo de Diabetes
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Evaluación del riesgo de diabetes basada en el historial clínico del paciente
            </p>
          </div>
          <Button
            leftIcon={<Activity className="h-4 w-4" />}
            onClick={() => navigate(`/patients/${id}/diabetes-prediction`)}
          >
            Ver Predicción
          </Button>
        </div>
      </Card>

      {/* Historias Clínicas */}
      <Card>
        <CardHeader
          title="Historias Clínicas"
          subtitle={`${clinicalRecords?.length || 0} historia(s) clínica(s)`}
          actions={
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(`/clinical-records/new?patient=${id}`)}
            >
              Nueva Historia Clínica
            </Button>
          }
        />
        <div className="mt-6">
          {loadingRecords ? (
            <div className="text-center py-8">
              <Loading />
            </div>
          ) : clinicalRecords.length > 0 ? (
            <div className="space-y-3">
              {clinicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/clinical-records/${record.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {record.record_number}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Creado: {formatDate(record.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        record.status === "active"
                          ? "success"
                          : record.status === "archived"
                          ? "warning"
                          : "default"
                      }
                    >
                      {record.status === "active"
                        ? "Activa"
                        : record.status === "archived"
                        ? "Archivada"
                        : "Cerrada"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {record.documents_count} documento(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                No hay historias clínicas para este paciente
              </p>
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate(`/clinical-records/new?patient=${id}`)}
              >
                Crear Primera Historia Clínica
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Eliminar Paciente"
        message={`¿Estás seguro de que deseas eliminar al paciente ${patient.full_name}? Esta acción no se puede deshacer y eliminará también todas sus historias clínicas asociadas.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="mt-1 text-sm text-gray-900">{value}</div>
      </div>
    </div>
  );
};
