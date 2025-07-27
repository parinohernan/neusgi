// ============================================================================
// STORE DE UI - Principio de Responsabilidad Única
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState, Notification } from '../types';

// ----------------------------------------------------------------------------
// INTERFACES DEL STORE
// ----------------------------------------------------------------------------

interface UIStore extends UIState {
  // Acciones de sidebar
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Acciones de tema
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Acciones de notificaciones
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

// ----------------------------------------------------------------------------
// STORE DE UI
// ----------------------------------------------------------------------------

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarOpen: true,
      theme: 'light',
      notifications: [],

      // ----------------------------------------------------------------------------
      // ACCIONES DE SIDEBAR
      // ----------------------------------------------------------------------------

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      openSidebar: () => {
        set({ sidebarOpen: true });
      },

      closeSidebar: () => {
        set({ sidebarOpen: false });
      },

      // ----------------------------------------------------------------------------
      // ACCIONES DE TEMA
      // ----------------------------------------------------------------------------

      toggleTheme: () => {
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        }));
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      // ----------------------------------------------------------------------------
      // ACCIONES DE NOTIFICACIONES
      // ----------------------------------------------------------------------------

      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration || 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification].slice(-5), // Máximo 5 notificaciones
        }));

        // Auto-remover notificación después del tiempo especificado
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      updateNotification: (id: string, updates: Partial<Notification>) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        }));
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// ----------------------------------------------------------------------------
// SELECTORES DERIVADOS
// ----------------------------------------------------------------------------

export const useUISelectors = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const theme = useUIStore((state) => state.theme);
  const notifications = useUIStore((state) => state.notifications);

  return {
    sidebarOpen,
    theme,
    notifications,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    hasNotifications: notifications.length > 0,
    unreadNotifications: notifications.length,
  };
};

// ----------------------------------------------------------------------------
// HOOKS DE UTILIDAD
// ----------------------------------------------------------------------------

export const useUI = () => {
  const uiStore = useUIStore();
  const selectors = useUISelectors();

  return {
    ...uiStore,
    ...selectors,
  };
};

// ----------------------------------------------------------------------------
// FUNCIONES DE CONVENIENCIA PARA NOTIFICACIONES
// ----------------------------------------------------------------------------

export const useNotifications = () => {
  const { addNotification, removeNotification, clearNotifications } = useUIStore();

  return {
    success: (title: string, message: string = '', duration?: number) =>
      addNotification({ type: 'success', title, message, duration }),
    
    error: (title: string, message: string = '', duration?: number) =>
      addNotification({ type: 'error', title, message, duration }),
    
    warning: (title: string, message: string = '', duration?: number) =>
      addNotification({ type: 'warning', title, message, duration }),
    
    info: (title: string, message: string = '', duration?: number) =>
      addNotification({ type: 'info', title, message, duration }),
    
    remove: removeNotification,
    clear: clearNotifications,
  };
}; 