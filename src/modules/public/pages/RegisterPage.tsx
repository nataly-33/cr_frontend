import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { publicApiService } from "../services/public.service";
import type { TenantRegistrationRequest } from "../types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("cycle") || "monthly";

  const [formData, setFormData] = useState<TenantRegistrationRequest>({
    tenant_name: "",
    subdomain: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_phone: "",
    plan_id: planId ? parseInt(planId) : 1,
    billing_cycle: billingCycle as "monthly" | "annual",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null
  );

  const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,}$/;

  // Debounce para check de subdomain
  useEffect(() => {
    if (formData.subdomain.length >= 3) {
      const timer = setTimeout(() => {
        checkSubdomain();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSubdomainAvailable(null);
    }
  }, [formData.subdomain]);

  const checkSubdomain = async () => {
    setSubdomainChecking(true);
    try {
      const result = await publicApiService.checkSubdomainAvailability(
        formData.subdomain
      );
      setSubdomainAvailable(result.available);
    } catch (error) {
      setSubdomainAvailable(false);
    } finally {
      setSubdomainChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitizar subdomain
    if (name === "subdomain") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData({ ...formData, [name]: sanitized });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!SUBDOMAIN_REGEX.test(formData.subdomain)) {
      setError(
        "Subdominio inválido. Solo letras minúsculas, números y guiones. Mínimo 3 caracteres."
      );
      return;
    }

    if (!subdomainAvailable) {
      setError("El subdominio no está disponible");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Crear registro de tenant pendiente de pago
      const registration = await publicApiService.registerTenant(formData);

      // 2. Guardar datos en localStorage para después del pago
      sessionStorage.setItem(
        "pendingRegistration",
        JSON.stringify({
          registration_id: registration.registration_id,
          email: formData.admin_email,
          tenant_name: formData.tenant_name,
          subdomain: formData.subdomain,
        })
      );

      // 3. Crear sesión de Stripe Checkout
      const checkoutResponse = await publicApiService.createCheckoutSession({
        registration_id: registration.registration_id,
        plan_id: formData.plan_id,
        billing_cycle: formData.billing_cycle,
        tenant_name: formData.tenant_name,
        admin_email: formData.admin_email,
      });

      // 4. Redirigir a Stripe Checkout
      if (checkoutResponse.checkout_url) {
        window.location.href = checkoutResponse.checkout_url;
      } else {
        setError("No se pudo obtener la sesión de pago. Intenta nuevamente.");
      }
    } catch (err: any) {
      console.error("Error en registro:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.response?.data?.subdomain?.[0] ||
          "Error en el registro. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-2">Crear tu Cuenta</h1>
          <p className="text-gray-600">
            Completa el formulario para comenzar tu prueba gratuita
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Clínica */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Información de tu Clínica
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de tu Clínica/Hospital *
                  </label>
                  <input
                    type="text"
                    name="tenant_name"
                    required
                    value={formData.tenant_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Clínica La Paz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdominio (URL de tu sistema) *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="subdomain"
                      required
                      value={formData.subdomain}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        subdomainAvailable === false
                          ? "border-red-500"
                          : subdomainAvailable === true
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                      placeholder="lapaz"
                      minLength={3}
                    />
                    <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                      .com
                    </span>
                  </div>
                  {subdomainChecking && (
                    <p className="text-sm text-gray-500 mt-1">
                      Verificando disponibilidad...
                    </p>
                  )}
                  {subdomainAvailable === true && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Subdominio disponible
                    </p>
                  )}
                  {subdomainAvailable === false && (
                    <p className="text-sm text-red-600 mt-1">
                      ✗ Subdominio no disponible
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Solo letras minúsculas, números y guiones. Mínimo 3
                    caracteres.
                  </p>
                </div>
              </div>
            </div>

            {/* Información del Administrador */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tus Datos</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="admin_first_name"
                    required
                    value={formData.admin_first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="admin_last_name"
                    required
                    value={formData.admin_last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Personal (recibirás las credenciales aquí) *
                </label>
                <input
                  type="email"
                  name="admin_email"
                  required
                  value={formData.admin_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="tu.email@gmail.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa un email personal real. Te enviaremos las instrucciones de
                  activación aquí.
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+591 77123456"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !subdomainAvailable}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Crear Cuenta y Proceder al Pago"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al continuar, aceptas nuestros Términos de Servicio y Política
                de Privacidad
              </p>
            </div>
          </form>
        </div>

        {/* Ya tienes cuenta */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
