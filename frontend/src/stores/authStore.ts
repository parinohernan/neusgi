// ============================================================================
// STORE DE AUTENTICACIÓN - Principio de Responsabilidad Única
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, LoginForm } from '../types';
import { api } from '../services/api';

// ----------------------------------------------------------------------------
// INTERFACES DEL STORE
// ----------------------------------------------------------------------------

interface AuthStore extends AuthState {
  // Acciones
  login: (credentials: LoginForm) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<void>;
}

// ----------------------------------------------------------------------------
// STORE DE AUTENTICACIÓN
// ----------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ----------------------------------------------------------------------------
      // ACCIONES
      // ----------------------------------------------------------------------------

      login: async (credentials: LoginForm): Promise<boolean> => {
        try {
          set({ isLoading: true });

          const response = await api.post<{ user: User; token: string }>('/auth/login', credentials);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Configurar token en el cliente API
            api.setAuthToken(token);

            // Actualizar estado
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Error en login:', error);
          return false;
        }
      },

      logout: () => {
        // Limpiar token del cliente API
        api.removeAuthToken();

        // Limpiar estado
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        // Configurar token en el cliente API
        api.setAuthToken(token);

        set({ token, isAuthenticated: true });
      },

      clearAuth: () => {
        // Limpiar token del cliente API
        api.removeAuthToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });

          const response = await api.get<User>('/auth/me');

          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
            });
          } else {
            // Si no se puede obtener el usuario, hacer logout
            get().logout();
          }
        } catch (error) {
          console.error('Error al refrescar usuario:', error);
          // Si hay error, hacer logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ----------------------------------------------------------------------------
// SELECTORES DERIVADOS
// ----------------------------------------------------------------------------

export const useAuthSelectors = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isOperator: user?.role === 'OPERATOR',
    isDriver: user?.role === 'DRIVER',
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => user?.role ? roles.includes(user.role) : false,
  };
};

// ----------------------------------------------------------------------------
// HOOKS DE UTILIDAD
// ----------------------------------------------------------------------------

export const useAuth = () => {
  const authStore = useAuthStore();
  const selectors = useAuthSelectors();

  return {
    ...authStore,
    ...selectors,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
}; 