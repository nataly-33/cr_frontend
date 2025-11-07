import { useEffect, useState } from "react";
import { paymentService, type SubscriptionPlan } from "../services/payment.service";
import { Button } from "@shared/components/ui/Button";
import { Card } from "@shared/components/ui/Card";
import { toast } from "react-toastify";
import { Loader2, Check } from "lucide-react";

export const BillingPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getPlans();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("No se pudo cargar los planes de suscripción");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      setIsCheckingOut(true);
      const response = await paymentService.createCheckoutSession(planId);

      // Redirigir a Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Error al iniciar el pago. Intenta de nuevo.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Planes de Suscripción</h1>
        <p className="text-gray-600">
          Elige el plan que mejor se adapte a las necesidades de tu clínica
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative flex flex-col">
            {plan.plan_type === "professional" && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                Recomendado
              </div>
            )}

            <div className="p-6 space-y-6 flex flex-col flex-1">
              {/* Plan Name and Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-2 border-b pb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.monthly_price}
                  </span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <p className="text-sm text-gray-500">
                  O ${plan.annual_price}/año (ahorra 17%)
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">
                  Características incluidas:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Hasta {plan.max_users} usuarios</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Hasta {plan.max_patients} pacientes</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{plan.storage_gb} GB de almacenamiento</span>
                  </li>
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCheckingOut}
                className={`w-full mt-6 ${
                  plan.plan_type === "professional"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Seleccionar Plan"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Support Section */}
      <Card className="bg-blue-50">
        <div className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            ¿Necesitas ayuda para elegir?
          </h3>
          <p className="text-gray-700 mb-4">
            Nuestro equipo de soporte está disponible para ayudarte a seleccionar el
            plan más adecuado para tu institución.
          </p>
          <Button variant="outline" className="text-blue-600 border-blue-600">
            Contactar Soporte
          </Button>
        </div>
      </Card>
    </div>
  );
};
