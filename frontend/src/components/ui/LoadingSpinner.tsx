// ============================================================================
// COMPONENTE LOADING SPINNER - Principio de Responsabilidad Única
// ============================================================================

import { Loader2 } from 'lucide-react';

// ----------------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------------

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE TAMAÑOS
// ----------------------------------------------------------------------------

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

// ----------------------------------------------------------------------------
// COMPONENTE LOADING SPINNER
// ----------------------------------------------------------------------------

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  return (
    <Loader2 
      className={`animate-spin text-primary-500 ${sizeClasses[size]} ${className}`}
    />
  );
}; 