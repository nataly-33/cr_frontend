import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalFormFormData, PrescriptionFormData } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Schema de validación para Receta Médica
const prescriptionSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  medications: z.array(
    z.object({
      name: z.string().min(1, "El nombre del medicamento es requerido"),
      dose: z.string().min(1, "La dosis es requerida"),
      frequency: z.string().min(1, "La frecuencia es requerida"),
      duration: z.string().min(1, "La duración es requerida"),
      instructions: z.string().optional(),
      quantity: z.number().min(1, "La cantidad debe ser mayor a 0").optional(),
    })
  ).min(1, "Al menos un medicamento es requerido"),
  notes: z.string().optional(),
});

type PrescriptionFormInputs = z.infer<typeof prescriptionSchema>;

export const PrescriptionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormInputs>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      medications: [{ name: "", dose: "", frequency: "", duration: "", instructions: "", quantity: 1 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
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
      
      const data = form.form_data as PrescriptionFormData;
      
      setValue("clinical_record", form.clinical_record);
      setValue("form_date", form.form_date.split("T")[0]);
      setValue("diagnosis", data.diagnosis);
      setValue("medications", data.medications || []);
      setValue("notes", data.notes || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: PrescriptionFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "prescription",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          diagnosis: data.diagnosis,
          medications: data.medications.map((med) => ({
            name: med.name,
            dose: med.dose,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions || "",
            quantity: med.quantity || 1,
          })),
          notes: data.notes || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Receta actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Receta creada exitosamente");
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
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title={id ? "Editar Receta Médica" : "Nueva Receta Médica"}
          subtitle="Registra los medicamentos prescritos al paciente"
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

          {/* Diagnóstico */}
          <div>
            <Input
              label="Diagnóstico *"
              {...register("diagnosis")}
              error={errors.diagnosis?.message}
              placeholder="Describe el diagnóstico para el que se prescribe"
            />
          </div>

          {/* Medicamentos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medicamentos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    dose: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                    quantity: 1,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Medicamento
              </Button>
            </div>

            {fields.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No hay medicamentos. Haz clic en "Agregar Medicamento" para comenzar.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      label="Medicamento *"
                      {...register(`medications.${index}.name`)}
                      error={errors.medications?.[index]?.name?.message}
                      placeholder="Ej: Amoxicilina"
                    />
                    <Input
                      label="Dosis *"
                      {...register(`medications.${index}.dose`)}
                      error={errors.medications?.[index]?.dose?.message}
                      placeholder="Ej: 500 mg"
                    />
                    <Input
                      label="Frecuencia *"
                      {...register(`medications.${index}.frequency`)}
                      error={errors.medications?.[index]?.frequency?.message}
                      placeholder="Ej: Cada 8 horas"
                    />
                    <Input
                      label="Duración *"
                      {...register(`medications.${index}.duration`)}
                      error={errors.medications?.[index]?.duration?.message}
                      placeholder="Ej: 7 días"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Instrucciones"
                      {...register(`medications.${index}.instructions`)}
                      placeholder="Ej: Tomar con alimentos"
                    />
                    <Input
                      label="Cantidad"
                      type="number"
                      min="1"
                      {...register(`medications.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Cantidad"
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.medications && typeof errors.medications === "object" && "message" in errors.medications && (
              <p className="text-sm text-red-600">{(errors.medications as any).message}</p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Agrega notas adicionales sobre la receta"
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
                  {id ? "Actualizar" : "Guardar"} Receta
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
