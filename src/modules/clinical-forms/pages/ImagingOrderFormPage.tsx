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
  Select,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Tipos de estudios de imagen
const IMAGING_TYPES = [
  "Radiografía simple",
  "Radiografía con contraste",
  "Tomografía computarizada (TC)",
  "Resonancia magnética (RM)",
  "Ecografía abdominal",
  "Ecografía vascular",
  "Ecografía de partes blandas",
  "Doppler",
  "Mamografía",
  "Densitometría ósea",
  "Angiografía",
  "Fluoroscopia",
  "Gammagrafía",
  "PET",
  "Otro",
];

// Schema de validación para Orden de Imagenología
const imagingOrderSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  imaging_type: z.string().min(1, "El tipo de imagenología es requerido"),
  urgency: z.enum(["routine", "urgent", "stat"]),
  anatomical_region: z.string().min(1, "La región anatómica es requerida"),
  clinical_question: z.string().optional(),
  notes: z.string().optional(),
});

type ImagingOrderFormInputs = z.infer<typeof imagingOrderSchema>;

export const ImagingOrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ImagingOrderFormInputs>({
    resolver: zodResolver(imagingOrderSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      urgency: "routine",
      imaging_type: "",
      anatomical_region: "",
      clinical_question: "",
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
      setValue("diagnosis", form.form_data.diagnosis);
      setValue("imaging_type", form.form_data.imaging_type);
      setValue("urgency", form.form_data.urgency);
      setValue("anatomical_region", form.form_data.anatomical_region);
      setValue("clinical_question", form.form_data.clinical_question || "");
      setValue("notes", form.form_data.notes || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ImagingOrderFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "imaging_order",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          diagnosis: data.diagnosis,
          imaging_type: data.imaging_type,
          urgency: data.urgency,
          anatomical_region: data.anatomical_region,
          clinical_question: data.clinical_question || "",
          notes: data.notes || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Orden de imagenología actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Orden de imagenología creada exitosamente");
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
          title={id ? "Editar Orden de Imagenología" : "Nueva Orden de Imagenología"}
          subtitle="Registra la orden de estudios de imagen"
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
              label="Fecha *"
              type="date"
              {...register("form_date")}
              error={errors.form_date?.message}
            />
            <Select
              label="Urgencia *"
              {...register("urgency")}
              error={errors.urgency?.message}
            >
              <option value="routine">Rutina</option>
              <option value="urgent">Urgente</option>
              <option value="stat">Emergencia (STAT)</option>
            </Select>
          </div>

          {/* Diagnóstico */}
          <div>
            <Input
              label="Diagnóstico *"
              {...register("diagnosis")}
              error={errors.diagnosis?.message}
              placeholder="Describe el diagnóstico o indicación"
            />
          </div>

          {/* Tipo de Imagenología y Región Anatómica */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Imagenología *"
              {...register("imaging_type")}
              error={errors.imaging_type?.message}
            >
              <option value="">Seleccione un tipo</option>
              {IMAGING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>

            <Input
              label="Región Anatómica *"
              {...register("anatomical_region")}
              error={errors.anatomical_region?.message}
              placeholder="Ej: Abdomen, Tórax, Pelvis"
            />
          </div>

          {/* Pregunta Clínica */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pregunta Clínica Específica
            </label>
            <textarea
              {...register("clinical_question")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="¿Qué deseas que el radiólogo investigue específicamente?"
            />
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
              placeholder="Agrega notas adicionales sobre la orden"
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
                  {id ? "Actualizar" : "Guardar"} Orden
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
