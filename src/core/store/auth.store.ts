import { create } from "zustand";
import type { User } from "@core/types";
import { useSettingsStore } from "./settings.store";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),

  setAuth: (user, token) => {
    localStorage.setItem("access_token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Limpiar localStorage antiguo de preferencias (de cuando se usaba persist)
    localStorage.removeItem("user-settings-storage");

    // Resetear preferencias al tema light por defecto
    useSettingsStore.getState().resetPreferences();

    set({ user: null, token: null, isAuthenticated: false });
  },
}));
