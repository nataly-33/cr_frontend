import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '../store/settings.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { preferences } = useSettingsStore();

  useEffect(() => {
    // Aplicar tema
    const root = document.documentElement;

    // Remover todas las clases de tema
    root.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green', 'theme-purple');

    // Agregar la clase del tema actual
    if (preferences.theme !== 'light') {
      root.classList.add(`theme-${preferences.theme}`);
    }

    // Aplicar tamaño de fuente
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${preferences.font_size}`);

    // Aplicar tipografía
    const fontFamilyMap = {
      'inter': 'Inter',
      'roboto': 'Roboto',
      'open-sans': 'Open Sans',
      'lato': 'Lato',
      'montserrat': 'Montserrat'
    };

    document.body.style.fontFamily = `${fontFamilyMap[preferences.font_family]}, sans-serif`;
  }, [preferences.theme, preferences.font_size, preferences.font_family]);

  return <>{children}</>;
};
