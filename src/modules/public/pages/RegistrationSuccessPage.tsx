import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export const RegistrationSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [email, setEmail] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("");

  useEffect(() => {
    // Obtener datos del sessionStorage
    const pendingReg = sessionStorage.getItem("pendingRegistration");
    if (pendingReg) {
      const reg = JSON.parse(pendingReg);
      setEmail(reg.email);
      setTenantName(reg.tenant_name);

      // Limpiar después de usarlos
      sessionStorage.removeItem("pendingRegistration");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Completado!
        </h2>

        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado exitosamente. Hemos enviado un email a{" "}
          <strong className="text-gray-900">{email}</strong> con las
          instrucciones para activar tu cuenta de <strong>{tenantName}</strong>.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-green-900 mb-2">Próximos pasos:</h3>
          <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
            <li>Revisa tu bandeja de entrada (y carpeta de spam)</li>
            <li>Haz clic en el enlace de activación</li>
            <li>Establece tu contraseña personalizada</li>
            <li>¡Comienza a usar tu sistema!</li>
          </ol>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-4">
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Volver al Inicio
          </Link>

          <p className="text-sm text-gray-500">
            ¿No recibiste el email?{" "}
            <button className="text-green-600 hover:text-green-700 font-semibold">
              Reenviar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
