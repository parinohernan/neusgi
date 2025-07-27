// ============================================================================
// PÁGINA DEL DASHBOARD - Principio de Responsabilidad Única
// ============================================================================

import { useAuth } from '../../stores/authStore';
import { useUI } from '../../stores/uiStore';
import { 
  BarChart3, 
  Users, 
  Truck, 
  FileText, 
  ShoppingCart, 
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp
} from 'lucide-react';

// ----------------------------------------------------------------------------
// COMPONENTE DASHBOARD PAGE
// ----------------------------------------------------------------------------

export const DashboardPage = () => {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();

  // ----------------------------------------------------------------------------
  // DATOS DE EJEMPLO (TEMPORALES)
  // ----------------------------------------------------------------------------

  const stats = [
    {
      title: 'Presupuestos Pendientes',
      value: '12',
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Órdenes Activas',
      value: '8',
      change: '+1.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Equipos Disponibles',
      value: '15',
      change: '-0.8%',
      changeType: 'negative' as const,
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Facturas por Cobrar',
      value: '$45,230',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'presupuesto',
      message: 'Nuevo presupuesto creado para Cliente ABC',
      time: 'Hace 2 horas',
      status: 'success' as const,
    },
    {
      id: 2,
      type: 'orden',
      message: 'Orden de compra #OC-001 aprobada',
      time: 'Hace 4 horas',
      status: 'success' as const,
    },
    {
      id: 3,
      type: 'pago',
      message: 'Pago recibido por factura #F-2024-001',
      time: 'Hace 6 horas',
      status: 'success' as const,
    },
    {
      id: 4,
      type: 'alerta',
      message: 'Equipo TR-001 requiere mantenimiento',
      time: 'Hace 1 día',
      status: 'warning' as const,
    },
  ];

  // ----------------------------------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <BarChart3 className="h-6 w-6" />
            </button>
            <h1 className="ml-3 text-2xl font-semibold text-gray-900">
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Bienvenido, {user?.name}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos y Actividad Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Ventas */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ventas Mensuales
              </h3>
              <div className="h-64 flex items-center justify-center bg-secondary-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Gráfico de ventas (Pendiente)</p>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Nuevo Presupuesto</span>
              </button>
              
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Nueva Orden</span>
              </button>
              
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Parte Diario</span>
              </button>
              
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <Receipt className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Nueva Factura</span>
              </button>
              
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <CreditCard className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Registrar Pago</span>
              </button>
              
              <button className="card p-4 text-center hover:shadow-medium transition-shadow">
                <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Nuevo Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 