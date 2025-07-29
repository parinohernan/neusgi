// ============================================================================
// SISTEMA DE RUTAS - Principio de Responsabilidad Única
// ============================================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { NuevoClientePage } from '../pages/clientes/NuevoClientePage';
import { ClientesPage } from '../pages/clientes/ClientesPage';
import { EquiposPage } from '../pages/equipos/EquiposPage';
import { NuevoEquipoPage } from '../pages/equipos/NuevoEquipoPage';
import { EditarEquipoPage } from '../pages/equipos/EditarEquipoPage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PresupuestosPage } from '../pages/presupuestos/PresupuestosPage';
import { NuevoPresupuestoPage } from '../pages/presupuestos/NuevoPresupuestoPage';
import { DetallePresupuestoPage } from '../pages/presupuestos/DetallePresupuestoPage';

// ----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL DE RUTAS
// ----------------------------------------------------------------------------

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // ----------------------------------------------------------------------------
  // ESTADO DE CARGA
  // ----------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // RUTAS PÚBLICAS
  // ----------------------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // ----------------------------------------------------------------------------
  // RUTAS PROTEGIDAS
  // ----------------------------------------------------------------------------

  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/auth/login" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Rutas de gestión */}
      <Route
        path="/clientes/nuevo"
        element={
          <ProtectedRoute>
            <NuevoClientePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientesPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/clientes/*"
        element={
          <ProtectedRoute>
            <div>Página de Clientes (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      {/* Rutas de equipos */}
      <Route
        path="/equipos/nuevo"
        element={
          <ProtectedRoute>
            <NuevoEquipoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/equipos/:id/editar"
        element={
          <ProtectedRoute>
            <EditarEquipoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/equipos"
        element={
          <ProtectedRoute>
            <EquiposPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/equipos/*"
        element={
          <ProtectedRoute>
            <div>Página de Equipos (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos"
        element={
          <ProtectedRoute>
            <PresupuestosPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/nuevo"
        element={
          <ProtectedRoute>
            <NuevoPresupuestoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/:id"
        element={
          <ProtectedRoute>
            <DetallePresupuestoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/*"
        element={
          <ProtectedRoute>
            <div>Página de Presupuestos (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/ordenes-compra/*"
        element={
          <ProtectedRoute>
            <div>Página de Órdenes de Compra (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/partes-diario/*"
        element={
          <ProtectedRoute>
            <div>Página de Partes Diarios (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/remitos/*"
        element={
          <ProtectedRoute>
            <div>Página de Remitos (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/facturas/*"
        element={
          <ProtectedRoute>
            <div>Página de Facturas (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pagos/*"
        element={
          <ProtectedRoute>
            <div>Página de Pagos (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/usuarios/*"
        element={
          <ProtectedRoute>
            <div>Página de Usuarios (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reportes/*"
        element={
          <ProtectedRoute>
            <div>Página de Reportes (Pendiente)</div>
          </ProtectedRoute>
        }
      />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}; 