import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'blue' | 'green' | 'purple';
  language: 'es' | 'en';
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  font_family: 'inter' | 'roboto' | 'open-sans' | 'lato' | 'montserrat';
  email_notifications: boolean;
  push_notifications: boolean;
  custom_settings?: Record<string, unknown>;
}

interface SettingsStore {
  preferences: UserPreferences;
  isLoading: boolean;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: UserPreferences['language']) => void;
  setFontSize: (fontSize: UserPreferences['font_size']) => void;
  setFontFamily: (fontFamily: UserPreferences['font_family']) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'es',
  font_size: 'medium',
  font_family: 'inter',
  email_notifications: true,
  push_notifications: true,
  custom_settings: {}
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      isLoading: false,

      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme }
        })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: { ...state.preferences, language }
        })),

      setFontSize: (font_size) =>
        set((state) => ({
          preferences: { ...state.preferences, font_size }
        })),

      setFontFamily: (font_family) =>
        set((state) => ({
          preferences: { ...state.preferences, font_family }
        })),

      setIsLoading: (isLoading) => set({ isLoading }),

      resetPreferences: () =>
        set({ preferences: defaultPreferences })
    }),
    {
      name: 'user-settings-storage'
    }
  )
);
