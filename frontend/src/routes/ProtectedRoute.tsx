// ============================================================================
// COMPONENTE DE RUTA PROTEGIDA - Principio de Responsabilidad Única
// ============================================================================

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';

// ----------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

// ----------------------------------------------------------------------------
// COMPONENTE PROTECTED ROUTE
// ----------------------------------------------------------------------------

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // ----------------------------------------------------------------------------
  // VALIDACIONES
  // ----------------------------------------------------------------------------

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si se requieren roles específicos, validar
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user?.role || '');
    
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ----------------------------------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------------------------------

  return <>{children}</>;
}; 