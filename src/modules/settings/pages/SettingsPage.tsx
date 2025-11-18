import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettingsStore } from "../../../core/store/settings.store";
import { settingsService } from "../services/settings.service";

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { preferences, setPreferences, setLanguage } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  // Cargar preferencias del backend al montar el componente
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await settingsService.getPreferences();
        // Si el backend devuelve preferencias, usarlas
        // Si no, usar 'light' por defecto (no guardamos light en el backend)
        setPreferences(prefs);
        i18n.changeLanguage(prefs.language);
      } catch (error) {
        console.error("Error loading preferences:", error);
        // Si falla, resetear a light
        setPreferences({ theme: "light" });
      }
    };
    loadPreferences();
  }, [setPreferences, i18n]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await settingsService.updatePreferences(preferences);
      toast.success(t("settings.changesSaved"));
    } catch (error) {
      toast.error(t("common.error"));
      console.error("Error saving preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (language: "es" | "en") => {
    setLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          {t("settings.title")}
        </h1>
        <p className="mt-2" style={{ color: "rgb(var(--text-secondary))" }}>
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="card space-y-6">
        {/* Apariencia */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("settings.appearance")}
          </h2>

          {/* Tema */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t("settings.theme")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {(
                ["light", "dark", "blue", "green", "purple", "yellow"] as const
              ).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setPreferences({ theme })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.theme === theme
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                        theme === "light"
                          ? "bg-white border-2 border-gray-300"
                          : theme === "dark"
                          ? "bg-gray-900"
                          : theme === "blue"
                          ? "bg-blue-500"
                          : theme === "green"
                          ? "bg-green-500"
                          : theme === "purple"
                          ? "bg-purple-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm">
                      {t(`settings.themes.${theme}`)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tama�o de fuente */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t("settings.fontSize")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["small", "medium", "large", "extra-large"] as const).map(
                (size) => (
                  <button
                    key={size}
                    onClick={() => setPreferences({ font_size: size })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.font_size === size
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <span className="text-sm">
                      {t(`settings.fontSizes.${size}`)}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tipograf�a */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t("settings.fontFamily")}
            </label>
            <select
              value={preferences.font_family}
              onChange={(e) =>
                setPreferences({
                  font_family: e.target.value as typeof preferences.font_family,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {(
                ["inter", "roboto", "open-sans", "lato", "montserrat"] as const
              ).map((font) => (
                <option key={font} value={font}>
                  {t(`settings.fontFamilies.${font}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Idioma */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t("settings.language")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["es", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.language === lang
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <span className="text-sm">
                    {t(`settings.languages.${lang}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {t("settings.notifications")}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-sm">
                  {t("settings.emailNotifications")}
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) =>
                    setPreferences({ email_notifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-sm">
                  {t("settings.pushNotifications")}
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_notifications}
                  onChange={(e) =>
                    setPreferences({ push_notifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Bot�n guardar */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3 bg-primary-600 text-black rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("common.loading") : t("settings.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
};
