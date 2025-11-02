import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@core/store/auth.store";
import type { LoginCredentials } from "../types";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
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
      toast.success("¡Bienvenido!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {APP_TITLE}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión Documental
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                {...register("email", { required: "Email es requerido" })}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                {...register("password", {
                  required: "Contraseña es requerida",
                })}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Contraseña"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};
