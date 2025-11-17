import { useNavigate } from "react-router-dom";
import { Card } from "@shared/components/ui/Card";
import { Button } from "@shared/components/ui/Button";
import { XCircle } from "lucide-react";

export const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center space-y-6">
          {/* Icono de cancelación */}
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Pago cancelado</h1>
            <p className="text-gray-600">
              Cancelaste el proceso de pago. Tu suscripción no ha sido activada.
            </p>
          </div>

          {/* Mensaje informativo */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              Puedes intentar nuevamente seleccionando un plan de suscripción.
              Si tienes preguntas, contacta a nuestro equipo de soporte.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/billing", { replace: true })}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Volver a intentar
            </Button>
            <Button
              onClick={() => navigate("/", { replace: true })}
              variant="outline"
              className="w-full"
            >
              Ir al Dashboard
            </Button>
            <Button
              onClick={() => navigate("/", { replace: true })}
              variant="outline"
              className="w-full text-gray-600"
            >
              Ir al inicio
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="border-t pt-6 text-left space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">
              Preguntas frecuentes
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  ¿Por qué se canceló mi pago?
                </p>
                <p className="text-gray-600 mt-1">
                  Presionaste el botón "atrás" o cerraste la ventana de pago.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">¿Cobran si cancelo?</p>
                <p className="text-gray-600 mt-1">
                  No. No se realizó ningún cobro. Puedes intentar de nuevo sin
                  problema.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">¿Necesito ayuda?</p>
                <p className="text-gray-600 mt-1">
                  Contacta a soporte: support@clinidocs.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
