import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@shared/components/ui/Card";
import { Button } from "@shared/components/ui/Button";
import { toast } from "react-toastify";
import { CheckCircle, Loader2 } from "lucide-react";

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        if (!sessionId) {
          throw new Error("No se encontró el ID de sesión");
        }

        // En producción: hacer petición al backend para verificar session_id
        // Por ahora, asumimos que si llegó aquí, el pago fue exitoso
        // (El webhook de Stripe habrá actualizado la suscripción)

        // Simular datos del pago
        const registrationData = sessionStorage.getItem("pendingRegistration")
          ? JSON.parse(sessionStorage.getItem("pendingRegistration") || "{}")
          : null;

        setPaymentData({
          sessionId,
          email: registrationData?.email || null,
          timestamp: new Date().toLocaleString(),
          status: "completed",
        });

        // Mensaje de éxito
        toast.success("¡Pago completado exitosamente!");

        // Esperar 15 segundos antes de redirigir a dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 15000);
      } catch (err) {
        console.error("Error verificando pago:", err);
        setError(
          err instanceof Error ? err.message : "Error al verificar el pago"
        );
        toast.error("Hubo un error al procesar tu pago");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">
              Verificando tu pago...
            </h2>
            <p className="text-sm text-gray-600">
              Por favor espera mientras procesamos tu información.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center space-y-6">
            <div className="text-red-600 text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">
              Error en el pago
            </h2>
            <p className="text-gray-700">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/billing", { replace: true })}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Volver a intentar
              </Button>
              <Button
                onClick={() => navigate("/dashboard", { replace: true })}
                variant="outline"
                className="w-full"
              >
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 text-center space-y-6">
          {/* Icono de éxito */}
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Pago completado!
            </h1>
            <p className="text-gray-600">
              Tu suscripción ha sido activada exitosamente.
            </p>
          </div>

          {/* Detalles del pago */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
              {/* Email */}
              {paymentData.email && (
                <div>
                  <p className="text-sm text-gray-600">Correo electrónico</p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {paymentData.email}
                  </p>
                </div>
              )}

              {/* Sesión de pago - truncado para no salirse */}
              <div>
                <p className="text-sm text-gray-600">Sesión de pago</p>
                <p className="text-xs font-mono text-gray-900 break-all bg-white px-2 py-1 rounded border border-gray-200">
                  {paymentData.sessionId}
                </p>
              </div>

              {/* Fecha y hora */}
              <div>
                <p className="text-sm text-gray-600">Fecha y hora</p>
                <p className="text-sm text-gray-900">{paymentData.timestamp}</p>
              </div>

              {/* Estado */}
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-sm font-semibold text-green-600">
                  {paymentData.status === "completed"
                    ? "Completado"
                    : "Pendiente"}
                </p>
              </div>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Recibirás un correo de confirmación con los detalles de tu
              suscripción. Redirigiendo al dashboard en 15 segundos...
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/dashboard", { replace: true })}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Ir al Dashboard
            </Button>
            <Button
              onClick={() => navigate("/billing", { replace: true })}
              variant="outline"
              className="w-full"
            >
              Ver mis planes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
