import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApiService } from "../services/public.service";
import type { SubscriptionPlan } from "../types";

export const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await publicApiService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === "monthly" ? plan.monthly_price : plan.annual_price;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MediRecord</h1>
          <Link
            to="/login"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Iniciar Sesión
          </Link>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Gestión Digital de Historias Clínicas
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Sistema SaaS completo para hospitales y clínicas
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              Comenzar Gratis
            </Link>
            href="#pricing" className="bg-blue-700 text-white px-8 py-4
            rounded-lg font-semibold text-lg hover:bg-blue-600 transition"
            <a>Ver Precios</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Seguro y Confiable</h3>
              <p className="text-gray-600">
                Cumple con todas las normativas de privacidad médica.
                Encriptación end-to-end.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-bold mb-2">100% en la Nube</h3>
              <p className="text-gray-600">
                Accede desde cualquier lugar. Sin instalación. Backups
                automáticos.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Reportes Inteligentes</h3>
              <p className="text-gray-600">
                Análisis de datos en tiempo real. Dashboards personalizables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Planes y Precios
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Elige el plan perfecto para tu clínica u hospital
          </p>

          {/* Toggle Billing Cycle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  billingCycle === "annual"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Anual{" "}
                <span className="text-green-500 text-sm ml-1">
                  (Ahorra 20%)
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando planes...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition ${
                    plan.plan_type === "professional"
                      ? "ring-2 ring-blue-600"
                      : ""
                  }`}
                >
                  {plan.plan_type === "professional" && (
                    <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                      MÁS POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="text-4xl font-bold mb-6">
                      ${getPrice(plan)}
                      <span className="text-lg text-gray-600">
                        /{billingCycle === "monthly" ? "mes" : "año"}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Hasta <strong>{plan.max_users}</strong> usuarios
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Hasta <strong>{plan.max_patients}</strong> pacientes
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <strong>{plan.storage_gb} GB</strong> de almacenamiento
                      </li>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/register?plan=${plan.id}&cycle=${billingCycle}`}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                        plan.plan_type === "professional"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      Seleccionar Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para digitalizar tu clínica?
          </h2>
          <p className="text-xl mb-8">
            Únete a cientos de profesionales de la salud que confían en
            MediRecord
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 MediRecord. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
