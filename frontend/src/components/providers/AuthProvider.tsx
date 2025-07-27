// ============================================================================
// PROVIDER DE AUTENTICACIÓN - Principio de Responsabilidad Única
// ============================================================================

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuth } from '../../stores/authStore';

// ----------------------------------------------------------------------------
// CONTEXTO DE AUTENTICACIÓN
// ----------------------------------------------------------------------------

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------------------------------
// HOOK DE USO DEL CONTEXTO
// ----------------------------------------------------------------------------

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// ----------------------------------------------------------------------------
// COMPONENTE PROVIDER
// ----------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();

  // ----------------------------------------------------------------------------
  // EFECTOS
  // ----------------------------------------------------------------------------

  useEffect(() => {
    // Si hay un token pero no hay usuario, intentar refrescar
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  // ----------------------------------------------------------------------------
  // VALOR DEL CONTEXTO
  // ----------------------------------------------------------------------------

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 