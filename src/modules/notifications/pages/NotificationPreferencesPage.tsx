import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { notificationsService, type INotificationPreference } from '../services/notifications.service';

export const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<INotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationsService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando preferencias' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationsService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Preferencias guardadas correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error guardando preferencias' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof INotificationPreference) => {
    if (preferences && typeof preferences[field] === 'boolean') {
      setPreferences({
        ...preferences,
        [field]: !preferences[field]
      });
    }
  };

  const handleNumberChange = (field: keyof INotificationPreference, value: number) => {
    if (preferences && typeof preferences[field] === 'number') {
      setPreferences({
        ...preferences,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center text-red-600 py-20">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Error cargando preferencias</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
        <p className="text-gray-600 mt-2">Gestiona cómo deseas recibir notificaciones</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        {/* Notificaciones por Email */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📧</span> Notificaciones por Email
          </h2>
          <div className="space-y-3 pl-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.document_uploaded_email}
                onChange={() => handleToggle('document_uploaded_email')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-gray-700">Cuando se carga un documento</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.record_created_email}
                onChange={() => handleToggle('record_created_email')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-gray-700">Cuando se crea una historia clínica</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.record_updated_email}
                onChange={() => handleToggle('record_updated_email')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-gray-700">Cuando se actualiza una historia clínica</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.access_granted_email}
                onChange={() => handleToggle('access_granted_email')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-gray-700">Cuando se otorga acceso a documentos</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.comment_added_email}
                onChange={() => handleToggle('comment_added_email')}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-gray-700">Cuando se agrega un comentario</span>
            </label>
          </div>
        </div>

        {/* Límites */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚙️</span> Límites
          </h2>
          <div className="pl-6">
            <label className="block text-gray-700 font-medium mb-3">
              Máximo de emails por día: <span className="text-blue-600 font-bold">{preferences.max_emails_per_day}</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={preferences.max_emails_per_day}
                onChange={(e) => handleNumberChange('max_emails_per_day', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500 min-w-fit">
                {preferences.max_emails_per_day} emails/día
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Recibirás como máximo <strong>{preferences.max_emails_per_day}</strong> emails por día para evitar sobrecarga.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="border-t pt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
          <button
            onClick={loadPreferences}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Consejo:</strong> Ajusta estas preferencias para recibir solo las notificaciones que necesitas. Puedes cambiarlas en cualquier momento.
        </p>
      </div>
    </div>
  );
};
