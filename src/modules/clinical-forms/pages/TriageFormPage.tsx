import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalFormFormData, TriageFormData } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Select,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Schema de validación para Triaje
const triageSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  
  // Signos vitales
  temperature: z.number().min(35).max(42, "Temperatura inválida"),
  blood_pressure_systolic: z.number().min(60).max(250, "Presión sistólica inválida"),
  blood_pressure_diastolic: z.number().min(40).max(150, "Presión diastólica inválida"),
  heart_rate: z.number().min(30).max(220, "Frecuencia cardíaca inválida"),
  respiratory_rate: z.number().min(8).max(60, "Frecuencia respiratoria inválida"),
  oxygen_saturation: z.number().min(70).max(100, "Saturación de oxígeno inválida"),
  weight: z.number().min(0).max(300, "Peso inválido"),
  height: z.number().min(0).max(250, "Altura inválida"),
  
  // Evaluación
  chief_complaint: z.string().min(1, "El motivo de consulta es requerido"),
  initial_assessment: z.string().min(1, "La evaluación inicial es requerida"),
  triage_level: z.string().min(1, "El nivel de urgencia es requerido"),
});

type TriageFormInputs = z.infer<typeof triageSchema>;

export const TriageFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TriageFormInputs>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      temperature: 36.5,
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      heart_rate: 80,
      respiratory_rate: 16,
      oxygen_saturation: 98,
      triage_level: "3",
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
      
      const data = form.form_data as TriageFormData;
      
      setValue("clinical_record", form.clinical_record);
      setValue("form_date", form.form_date.split("T")[0]);
      setValue("temperature", data.vital_signs.temperature);
      setValue("blood_pressure_systolic", data.vital_signs.blood_pressure_systolic);
      setValue("blood_pressure_diastolic", data.vital_signs.blood_pressure_diastolic);
      setValue("heart_rate", data.vital_signs.heart_rate);
      setValue("respiratory_rate", data.vital_signs.respiratory_rate);
      setValue("oxygen_saturation", data.vital_signs.oxygen_saturation);
      setValue("weight", data.vital_signs.weight);
      setValue("height", data.vital_signs.height);
      setValue("chief_complaint", data.chief_complaint);
      setValue("initial_assessment", data.initial_assessment);
      setValue("triage_level", data.triage_level.level.toString());
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: TriageFormInputs) => {
    try {
      setLoading(true);

      const triageLevels = [
        { level: 1, name: "Resucitación", color: "red" },
        { level: 2, name: "Emergencia", color: "orange" },
        { level: 3, name: "Urgente", color: "yellow" },
        { level: 4, name: "Semi-urgente", color: "green" },
        { level: 5, name: "No urgente", color: "blue" },
      ];

      const selectedLevel = triageLevels.find(
        (l) => l.level === parseInt(data.triage_level)
      )!;

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "triage",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          vital_signs: {
            temperature: data.temperature,
            blood_pressure_systolic: data.blood_pressure_systolic,
            blood_pressure_diastolic: data.blood_pressure_diastolic,
            heart_rate: data.heart_rate,
            respiratory_rate: data.respiratory_rate,
            oxygen_saturation: data.oxygen_saturation,
            weight: data.weight,
            height: data.height,
          },
          chief_complaint: data.chief_complaint,
          initial_assessment: data.initial_assessment,
          triage_level: selectedLevel,
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Formulario de triaje actualizado exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Formulario de triaje creado exitosamente");
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
          title={id ? "Editar Formulario de Triaje" : "Nuevo Formulario de Triaje"}
          subtitle="Registra los signos vitales y evaluación inicial del paciente"
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

          {/* Signos Vitales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Signos Vitales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Temperatura (°C) *"
                type="number"
                step="0.1"
                {...register("temperature", { valueAsNumber: true })}
                error={errors.temperature?.message}
              />
              <Input
                label="Presión Sistólica *"
                type="number"
                {...register("blood_pressure_systolic", { valueAsNumber: true })}
                error={errors.blood_pressure_systolic?.message}
              />
              <Input
                label="Presión Diastólica *"
                type="number"
                {...register("blood_pressure_diastolic", { valueAsNumber: true })}
                error={errors.blood_pressure_diastolic?.message}
              />
              <Input
                label="Frec. Cardíaca (lpm) *"
                type="number"
                {...register("heart_rate", { valueAsNumber: true })}
                error={errors.heart_rate?.message}
              />
              <Input
                label="Frec. Respiratoria *"
                type="number"
                {...register("respiratory_rate", { valueAsNumber: true })}
                error={errors.respiratory_rate?.message}
              />
              <Input
                label="Saturación O2 (%) *"
                type="number"
                {...register("oxygen_saturation", { valueAsNumber: true })}
                error={errors.oxygen_saturation?.message}
              />
              <Input
                label="Peso (kg) *"
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                error={errors.weight?.message}
              />
              <Input
                label="Altura (cm) *"
                type="number"
                {...register("height", { valueAsNumber: true })}
                error={errors.height?.message}
              />
            </div>
          </div>

          {/* Evaluación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Evaluación Inicial</h3>
            
            <Input
              label="Motivo de Consulta *"
              {...register("chief_complaint")}
              error={errors.chief_complaint?.message}
              placeholder="Describe el motivo de la consulta"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Evaluación Inicial *
              </label>
              <textarea
                {...register("initial_assessment")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe la evaluación inicial del paciente"
              />
              {errors.initial_assessment && (
                <p className="text-sm text-red-600">{errors.initial_assessment.message}</p>
              )}
            </div>

            <Select
              label="Nivel de Urgencia *"
              {...register("triage_level")}
              error={errors.triage_level?.message}
            >
              <option value="">Seleccione un nivel</option>
              <option value="1">Nivel 1 - Resucitación (Rojo)</option>
              <option value="2">Nivel 2 - Emergencia (Naranja)</option>
              <option value="3">Nivel 3 - Urgente (Amarillo)</option>
              <option value="4">Nivel 4 - Semi-urgente (Verde)</option>
              <option value="5">Nivel 5 - No urgente (Azul)</option>
            </Select>
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
                  {id ? "Actualizar" : "Guardar"} Triaje
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
