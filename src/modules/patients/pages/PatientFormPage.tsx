import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { patientsService } from "../services/patients.service";
import { Button, Input, Card, CardHeader } from "@shared/components/ui";
import { showToast } from "@shared/utils";

const patientSchema = z.object({
  identity_document: z
    .string()
    .min(1, "El documento es requerido")
    .max(20, "El documento no puede exceder 20 caracteres"),
  first_name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  last_name: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido no puede exceder 100 caracteres"),
  date_of_birth: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.enum(["M", "F"], "El género es requerido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(20, "El teléfono no puede exceder 20 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  address: z.string().max(255, "La dirección no puede exceder 255 caracteres").optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  blood_type: z.string().max(5).optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (isEdit && id) {
      loadPatient(id);
    }
  }, [id, isEdit]);

  const loadPatient = async (patientId: string) => {
    try {
      setLoadingData(true);
      const patient = await patientsService.getById(patientId);
      reset(patient);
    } catch (error) {
      console.error("Error loading patient:", error);
      showToast.error("Error al cargar los datos del paciente");
      navigate("/patients");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        await patientsService.update(id, data);
        showToast.success("Paciente actualizado exitosamente");
      } else {
        await patientsService.create(data);
        showToast.success("Paciente creado exitosamente");
      }
      navigate("/patients");
    } catch (error: any) {
      console.error("Error saving patient:", error);
      const errorMessage =
        error?.response?.data?.message ||
        `Error al ${isEdit ? "actualizar" : "crear"} el paciente`;
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/patients")}
        >
          Volver a Pacientes
        </Button>
      </div>

      <Card>
        <CardHeader
          title={isEdit ? "Editar Paciente" : "Nuevo Paciente"}
          subtitle={
            isEdit
              ? "Actualiza la información del paciente"
              : "Completa el formulario para registrar un nuevo paciente"
          }
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Documento de Identidad *"
                {...register("identity_document")}
                error={errors.identity_document?.message}
                placeholder="12345678"
              />

              <Input
                label="Nombres *"
                {...register("first_name")}
                error={errors.first_name?.message}
                placeholder="Juan Carlos"
              />

              <Input
                label="Apellidos *"
                {...register("last_name")}
                error={errors.last_name?.message}
                placeholder="Pérez García"
              />

              <Input
                label="Fecha de Nacimiento *"
                type="date"
                {...register("date_of_birth")}
                error={errors.date_of_birth?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género *
                </label>
                <select
                  {...register("gender")}
                  className={`block w-full rounded-lg border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 px-3 py-2 text-sm ${
                    errors.gender
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <Input
                label="Tipo de Sangre"
                {...register("blood_type")}
                error={errors.blood_type?.message}
                placeholder="O+"
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono *"
                type="tel"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="+1 234 567 8900"
              />

              <Input
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="paciente@example.com"
              />

              <div className="md:col-span-2">
                <Input
                  label="Dirección"
                  {...register("address")}
                  error={errors.address?.message}
                  placeholder="Calle 123, Ciudad, País"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contacto de Emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Contacto"
                {...register("emergency_contact_name")}
                error={errors.emergency_contact_name?.message}
                placeholder="María Pérez"
              />

              <Input
                label="Teléfono del Contacto"
                type="tel"
                {...register("emergency_contact_phone")}
                error={errors.emergency_contact_phone?.message}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          {/* Información Médica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Médica
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  {...register("allergies")}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                  placeholder="Describe cualquier alergia conocida..."
                />
                {errors.allergies && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.allergies.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones Crónicas
                </label>
                <textarea
                  {...register("chronic_conditions")}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm"
                  placeholder="Describe condiciones médicas crónicas..."
                />
                {errors.chronic_conditions && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.chronic_conditions.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/patients")}
              disabled={isSubmitting || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              {isEdit ? "Actualizar" : "Crear"} Paciente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
