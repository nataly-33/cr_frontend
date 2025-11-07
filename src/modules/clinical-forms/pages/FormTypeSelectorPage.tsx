import { useNavigate } from "react-router-dom";
import { Button, Card, CardHeader } from "@shared/components/ui";
import {
  Stethoscope,
  Thermometer,
  Pill,
  Microscope,
  ImageIcon,
  Scissors,
  LogOut,
  Share2,
  FileQuestion,
} from "lucide-react";

interface FormTypeCard {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const formTypes: FormTypeCard[] = [
  {
    id: "triage",
    label: "Triaje",
    description: "Evaluación inicial con signos vitales",
    icon: <Thermometer className="h-8 w-8" />,
    path: "/clinical-forms/triage/new",
    color: "bg-red-50 border-red-200 hover:border-red-300",
  },
  {
    id: "consultation",
    label: "Consulta Médica",
    description: "Registro de consulta con diagnóstico",
    icon: <Stethoscope className="h-8 w-8" />,
    path: "/clinical-forms/consultation/new",
    color: "bg-blue-50 border-blue-200 hover:border-blue-300",
  },
  {
    id: "prescription",
    label: "Receta Médica",
    description: "Prescripción de medicamentos",
    icon: <Pill className="h-8 w-8" />,
    path: "/clinical-forms/prescription/new",
    color: "bg-green-50 border-green-200 hover:border-green-300",
  },
  {
    id: "lab_order",
    label: "Orden de Laboratorio",
    description: "Solicitud de exámenes de laboratorio",
    icon: <Microscope className="h-8 w-8" />,
    path: "/clinical-forms/lab-order/new",
    color: "bg-yellow-50 border-yellow-200 hover:border-yellow-300",
  },
  {
    id: "imaging_order",
    label: "Orden de Imagenología",
    description: "Solicitud de estudios de imagen",
    icon: <ImageIcon className="h-8 w-8" />,
    path: "/clinical-forms/imaging-order/new",
    color: "bg-purple-50 border-purple-200 hover:border-purple-300",
  },
  {
    id: "procedure",
    label: "Procedimiento",
    description: "Registro de procedimientos médicos",
    icon: <Scissors className="h-8 w-8" />,
    path: "/clinical-forms/procedure/new",
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-300",
  },
  {
    id: "discharge",
    label: "Nota de Alta",
    description: "Registro del alta médica del paciente",
    icon: <LogOut className="h-8 w-8" />,
    path: "/clinical-forms/discharge/new",
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-300",
  },
  {
    id: "referral",
    label: "Referencia",
    description: "Referencia a otro especialista",
    icon: <Share2 className="h-8 w-8" />,
    path: "/clinical-forms/referral/new",
    color: "bg-cyan-50 border-cyan-200 hover:border-cyan-300",
  },
  {
    id: "other",
    label: "Otro",
    description: "Otro tipo de formulario",
    icon: <FileQuestion className="h-8 w-8" />,
    path: "/clinical-forms/other/new",
    color: "bg-gray-50 border-gray-200 hover:border-gray-300",
  },
];

export const FormTypeSelectorPage = () => {
  const navigate = useNavigate();

  const handleSelectFormType = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Selecciona el Tipo de Formulario"
          subtitle="Elige qué tipo de formulario clínico deseas crear"
        />

        <div className="p-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formTypes.map((form) => (
              <button
                key={form.id}
                onClick={() => handleSelectFormType(form.path)}
                className={`border-2 rounded-lg p-4 text-left transition-all hover:shadow-md ${form.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-gray-700 flex-shrink-0 mt-1">
                    {form.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{form.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {form.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
