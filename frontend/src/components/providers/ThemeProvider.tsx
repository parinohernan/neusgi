// ============================================================================
// PROVIDER DE TEMA - Principio de Responsabilidad Única
// ============================================================================

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useUI } from '../../stores/uiStore';

// ----------------------------------------------------------------------------
// CONTEXTO DE TEMA
// ----------------------------------------------------------------------------

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ----------------------------------------------------------------------------
// HOOK DE USO DEL CONTEXTO
// ----------------------------------------------------------------------------

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// ----------------------------------------------------------------------------
// COMPONENTE PROVIDER
// ----------------------------------------------------------------------------

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme, isDark, isLight, toggleTheme, setTheme } = useUI();

  // ----------------------------------------------------------------------------
  // EFECTOS
  // ----------------------------------------------------------------------------

  useEffect(() => {
    // Aplicar tema al documento
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // ----------------------------------------------------------------------------
  // VALOR DEL CONTEXTO
  // ----------------------------------------------------------------------------

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 