import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { publicApiService } from "../services/public.service";

export const ActivationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = await publicApiService.activateTenant({
        activation_token: token,
        new_password: password,
      });

      // Mostrar mensaje de éxito y redirigir al login
      alert(`¡Cuenta activada! ${result.message}`);
      navigate("/login");
    } catch (err: any) {
      console.error("Error en activación:", err);
      setError(
        err.response?.data?.error ||
          "Error al activar la cuenta. El token puede haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Activar tu Cuenta
          </h2>
          <p className="text-gray-600">
            Establece una contraseña segura para tu cuenta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Repite tu contraseña"
              minLength={8}
            />
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">
                Seguridad de la contraseña:
              </p>
              <div className="space-y-1">
                <div
                  className={
                    password.length >= 8 ? "text-green-600" : "text-gray-400"
                  }
                >
                  {password.length >= 8 ? "✓" : "○"} Al menos 8 caracteres
                </div>
                <div
                  className={
                    /[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"
                  }
                >
                  {/[A-Z]/.test(password) ? "✓" : "○"} Una letra mayúscula
                </div>
                <div
                  className={
                    /[0-9]/.test(password) ? "text-green-600" : "text-gray-400"
                  }
                >
                  {/[0-9]/.test(password) ? "✓" : "○"} Un número
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Activando..." : "Activar Cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
};
