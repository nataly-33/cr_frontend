import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clinicalFormsService } from "../services/clinical-forms.service";
import { showToast } from "@shared/utils";

/**
 * Página temporal que obtiene el formulario y redirige al editor específico
 */
export const ClinicalFormDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        if (!id) {
          showToast.error("ID de formulario no encontrado");
          navigate(-1);
          return;
        }

        // Obtener el formulario para determinar su tipo
        const form = await clinicalFormsService.getById(id);

        // Mapear form_type a ruta específica
        const typeMap: Record<string, string> = {
          triage: "triage",
          consultation: "consultation",
          evolution: "consultation", // Usar consultation como fallback
          prescription: "prescription",
          lab_order: "lab-order",
          imaging_order: "imaging-order",
          procedure: "procedure",
          discharge: "discharge",
          referral: "referral",
        };

        const routeType = typeMap[form.form_type] || "consultation";
        navigate(`/clinical-forms/${routeType}/${id}/edit`, { replace: true });
      } catch (error) {
        console.error("Error loading form:", error);
        showToast.error("No se pudo cargar el formulario");
        navigate(-1);
      }
    };

    loadAndRedirect();
  }, [id, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  );
};
