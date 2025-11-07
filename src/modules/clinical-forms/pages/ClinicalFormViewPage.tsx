import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalForm } from "../types";
import { Button, Card, CardHeader } from "@shared/components/ui";
import { showToast, formatDate } from "@shared/utils";
import { ArrowLeft, Edit } from "lucide-react";

/**
 * Página para visualizar formulario clínico en modo lectura
 */
export const ClinicalFormViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<ClinicalForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForm = async () => {
      try {
        if (!id) {
          showToast.error("ID de formulario no encontrado");
          navigate(-1);
          return;
        }

        const data = await clinicalFormsService.getById(id);
        setForm(data);
      } catch (error) {
        console.error("Error loading form:", error);
        showToast.error("No se pudo cargar el formulario");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No se encontró el formulario</p>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    const typeMap: Record<string, string> = {
      triage: "triage",
      consultation: "consultation",
      evolution: "consultation",
      prescription: "prescription",
      lab_order: "lab-order",
      imaging_order: "imaging-order",
      procedure: "procedure",
      discharge: "discharge",
      referral: "referral",
    };

    const routeType = typeMap[form.form_type] || "consultation";
    navigate(`/clinical-forms/${routeType}/${form.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader
          title={form.form_type_display}
          subtitle={`Formulario del ${formatDate(form.form_date)}`}
        />

        <div className="p-6 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <p className="text-gray-900">{form.patient_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de historia
              </label>
              <p className="text-gray-900">{form.record_number}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <p className="text-gray-900">{form.doctor_name}</p>
            </div>

            {form.doctor_specialty && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad
                </label>
                <p className="text-gray-900">{form.doctor_specialty}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del formulario
              </label>
              <p className="text-gray-900">{formatDate(form.form_date)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de formulario
              </label>
              <p className="text-gray-900">{form.form_type_display}</p>
            </div>
          </div>

          {(form as any).notes && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line">{(form as any).notes}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar formulario
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
