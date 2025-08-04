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
import { EditarPresupuestoPage } from '../pages/presupuestos/EditarPresupuestoPage';
import { DetallePresupuestoPage } from '../pages/presupuestos/DetallePresupuestoPage';
import { NuevaOrdenCompraPage } from '../pages/ordenes-compra/NuevaOrdenCompraPage';
import { EditarOrdenCompraPage } from '../pages/ordenes-compra/EditarOrdenCompraPage';
import { EmpleadosPage } from '../pages/empleados/EmpleadosPage';
import { NuevoEmpleadoPage } from '../pages/empleados/NuevoEmpleadoPage';
import { NuevoParteDiarioPage } from '../pages/partes-diario/NuevoParteDiarioPage';
import { DocumentosPage } from '../pages/presupuestos/DocumentosPage';

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
      
      {/* Rutas de empleados */}
      <Route
        path="/empleados/nuevo"
        element={
          <ProtectedRoute>
            <NuevoEmpleadoPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/empleados"
        element={
          <ProtectedRoute>
            <EmpleadosPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/empleados/*"
        element={
          <ProtectedRoute>
            <div>Página de Empleados (Pendiente)</div>
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
        path="/presupuestos/:id/editar"
        element={
          <ProtectedRoute>
            <EditarPresupuestoPage />
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
        path="/presupuestos/:presupuestoId/orden-compra/nueva"
        element={
          <ProtectedRoute>
            <NuevaOrdenCompraPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/:presupuestoId/orden-compra/editar"
        element={
          <ProtectedRoute>
            <EditarOrdenCompraPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/:presupuestoId/parte-diario/nuevo"
        element={
          <ProtectedRoute>
            <NuevoParteDiarioPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/presupuestos/:presupuestoId/documentos"
        element={
          <ProtectedRoute>
            <DocumentosPage />
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
        path="/ordenes-compra/nueva"
        element={
          <ProtectedRoute>
            <NuevaOrdenCompraPage />
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