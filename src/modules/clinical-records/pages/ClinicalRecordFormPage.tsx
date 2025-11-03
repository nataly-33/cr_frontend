import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Save } from "lucide-react";
import { clinicalRecordsService } from "../services/clinical-records.service";
import { patientsService } from "@modules/patients/services/patients.service";
import type { ClinicalRecordFormData } from "../types";
import type { Patient } from "@modules/patients/types";
import { Card, CardHeader } from "@shared/components/ui/Card";
import { Button } from "@shared/components/ui/Button";
import { Input } from "@shared/components/ui/Input";
import { Loading } from "@shared/components/ui/Loading";
import { showToast } from "@shared/utils/toast";

// Esquema de validación
const allergySchema = z.object({
  allergen: z.string().min(1, "El alérgeno es requerido"),
  severity: z.string().min(1, "La severidad es requerida"),
  reaction: z.string().min(1, "La reacción es requerida"),
});

const medicationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  dose: z.string().min(1, "La dosis es requerida"),
  frequency: z.string().min(1, "La frecuencia es requerida"),
});

const clinicalRecordSchema = z.object({
  patient: z.string().min(1, "El paciente es requerido"),
  blood_type: z.string().optional(),
  allergies: z.array(allergySchema),
  chronic_conditions: z.array(z.string()),
  medications: z.array(medicationSchema),
  family_history: z.string().optional(),
  social_history: z.string().optional(),
});

type FormData = z.infer<typeof clinicalRecordSchema>;

