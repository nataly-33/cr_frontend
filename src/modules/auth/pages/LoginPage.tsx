import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@core/store/auth.store";
import { useSettingsStore } from "@core/store/settings.store";
import { settingsService } from "@modules/settings/services/settings.service";
import type { LoginCredentials } from "../types";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setPreferences } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();
  const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Clinic Records";

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(data);

      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);

      const user = {
        id: response.user.id,
        email: response.user.email,
        first_name: response.user.first_name || "",
        last_name: response.user.last_name || "",
        full_name: response.user.full_name,
        tenant: response.user.tenant,
        is_active: true,
        is_tenant_owner: response.user.is_tenant_owner || false,
      };

      setAuth(user, response.access);

      // Cargar preferencias del usuario desde el backend
      try {
        const preferences = await settingsService.getPreferences();
        setPreferences(preferences);
      } catch (error) {
        console.error("Error al cargar preferencias:", error);
        // Si hay error, las preferencias quedan en default (light)
      }

      toast.success("¡Bienvenido!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-blue-900 py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Contenedor del Login */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Card del Login con sombra y efecto 3D */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-white/20 transform">
          {/* Header */}
          <div className="text-center mb-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Gestión Digital de Historias Clínicas
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  {...register("email", { required: "Email es requerido" })}
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 bg-gray-50 hover:bg-white"
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.101 12.93a1 1 0 00-1.414-1.414L10 17.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l8-8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Contraseña es requerida",
                  })}
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 bg-gray-50 hover:bg-white"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.101 12.93a1 1 0 00-1.414-1.414L10 17.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l8-8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{" "}
              <a
                href="/landing"
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Registrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
