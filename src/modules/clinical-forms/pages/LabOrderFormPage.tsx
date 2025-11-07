import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Plus } from "lucide-react";
import { clinicalFormsService } from "../services/clinical-forms.service";
import type { ClinicalFormFormData, LabOrderFormData } from "../types";
import {
  Button,
  Input,
  Card,
  CardHeader,
  Select,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

// Exámenes comunes disponibles
const COMMON_TESTS = [
  "Hemograma completo",
  "Glucosa",
  "Colesterol total",
  "Triglicéridos",
  "Creatinina",
  "Nitrógeno ureico",
  "Transaminasas (ALT/AST)",
  "Bilirrubina",
  "Fosfatasa alcalina",
  "Albúmina",
  "Sodio",
  "Potasio",
  "Cloro",
  "Calcio",
  "Fósforo",
  "Magnésio",
  "Ácido úrico",
  "Hormonas tiroideas (TSH, T3, T4)",
  "Prueba de embarazo",
  "Uroanálisis",
  "Urocultivo",
  "Coprocultivo",
  "Hemocultivo",
  "Pruebas coagulación (PT/INR, APTT)",
  "Electrocardiograma",
  "Radiografía de tórax",
  "Radiografía de abdomen",
  "Ecografía abdominal",
  "Tomografía computarizada",
];

// Schema de validación para Orden de Laboratorio
const labOrderSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  urgency: z.enum(["routine", "urgent", "stat"]),
  fasting_required: z.boolean().optional(),
  tests: z.array(z.string()).min(1, "Al menos una prueba es requerida"),
  notes: z.string().optional(),
});

type LabOrderFormInputs = z.infer<typeof labOrderSchema>;

export const LabOrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LabOrderFormInputs>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      urgency: "routine",
      fasting_required: false,
      tests: [],
      notes: "",
    },
  });

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  useEffect(() => {
    setValue("tests", selectedTests);
  }, [selectedTests, setValue]);

  const loadForm = async () => {
    try {
      setLoadingData(true);
      const form = await clinicalFormsService.getById(id!);
      
      const data = form.form_data as LabOrderFormData;
      
      setValue("clinical_record", form.clinical_record);
      setValue("form_date", form.form_date.split("T")[0]);
      setValue("diagnosis", data.diagnosis);
      setValue("urgency", data.urgency);
      setValue("fasting_required", data.fasting_required || false);
      setSelectedTests(data.tests || []);
      setValue("notes", data.notes || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const addCustomTest = () => {
    if (customTest.trim() && !selectedTests.includes(customTest)) {
      setSelectedTests([...selectedTests, customTest]);
      setCustomTest("");
    }
  };

  const removeTest = (test: string) => {
    setSelectedTests((prev) => prev.filter((t) => t !== test));
  };

  const onSubmit = async (data: LabOrderFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "lab_order",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          diagnosis: data.diagnosis,
          urgency: data.urgency,
          fasting_required: data.fasting_required || false,
          tests: data.tests,
          notes: data.notes || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Orden de laboratorio actualizada exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Orden de laboratorio creada exitosamente");
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
          title={id ? "Editar Orden de Laboratorio" : "Nueva Orden de Laboratorio"}
          subtitle="Registra los exámenes de laboratorio solicitados para el paciente"
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
              placeholder="Describe el diagnóstico o indicación para los exámenes"
            />
          </div>

          {/* Requerimientos */}
          <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="fasting"
              {...register("fasting_required")}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="fasting" className="text-sm font-medium text-gray-700">
              Se requiere ayuno de 8-12 horas
            </label>
          </div>

          {/* Exámenes Comunes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exámenes Comunes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {COMMON_TESTS.map((test) => (
                <div key={test} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={test}
                    checked={selectedTests.includes(test)}
                    onChange={() => toggleTest(test)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={test} className="text-sm text-gray-700 flex-1">
                    {test}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Examen personalizado */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Agregar Examen Personalizado</h3>
            <div className="flex gap-2">
              <Input
                label="Nombre del examen"
                value={customTest}
                onChange={(e) => setCustomTest(e.target.value)}
                placeholder="Ej: Biopsia de piel"
              />
              <Button
                type="button"
                onClick={addCustomTest}
                className="mt-6"
                disabled={!customTest.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Exámenes seleccionados */}
          {selectedTests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Exámenes Seleccionados</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTests.map((test) => (
                  <div
                    key={test}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm"
                  >
                    <span>{test}</span>
                    <button
                      type="button"
                      onClick={() => removeTest(test)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.tests && (
            <p className="text-sm text-red-600">{errors.tests.message}</p>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Agrega notas adicionales sobre la orden de laboratorio"
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
