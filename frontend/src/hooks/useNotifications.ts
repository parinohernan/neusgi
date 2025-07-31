import { useCallback } from 'react';

interface NotificationOptions {
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useNotifications = () => {
  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    const { duration = 5000, type = 'info' } = options;
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification is-${type} is-light`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Contenido de la notificación
    notification.innerHTML = `
      <button class="delete" onclick="this.parentElement.remove()"></button>
      ${message}
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
    
    // Remover estilos después de un tiempo
    setTimeout(() => {
      if (style.parentElement) {
        style.remove();
      }
    }, duration + 1000);
  }, []);

  const success = useCallback((message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'success' });
  }, [showNotification]);

  const error = useCallback((message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'error' });
  }, [showNotification]);

  const warning = useCallback((message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'warning' });
  }, [showNotification]);

  const info = useCallback((message: string, options?: Omit<NotificationOptions, 'type'>) => {
    showNotification(message, { ...options, type: 'info' });
  }, [showNotification]);

  return {
    success,
    error,
    warning,
    info,
    showNotification
  };
}; 