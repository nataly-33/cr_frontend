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

// Schema de validación para Nota de Alta
const dischargeSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  admission_date: z.string().min(1, "La fecha de ingreso es requerida"),
  discharge_diagnosis: z.string().min(1, "El diagnóstico de alta es requerido"),
  principal_diagnosis: z.string().min(1, "El diagnóstico principal es requerido"),
  secondary_diagnoses: z.string().optional(),
  procedures_performed: z.string().optional(),
  clinical_course: z.string().min(1, "La evolución clínica es requerida"),
  treatment_summary: z.string().min(1, "El resumen del tratamiento es requerido"),
  medications_discharge: z.string().min(1, "Las medicinas al alta son requeridas"),
  follow_up_instructions: z.string().min(1, "Las instrucciones de seguimiento son requeridas"),
  activity_restrictions: z.string().optional(),
  activity_allowed: z.string().optional(),
  diet_restrictions: z.string().optional(),
  wound_care: z.string().optional(),
  return_date: z.string().optional(),
});

type DischargeFormInputs = z.infer<typeof dischargeSchema>;

export const DischargeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DischargeFormInputs>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      secondary_diagnoses: "",
      procedures_performed: "",
      activity_restrictions: "",
      activity_allowed: "",
      diet_restrictions: "",
      wound_care: "",
      return_date: "",
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
      setValue("admission_date", form.form_data.admission_date);
      setValue("discharge_diagnosis", form.form_data.discharge_diagnosis);
      setValue("principal_diagnosis", form.form_data.principal_diagnosis);
      setValue("secondary_diagnoses", form.form_data.secondary_diagnoses || "");
      setValue("procedures_performed", form.form_data.procedures_performed || "");
      setValue("clinical_course", form.form_data.clinical_course);
      setValue("treatment_summary", form.form_data.treatment_summary);
      setValue("medications_discharge", form.form_data.medications_discharge);
      setValue("follow_up_instructions", form.form_data.follow_up_instructions);
      setValue("activity_restrictions", form.form_data.activity_restrictions || "");
      setValue("activity_allowed", form.form_data.activity_allowed || "");
      setValue("diet_restrictions", form.form_data.diet_restrictions || "");
      setValue("wound_care", form.form_data.wound_care || "");
      setValue("return_date", form.form_data.return_date || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: DischargeFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "discharge",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          admission_date: data.admission_date,
          discharge_diagnosis: data.discharge_diagnosis,
          principal_diagnosis: data.principal_diagnosis,
          secondary_diagnoses: data.secondary_diagnoses || "",
          procedures_performed: data.procedures_performed || "",
          clinical_course: data.clinical_course,
          treatment_summary: data.treatment_summary,
          medications_discharge: data.medications_discharge,
          follow_up_instructions: data.follow_up_instructions,
          activity_restrictions: data.activity_restrictions || "",
          activity_allowed: data.activity_allowed || "",
          diet_restrictions: data.diet_restrictions || "",
          wound_care: data.wound_care || "",
          return_date: data.return_date || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Nota de alta actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Nota de alta creada exitosamente");
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
          title={id ? "Editar Nota de Alta" : "Nueva Nota de Alta"}
          subtitle="Registra los detalles de la alta médica del paciente"
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
              label="Fecha de Ingreso *"
              type="date"
              {...register("admission_date")}
              error={errors.admission_date?.message}
            />
            <Input
              label="Fecha de Alta *"
              type="date"
              {...register("form_date")}
              error={errors.form_date?.message}
            />
          </div>

          {/* Diagnósticos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diagnósticos</h3>

            <Input
              label="Diagnóstico Principal *"
              {...register("principal_diagnosis")}
              error={errors.principal_diagnosis?.message}
              placeholder="Diagnóstico principal de egreso"
            />

            <Input
              label="Diagnóstico de Alta *"
              {...register("discharge_diagnosis")}
              error={errors.discharge_diagnosis?.message}
              placeholder="Diagnóstico con el que se da de alta"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Diagnósticos Secundarios
              </label>
              <textarea
                {...register("secondary_diagnoses")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Otros diagnósticos relevantes"
              />
            </div>
          </div>

          {/* Procedimientos */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Procedimientos Realizados
            </label>
            <textarea
              {...register("procedures_performed")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Lista de procedimientos realizados durante la hospitalización"
            />
          </div>

          {/* Evolución Clínica */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Evolución Clínica *
            </label>
            <textarea
              {...register("clinical_course")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe la evolución del paciente durante la hospitalización"
            />
            {errors.clinical_course && (
              <p className="text-sm text-red-600">{errors.clinical_course.message}</p>
            )}
          </div>

          {/* Resumen del Tratamiento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resumen del Tratamiento *
            </label>
            <textarea
              {...register("treatment_summary")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Resumen de los tratamientos administrados"
            />
            {errors.treatment_summary && (
              <p className="text-sm text-red-600">{errors.treatment_summary.message}</p>
            )}
          </div>

          {/* Medicinas al Alta */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medicinas al Alta *
            </label>
            <textarea
              {...register("medications_discharge")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Medicinas a tomar después del alta (nombre, dosis, frecuencia)"
            />
            {errors.medications_discharge && (
              <p className="text-sm text-red-600">{errors.medications_discharge.message}</p>
            )}
          </div>

          {/* Restricciones y Actividad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Restricciones de Actividad
              </label>
              <textarea
                {...register("activity_restrictions")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: No levantar peso mayor a 5 kg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Actividades Permitidas
              </label>
              <textarea
                {...register("activity_allowed")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Caminar, actividades leves"
              />
            </div>
          </div>

          {/* Dieta y Cuidados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Restricciones Dietéticas
              </label>
              <textarea
                {...register("diet_restrictions")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Dieta baja en sodio, sin grasas"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cuidados de Heridas
              </label>
              <textarea
                {...register("wound_care")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instrucciones para cuidado de heridas o incisiones"
              />
            </div>
          </div>

          {/* Instrucciones de Seguimiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seguimiento</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Instrucciones de Seguimiento *
              </label>
              <textarea
                {...register("follow_up_instructions")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Próximas citas, controles, laboratorios necesarios"
              />
              {errors.follow_up_instructions && (
                <p className="text-sm text-red-600">{errors.follow_up_instructions.message}</p>
              )}
            </div>

            <Input
              label="Fecha Recomendada para Retorno"
              type="date"
              {...register("return_date")}
              placeholder="Fecha sugerida de regreso para control"
            />
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
                  {id ? "Actualizar" : "Guardar"} Alta
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