export const ClinicalRecordFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const patientIdFromUrl = searchParams.get("patient");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [chronicConditionInput, setChronicConditionInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: {
      patient: "",
      blood_type: "",
      allergies: [],
      chronic_conditions: [],
      medications: [],
      family_history: "",
      social_history: "",
    },
  });

  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy,
  } = useFieldArray({
    control,
    name: "allergies",
  });

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({
    control,
    name: "medications",
  });

  const chronicConditions = watch("chronic_conditions");

  useEffect(() => {
    loadPatients();
    if (isEdit && id) {
      loadRecord();
    } else if (patientIdFromUrl) {
      // Pre-seleccionar el paciente si viene de la URL
      setValue("patient", patientIdFromUrl);
    }
  }, [id, patientIdFromUrl]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientsService.getAll({ page_size: 1000 });
      setPatients(response.results || []);
    } catch (error) {
      showToast.error("Error al cargar pacientes");
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadRecord = async () => {
    try {
      setInitialLoading(true);
      const data = await clinicalRecordsService.getById(id!);
      reset({
        patient: data.patient,
        blood_type: data.blood_type || "",
        allergies: data.allergies || [],
        chronic_conditions: data.chronic_conditions || [],
        medications: data.medications || [],
        family_history: data.family_history || "",
        social_history: data.social_history || "",
      });
    } catch (error) {
      showToast.error("Error al cargar la historia clínica");
      navigate("/clinical-records");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const formData: ClinicalRecordFormData = {
        patient: data.patient,
        blood_type: data.blood_type || undefined,
        allergies: data.allergies,
        chronic_conditions: data.chronic_conditions,
        medications: data.medications,
        family_history: data.family_history || undefined,
        social_history: data.social_history || undefined,
      };

      if (isEdit && id) {
        await clinicalRecordsService.update(id, formData);
        showToast.success("Historia clínica actualizada exitosamente");
      } else {
        const created = await clinicalRecordsService.create(formData);
        showToast.success("Historia clínica creada exitosamente");
        navigate(`/clinical-records/${created.id}`);
        return;
      }

      navigate(`/clinical-records/${id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.patient?.[0] ||
        error.response?.data?.message ||
        `Error al ${isEdit ? "actualizar" : "crear"} la historia clínica`;
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChronicCondition = () => {
    if (chronicConditionInput.trim()) {
      const current = chronicConditions || [];
      setValue("chronic_conditions", [...current, chronicConditionInput.trim()]);
      setChronicConditionInput("");
    }
  };

  const handleRemoveChronicCondition = (index: number) => {
    const current = chronicConditions || [];
    setValue(
      "chronic_conditions",
      current.filter((_, i) => i !== index)
    );
  };

  if (initialLoading || loadingPatients) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Editar Historia Clínica" : "Nueva Historia Clínica"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit
            ? "Actualice la información de la historia clínica"
            : "Complete la información para crear una nueva historia clínica"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader title="Información Básica" />
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                {...register("patient")}
                disabled={isEdit}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.patient ? "border-red-500" : "border-gray-300"
                } ${isEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">Seleccione un paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} - {patient.identity_document}
                  </option>
                ))}
              </select>
              {errors.patient && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.patient.message}
                </p>
              )}
            </div>

            <Input
              label="Tipo de Sangre"
              {...register("blood_type")}
              error={errors.blood_type?.message}
              placeholder="Ej: O+, A-, AB+"
            />
          </div>
        </Card>

        {/* Alergias */}
        <Card>
          <CardHeader
            title="Alergias"
            actions={
              <Button
                type="button"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  appendAllergy({ allergen: "", severity: "", reaction: "" })
                }
              >
                Agregar Alergia
              </Button>
            }
          />
          <div className="p-6 space-y-4">
            {allergyFields.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No hay alergias registradas. Haga clic en "Agregar Alergia" para
                añadir una.
              </p>
            ) : (
              allergyFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-50 p-4 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Alergia #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeAllergy(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Alérgeno *"
                      {...register(`allergies.${index}.allergen`)}
                      error={errors.allergies?.[index]?.allergen?.message}
                      placeholder="Ej: Penicilina"
                    />
                    <Input
                      label="Severidad *"
                      {...register(`allergies.${index}.severity`)}
                      error={errors.allergies?.[index]?.severity?.message}
                      placeholder="Ej: Alta, Media, Baja"
                    />
                    <Input
                      label="Reacción *"
                      {...register(`allergies.${index}.reaction`)}
                      error={errors.allergies?.[index]?.reaction?.message}
                      placeholder="Ej: Erupción cutánea"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Condiciones Crónicas */}
        <Card>
          <CardHeader title="Condiciones Crónicas" />
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chronicConditionInput}
                onChange={(e) => setChronicConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChronicCondition();
                  }
                }}
                placeholder="Ej: Diabetes tipo 2"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddChronicCondition}
              >
                Agregar
              </Button>
            </div>

            {chronicConditions && chronicConditions.length > 0 && (
              <div className="space-y-2">
                {chronicConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-gray-900">{condition}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChronicCondition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {(!chronicConditions || chronicConditions.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                No hay condiciones crónicas registradas
              </p>
            )}
          </div>
        </Card>

        {/* Medicamentos */}
        <Card>
          <CardHeader
            title="Medicamentos Actuales"
            actions={
              <Button
                type="button"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  appendMedication({ name: "", dose: "", frequency: "" })
                }
              >
                Agregar Medicamento
              </Button>
            }
          />
          <div className="p-6 space-y-4">
            {medicationFields.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No hay medicamentos registrados. Haga clic en "Agregar
                Medicamento" para añadir uno.
              </p>
            ) : (
              medicationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-50 p-4 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Medicamento #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeMedication(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Medicamento *"
                      {...register(`medications.${index}.name`)}
                      error={errors.medications?.[index]?.name?.message}
                      placeholder="Ej: Metformina"
                    />
                    <Input
                      label="Dosis *"
                      {...register(`medications.${index}.dose`)}
                      error={errors.medications?.[index]?.dose?.message}
                      placeholder="Ej: 500mg"
                    />
                    <Input
                      label="Frecuencia *"
                      {...register(`medications.${index}.frequency`)}
                      error={errors.medications?.[index]?.frequency?.message}
                      placeholder="Ej: Cada 12 horas"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Antecedentes */}
        <Card>
          <CardHeader title="Antecedentes" />
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antecedentes Familiares
              </label>
              <textarea
                {...register("family_history")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describa antecedentes médicos familiares relevantes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antecedentes Sociales
              </label>
              <textarea
                {...register("social_history")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describa hábitos, ocupación, condiciones de vida, etc..."
              />
            </div>
          </div>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={loading}
          >
            {isEdit ? "Actualizar" : "Crear"} Historia Clínica
          </Button>
        </div>
      </form>
    </div>
  );
};
