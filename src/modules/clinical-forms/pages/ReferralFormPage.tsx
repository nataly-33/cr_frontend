import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalFormFormData } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Especialidades comunes
const SPECIALTIES = [
  "Cardiología",
  "Dermatología",
  "Oftalmología",
  "Otorrinolaringología",
  "Neurología",
  "Psiquiatría",
  "Oncología",
  "Cirugía General",
  "Cirugía Pediátrica",
  "Ortopedia",
  "Urología",
  "Gastroenterología",
  "Neumología",
  "Reumatología",
  "Endocrinología",
  "Nefrología",
  "Ginecología",
  "Pediatría",
  "Traumatología",
  "Infectología",
  "Medicina Interna",
  "Otra",
];

// Schema de validación para Referencia
const referralSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  referred_to_specialty: z.string().min(1, "La especialidad es requerida"),
  referred_to_doctor: z.string().optional(),
  referred_to_facility: z.string().optional(),
  reason_for_referral: z.string().min(1, "La razón de la referencia es requerida"),
  chief_complaint: z.string().min(1, "El motivo de consulta es requerido"),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  clinical_summary: z.string().min(1, "El resumen clínico es requerido"),
  relevant_tests: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  urgency: z.enum(["routine", "urgent", "emergency"]),
  notes: z.string().optional(),
});

type ReferralFormInputs = z.infer<typeof referralSchema>;

export const ReferralFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReferralFormInputs>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      urgency: "routine",
      referred_to_doctor: "",
      referred_to_facility: "",
      relevant_tests: "",
      allergies: "",
      current_medications: "",
      notes: "",
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
      
      setValue("clinical_record", form.clinical_record);
      setValue("form_date", form.form_date.split("T")[0]);
      setValue("referred_to_specialty", form.form_data.referred_to_specialty);
      setValue("referred_to_doctor", form.form_data.referred_to_doctor || "");
      setValue("referred_to_facility", form.form_data.referred_to_facility || "");
      setValue("reason_for_referral", form.form_data.reason_for_referral);
      setValue("chief_complaint", form.form_data.chief_complaint);
      setValue("diagnosis", form.form_data.diagnosis);
      setValue("clinical_summary", form.form_data.clinical_summary);
      setValue("relevant_tests", form.form_data.relevant_tests || "");
      setValue("allergies", form.form_data.allergies || "");
      setValue("current_medications", form.form_data.current_medications || "");
      setValue("urgency", form.form_data.urgency);
      setValue("notes", form.form_data.notes || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ReferralFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "referral",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          referred_to_specialty: data.referred_to_specialty,
          referred_to_doctor: data.referred_to_doctor || "",
          referred_to_facility: data.referred_to_facility || "",
          reason_for_referral: data.reason_for_referral,
          chief_complaint: data.chief_complaint,
          diagnosis: data.diagnosis,
          clinical_summary: data.clinical_summary,
          relevant_tests: data.relevant_tests || "",
          allergies: data.allergies || "",
          current_medications: data.current_medications || "",
          urgency: data.urgency,
          notes: data.notes || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Referencia actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Referencia creada exitosamente");
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
          title={id ? "Editar Referencia" : "Nueva Referencia"}
          subtitle="Registra la referencia del paciente a otro especialista"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 border-t">
          {/* Historia Clínica */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="ID Historia Clínica *"
              {...register("clinical_record")}
              error={errors.clinical_record?.message}
              placeholder="UUID de la historia clínica"
            />
            <Input
              label="Fecha de Referencia *"
              type="date"
              {...register("form_date")}
              error={errors.form_date?.message}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Urgencia *
              </label>
              <select
                {...register("urgency")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="routine">Rutina</option>
                <option value="urgent">Urgente</option>
                <option value="emergency">Emergencia</option>
              </select>
              {errors.urgency && (
                <p className="text-sm text-red-600">{errors.urgency.message}</p>
              )}
            </div>
          </div>

          {/* Información de Referencia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de la Referencia</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Especialidad *
                </label>
                <select
                  {...register("referred_to_specialty")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione una especialidad</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                {errors.referred_to_specialty && (
                  <p className="text-sm text-red-600">{errors.referred_to_specialty.message}</p>
                )}
              </div>

              <Input
                label="Doctor/Especialista"
                {...register("referred_to_doctor")}
                placeholder="Nombre del especialista (opcional)"
              />
            </div>

            <Input
              label="Centro/Institución"
              {...register("referred_to_facility")}
              placeholder="Hospital o clínica de referencia (opcional)"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Razón de la Referencia *
              </label>
              <textarea
                {...register("reason_for_referral")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="¿Por qué se refiere este paciente?"
              />
              {errors.reason_for_referral && (
                <p className="text-sm text-red-600">{errors.reason_for_referral.message}</p>
              )}
            </div>
          </div>

          {/* Información Clínica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Clínica</h3>

            <Input
              label="Motivo de Consulta *"
              {...register("chief_complaint")}
              error={errors.chief_complaint?.message}
              placeholder="Queja principal del paciente"
            />

            <Input
              label="Diagnóstico Principal *"
              {...register("diagnosis")}
              error={errors.diagnosis?.message}
              placeholder="Diagnóstico o sospecha diagnóstica"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Resumen Clínico *
              </label>
              <textarea
                {...register("clinical_summary")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Resumen del caso clínico"
              />
              {errors.clinical_summary && (
                <p className="text-sm text-red-600">{errors.clinical_summary.message}</p>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Adicional</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Exámenes/Pruebas Relevantes
              </label>
              <textarea
                {...register("relevant_tests")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Laboratorios, imágenes u otros exámenes realizados"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Alergias
              </label>
              <textarea
                {...register("allergies")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alergias medicamentosas u otras alergias"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Medicinas Actuales
              </label>
              <textarea
                {...register("current_medications")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Medicinas que está tomando actualmente"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notas Adicionales
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cualquier nota adicional relevante"
              />
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
                  {id ? "Actualizar" : "Guardar"} Referencia
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
