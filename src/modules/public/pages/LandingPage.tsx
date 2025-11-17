import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApiService } from "../services/public.service";
import type { SubscriptionPlan } from "../types";
import { Lock, Cloud, BarChart3 } from "lucide-react";

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
      console.log("Plans received:", data);
      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        console.error("Plans data is not an array:", data);
        setPlans([]);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      setPlans([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === "monthly" ? plan.monthly_price : plan.annual_price;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mejorado con gradiente premium y efecto 3D */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        </div>

        {/* Navbar */}
        <nav className="relative container mx-auto px-4 py-6 flex justify-between items-center z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            Clinic Records
          </h1>
          <Link
            to="/login"
            className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition shadow-lg hover:shadow-xl"
          >
            Iniciar Sesión
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-16 text-center z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight py-12">
            Gestión Digital de Historias Clínicas
          </h1>
          <p className="text-lg md:text-xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed">
            Plataforma SaaS completa y profesional para hospitales, clínicas y
            centros médicos que desean modernizar su gestión de datos
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <a
              href="#pricing"
              className="bg-white text-green-700 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Ver Planes y Precios
            </a>
            <Link
              to="/login"
              className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-700 transition shadow-xl hover:shadow-2xl"
            >
              Explorar Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Con iconos modernos */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas específicamente para
              profesionales de la salud
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 border border-gray-100">
              <div className="bg-gradient-to-br from-green-100 to-green-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Seguro y Confiable
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cumple con todas las normativas de privacidad médica.
                Encriptación end-to-end de datos sensibles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Cloud className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                100% en la Nube
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Accede desde cualquier lugar y dispositivo. Sin instalación.
                Backups automáticos diarios.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Reportes Inteligentes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Análisis de datos en tiempo real. Dashboards personalizables.
                Exporta en múltiples formatos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Planes Diseñados para Ti
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Elige el plan perfecto para tu clínica u hospital. Escala según
              crezca tu negocio.
            </p>

            {/* Toggle Billing Cycle */}
            <div className="flex justify-center mt-8 mb-8">
              <div className="bg-gray-100 rounded-xl p-1 shadow-md inline-flex">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-8 py-3 rounded-lg font-semibold transition ${
                    billingCycle === "monthly"
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-8 py-3 rounded-lg font-semibold transition ${
                    billingCycle === "annual"
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Anual{" "}
                  <span className="text-green-100 text-sm">(Ahorra 20%)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando planes...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No hay planes disponibles en este momento.
              </p>
              <p className="text-gray-500 text-sm">
                Por favor, contacta al administrador o intenta más tarde.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl overflow-hidden transition transform hover:scale-105 ${
                    plan.plan_type === "professional"
                      ? "ring-2 ring-green-500 shadow-2xl"
                      : "shadow-lg hover:shadow-xl"
                  }`}
                >
                  {plan.plan_type === "professional" && (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 text-sm font-bold tracking-wide">
                      🌟 MÁS POPULAR
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-5 text-sm h-10">
                      {plan.description}
                    </p>

                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 mb-5">
                      <div className="text-4xl font-bold text-gray-900">
                        ${getPrice(plan)}
                        <span className="text-sm text-gray-600 block font-normal mt-1">
                          /{billingCycle === "monthly" ? "mes" : "año"}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Hasta <strong>{plan.max_users}</strong> usuarios
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Hasta <strong>{plan.max_patients}</strong> pacientes
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          <strong>{plan.storage_gb} GB</strong> de
                          almacenamiento
                        </span>
                      </li>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/register?plan=${plan.id}&cycle=${billingCycle}`}
                      className={`block w-full text-center py-3 rounded-xl font-bold text-base transition transform hover:scale-105 shadow-md ${
                        plan.plan_type === "professional"
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
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

      {/* CTA Section - Mejorado con gradiente elegante */}
      <section className="py-16 bg-gradient-to-br from-green-900 via-green-800 to-blue-900 text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center z-10">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            ¿Listo para transformar tu clínica?
          </h2>
          <p className="text-lg mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed">
            Únete a cientos de profesionales de la salud que confían en Clinic
            Records para gestionar sus datos
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <a
              href="#pricing"
              className="bg-white text-green-700 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Ver Planes
            </a>
            <Link
              to="/login"
              className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-700 transition shadow-xl hover:shadow-2xl"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Clinic Records</h3>
              <p className="text-sm text-gray-500">
                Gestión digital de historias clínicas profesional y segura.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Características
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Precios
                  </a>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2025 Clinic Records. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
