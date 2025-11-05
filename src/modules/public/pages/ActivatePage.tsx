import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { publicApiService } from "../services/public.service";

export const ActivatePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<{
    tenant_name: string;
    login_url: string;
  } | null>(null);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  useEffect(() => {
    if (!token) {
      setError("Token de activación no válido");
    }
  }, [token]);

  useEffect(() => {
    // Validar contraseña en tiempo real
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  const isPasswordValid = () => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUpper &&
      passwordValidation.hasLower &&
      passwordValidation.hasNumber
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de activación no válido");
      return;
    }

    if (!isPasswordValid()) {
      setError("La contraseña no cumple con los requisitos mínimos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await publicApiService.activateTenant({
        activation_token: token,
        new_password: password,
      });

      setSuccess(true);
      setTenantInfo({
        tenant_name: response.tenant_name,
        login_url: response.login_url,
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Error activando cuenta:", err);
      setError(
        err.response?.data?.error ||
          "Error al activar la cuenta. El token puede ser inválido o expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && tenantInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Cuenta Activada!
          </h1>

          <p className="text-gray-600 mb-6">
            Tu cuenta para <strong>{tenantInfo.tenant_name}</strong> ha sido
            activada exitosamente.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 mb-2">
              Serás redirigido al login en 3 segundos...
            </p>
            <p className="text-xs text-green-600">
              O haz clic en el botón de abajo
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Activa tu Cuenta
          </h1>
          <p className="text-gray-600">
            Establece tu contraseña para completar el registro
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              La contraseña debe contener:
            </p>
            <ul className="space-y-1 text-sm">
              <li
                className={
                  passwordValidation.minLength
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {passwordValidation.minLength ? "✓" : "○"} Mínimo 8 caracteres
              </li>
              <li
                className={
                  passwordValidation.hasUpper
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {passwordValidation.hasUpper ? "✓" : "○"} Una letra mayúscula
              </li>
              <li
                className={
                  passwordValidation.hasLower
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {passwordValidation.hasLower ? "✓" : "○"} Una letra minúscula
              </li>
              <li
                className={
                  passwordValidation.hasNumber
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {passwordValidation.hasNumber ? "✓" : "○"} Un número
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid() || password !== confirmPassword}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Activando...
              </span>
            ) : (
              "Activar Cuenta"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-green-600 hover:text-green-800"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
