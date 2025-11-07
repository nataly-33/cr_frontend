import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalFormFormData, ConsultationFormData } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Schema de validación para Consulta Médica
const consultationSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  
  // Subjetivo
  chief_complaint: z.string().min(1, "El motivo de consulta es requerido"),
  history_present_illness: z.string().min(1, "El antecedente de enfermedad actual es requerido"),
  review_of_systems: z.string().optional(),
  
  // Objetivo
  physical_exam: z.string().min(1, "El examen físico es requerido"),
  
  // Diagnóstico
  diagnoses: z.string().min(1, "Al menos un diagnóstico es requerido"),
  differential_diagnosis: z.string().optional(),
  
  // Plan
  follow_up: z.string().min(1, "Las indicaciones de seguimiento son requeridas"),
});

type ConsultationFormInputs = z.infer<typeof consultationSchema>;

export const ConsultationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConsultationFormInputs>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      review_of_systems: "",
      differential_diagnosis: "",
    },
  });

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setLoadingData(true);
      const form = await clinicalFormsService.getById(id!);
      
      const data = form.form_data as ConsultationFormData;
      
      setValue("clinical_record", form.clinical_record);
      setValue("form_date", form.form_date.split("T")[0]);
      setValue("chief_complaint", data.subjective.chief_complaint);
      setValue("history_present_illness", data.subjective.history_present_illness);
      setValue("review_of_systems", data.subjective.review_of_systems?.general || "");
      setValue("physical_exam", data.objective.physical_exam?.general || "");
      setValue(
        "diagnoses",
        data.assessment.diagnoses.map((d) => `${d.code} - ${d.description}`).join("\n")
      );
      setValue("differential_diagnosis", data.assessment.differential_diagnosis || "");
      setValue("follow_up", data.plan.follow_up);
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ConsultationFormInputs) => {
    try {
      setLoading(true);

      // Parsear diagnósticos desde el textarea
      const diagnosesLines = data.diagnoses.split("\n").filter((line) => line.trim());
      const diagnoses = diagnosesLines.map((line) => {
        const [code, ...rest] = line.split("-");
        return {
          code: code.trim(),
          description: rest.join("-").trim(),
          type: "principal" as const,
        };
      });

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "consultation",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          subjective: {
            chief_complaint: data.chief_complaint,
            history_present_illness: data.history_present_illness,
            review_of_systems: {
              general: data.review_of_systems || "",
            },
          },
          objective: {
            physical_exam: {
              general: data.physical_exam,
            },
          },
          assessment: {
            diagnoses: diagnoses.length > 0 ? diagnoses : [
              {
                code: "Z00.00",
                description: data.chief_complaint,
                type: "principal",
              },
            ],
            differential_diagnosis: data.differential_diagnosis || undefined,
          },
          plan: {
            medications: [],
            lab_orders: [],
            follow_up: data.follow_up,
          },
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Consulta actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Consulta creada exitosamente");
      }

      navigate(-1);
    } catch (error) {
      console.error("Error saving form:", error);
      showToast.error("Error al guardar el formulario");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title={id ? "Editar Consulta Médica" : "Nueva Consulta Médica"}
          subtitle="Registra la consulta médica del paciente con diagnóstico y plan de tratamiento"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 border-t">
          {/* Historia Clínica */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID Historia Clínica *"
              {...register("clinical_record")}
              error={errors.clinical_record?.message}
              placeholder="UUID de la historia clínica"
            />
            <Input
              label="Fecha *"
              type="date"
              {...register("form_date")}
              error={errors.form_date?.message}
            />
          </div>

          {/* Subjetivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parte Subjetiva</h3>
            
            <Input
              label="Motivo de Consulta *"
              {...register("chief_complaint")}
              error={errors.chief_complaint?.message}
              placeholder="Describe el motivo de la consulta"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Antecedente de Enfermedad Actual *
              </label>
              <textarea
                {...register("history_present_illness")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detalla la historia de la enfermedad actual"
              />
              {errors.history_present_illness && (
                <p className="text-sm text-red-600">{errors.history_present_illness.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Revisión de Sistemas
              </label>
              <textarea
                {...register("review_of_systems")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe la revisión de sistemas"
              />
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parte Objetiva</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Examen Físico *
              </label>
              <textarea
                {...register("physical_exam")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los hallazgos del examen físico"
              />
              {errors.physical_exam && (
                <p className="text-sm text-red-600">{errors.physical_exam.message}</p>
              )}
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diagnóstico</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diagnósticos (uno por línea, formato: CÓDIGO - DESCRIPCIÓN) *
              </label>
              <textarea
                {...register("diagnoses")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Ejemplo:&#10;I10 - Hipertensión esencial&#10;E11 - Diabetes tipo 2"
              />
              {errors.diagnoses && (
                <p className="text-sm text-red-600">{errors.diagnoses.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diagnóstico Diferencial
              </label>
              <textarea
                {...register("differential_diagnosis")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe el diagnóstico diferencial"
              />
            </div>
          </div>

          {/* Plan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Plan de Tratamiento</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Indicaciones y Seguimiento *
              </label>
              <textarea
                {...register("follow_up")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe el plan de tratamiento e indicaciones de seguimiento"
              />
              {errors.follow_up && (
                <p className="text-sm text-red-600">{errors.follow_up.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Las medicinas y órdenes de laboratorio se pueden agregar 
                a través de formularios específicos de Receta y Orden de Laboratorio.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {id ? "Actualizar" : "Guardar"} Consulta
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
