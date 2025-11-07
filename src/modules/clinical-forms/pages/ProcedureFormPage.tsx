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

// Schema de validación para Procedimiento
const procedureSchema = z.object({
  clinical_record: z.string().min(1, "La historia clínica es requerida"),
  form_date: z.string().min(1, "La fecha es requerida"),
  procedure_name: z.string().min(1, "El nombre del procedimiento es requerido"),
  indication: z.string().min(1, "La indicación es requerida"),
  anesthesia_type: z.string().min(1, "El tipo de anestesia es requerido"),
  surgeon: z.string().min(1, "El nombre del cirujano es requerido"),
  procedure_description: z.string().min(1, "La descripción del procedimiento es requerida"),
  findings: z.string().optional(),
  complications: z.string().optional(),
  post_operative_notes: z.string().optional(),
  specimens: z.string().optional(),
});

type ProcedureFormInputs = z.infer<typeof procedureSchema>;

const ANESTHESIA_TYPES = [
  "Anestesia local",
  "Anestesia regional",
  "Anestesia general",
  "Sedación consciente",
  "Sin anestesia",
  "Otra",
];

export const ProcedureFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProcedureFormInputs>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      form_date: new Date().toISOString().split("T")[0],
      findings: "",
      complications: "",
      post_operative_notes: "",
      specimens: "",
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
      setValue("procedure_name", form.form_data.procedure_name);
      setValue("indication", form.form_data.indication);
      setValue("anesthesia_type", form.form_data.anesthesia_type);
      setValue("surgeon", form.form_data.surgeon);
      setValue("procedure_description", form.form_data.procedure_description);
      setValue("findings", form.form_data.findings || "");
      setValue("complications", form.form_data.complications || "");
      setValue("post_operative_notes", form.form_data.post_operative_notes || "");
      setValue("specimens", form.form_data.specimens || "");
    } catch (error) {
      console.error("Error loading form:", error);
      showToast.error("Error al cargar el formulario");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ProcedureFormInputs) => {
    try {
      setLoading(true);

      const formData: ClinicalFormFormData = {
        clinical_record: data.clinical_record,
        form_type: "procedure",
        form_date: new Date(data.form_date).toISOString(),
        form_data: {
          procedure_name: data.procedure_name,
          indication: data.indication,
          anesthesia_type: data.anesthesia_type,
          surgeon: data.surgeon,
          procedure_description: data.procedure_description,
          findings: data.findings || "",
          complications: data.complications || "",
          post_operative_notes: data.post_operative_notes || "",
          specimens: data.specimens || "",
        },
      };

      if (id) {
        await clinicalFormsService.update(id, formData);
        showToast.success("Procedimiento actualizado exitosamente");
      } else {
        await clinicalFormsService.create(formData);
        showToast.success("Procedimiento creado exitosamente");
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
          title={id ? "Editar Procedimiento" : "Nuevo Procedimiento"}
          subtitle="Registra los detalles del procedimiento médico realizado"
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

          {/* Procedimiento Básico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Procedimiento</h3>

            <Input
              label="Nombre del Procedimiento *"
              {...register("procedure_name")}
              error={errors.procedure_name?.message}
              placeholder="Ej: Apendicectomía, Biopsia, Endoscopia"
            />

            <Input
              label="Indicación *"
              {...register("indication")}
              error={errors.indication?.message}
              placeholder="¿Por qué se realizó el procedimiento?"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Anestesia *
                </label>
                <select
                  {...register("anesthesia_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un tipo</option>
                  {ANESTHESIA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.anesthesia_type && (
                  <p className="text-sm text-red-600">{errors.anesthesia_type.message}</p>
                )}
              </div>

              <Input
                label="Cirujano/Especialista *"
                {...register("surgeon")}
                error={errors.surgeon?.message}
                placeholder="Nombre del especialista"
              />
            </div>
          </div>

          {/* Descripción del Procedimiento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción del Procedimiento *
            </label>
            <textarea
              {...register("procedure_description")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detalla paso a paso los procedimientos realizados"
            />
            {errors.procedure_description && (
              <p className="text-sm text-red-600">{errors.procedure_description.message}</p>
            )}
          </div>

          {/* Hallazgos Intraoperatorios */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Hallazgos Intraoperatorios
            </label>
            <textarea
              {...register("findings")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe los hallazgos encontrados durante el procedimiento"
            />
          </div>

          {/* Complicaciones */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Complicaciones
            </label>
            <textarea
              {...register("complications")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Si hubo complicaciones, descríbelas aquí"
            />
          </div>

          {/* Especímenes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Especímenes Enviados a Patología
            </label>
            <textarea
              {...register("specimens")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Apéndice para análisis histopatológico"
            />
          </div>

          {/* Notas Postoperatorias */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas Postoperatorias
            </label>
            <textarea
              {...register("post_operative_notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Condiciones postoperatorias, indicaciones del paciente, etc."
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
                  {id ? "Actualizar" : "Guardar"} Procedimiento
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
