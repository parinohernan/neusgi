import React from 'react';
import { useAuth } from '../../stores/authStore';
import { useUI } from '../../stores/uiStore';
import { 
  Truck, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Package,
  Receipt,
  CreditCard,
  BarChart3
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toggleSidebar } = useUI();

  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      title: 'Presupuestos Activos',
      value: '24',
      change: '+12%',
      isPositive: true,
      icon: FileText,
      color: 'is-primary'
    },
    {
      title: 'Órdenes de Compra',
      value: '18',
      change: '+8%',
      isPositive: true,
      icon: Package,
      color: 'is-success'
    },
    {
      title: 'Facturas Pendientes',
      value: '12',
      change: '-3%',
      isPositive: false,
      icon: Receipt,
      color: 'is-warning'
    },
    {
      title: 'Ingresos del Mes',
      value: '$45,230',
      change: '+15%',
      isPositive: true,
      icon: DollarSign,
      color: 'is-info'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'presupuesto',
      title: 'Nuevo presupuesto creado',
      description: 'Presupuesto para Constructora ABC S.A.',
      time: 'Hace 2 horas',
      status: 'success'
    },
    {
      id: 2,
      type: 'orden',
      title: 'Orden de compra aprobada',
      description: 'OC-2024-001 para Transportes XYZ',
      time: 'Hace 4 horas',
      status: 'success'
    },
    {
      id: 3,
      type: 'factura',
      title: 'Factura generada',
      description: 'FAC-2024-015 por $12,500',
      time: 'Hace 6 horas',
      status: 'info'
    },
    {
      id: 4,
      type: 'pago',
      title: 'Pago recibido',
      description: 'Transferencia de $8,750',
      time: 'Hace 1 día',
      status: 'success'
    }
  ];

  const quickActions = [
    { title: 'Nuevo Presupuesto', icon: FileText, color: 'is-primary', href: '/presupuestos/nuevo' },
    { title: 'Crear Cliente', icon: Users, color: 'is-success', href: '/clientes/nuevo' },
    { title: 'Registrar Equipo', icon: Truck, color: 'is-info', href: '/equipos/nuevo' },
    { title: 'Generar Factura', icon: Receipt, color: 'is-warning', href: '/facturas/nueva' }
  ];

  return (
    <div className="main-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header mb-4">
          <h3 className="title is-4 has-text-primary">NEUSGI</h3>
          <p className="subtitle is-6 has-text-grey">Panel de Control</p>
        </div>
        
        <nav className="sidebar-menu">
          <div className="sidebar-item">
            <a href="/dashboard" className="sidebar-link is-active">
              <BarChart3 className="sidebar-icon" />
              Dashboard
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/presupuestos" className="sidebar-link">
              <FileText className="sidebar-icon" />
              Presupuestos
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/ordenes-compra" className="sidebar-link">
              <Package className="sidebar-icon" />
              Órdenes de Compra
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/clientes" className="sidebar-link">
              <Users className="sidebar-icon" />
              Clientes
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/equipos" className="sidebar-link">
              <Truck className="sidebar-icon" />
              Equipos
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/facturas" className="sidebar-link">
              <Receipt className="sidebar-icon" />
              Facturas
            </a>
          </div>
          <div className="sidebar-item">
            <a href="/pagos" className="sidebar-link">
              <CreditCard className="sidebar-icon" />
              Pagos
            </a>
          </div>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Dashboard</h1>
                  <p className="page-subtitle">
                    Bienvenido de vuelta, {user?.name || 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-primary is-hidden-desktop"
                  onClick={toggleSidebar}
                >
                  <span className="icon">
                    <i className="fas fa-bars"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="dashboard-stats">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`stat-card ${stat.color}`}>
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <div className="stat-number">{stat.value}</div>
                        <div className="stat-label">{stat.title}</div>
                        <div className={`stat-change ${stat.isPositive ? 'is-positive' : 'is-negative'}`}>
                          {stat.change} vs mes anterior
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large">
                        <IconComponent size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="columns">
          {/* Acciones Rápidas */}
          <div className="column is-4">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  Acciones Rápidas
                </p>
              </div>
              <div className="card-content">
                <div className="buttons has-addons is-vertical is-fullwidth">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <a 
                        key={index} 
                        href={action.href}
                        className={`button ${action.color} is-fullwidth is-medium`}
                      >
                        <span className="icon">
                          <IconComponent size={20} />
                        </span>
                        <span>{action.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="column is-8">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  Actividad Reciente
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="notification is-light mb-3">
                      <div className="level">
                        <div className="level-left">
                          <div className="level-item">
                            <div>
                              <p className="has-text-weight-semibold">{activity.title}</p>
                              <p className="has-text-grey is-size-7">{activity.description}</p>
                              <p className="has-text-grey-light is-size-7">{activity.time}</p>
                            </div>
                          </div>
                        </div>
                        <div className="level-right">
                          <div className="level-item">
                            <span className={`tag is-${activity.status} is-small`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y Métricas */}
        <div className="columns">
          <div className="column is-6">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  Rendimiento Mensual
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="mb-4">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">Presupuestos</span>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">85%</span>
                        </div>
                      </div>
                    </div>
                    <progress className="progress is-primary" value="85" max="100">85%</progress>
                  </div>
                  
                  <div className="mb-4">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">Órdenes Completadas</span>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">92%</span>
                        </div>
                      </div>
                    </div>
                    <progress className="progress is-success" value="92" max="100">92%</progress>
                  </div>
                  
                  <div className="mb-4">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">Facturación</span>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="has-text-weight-semibold">78%</span>
                        </div>
                      </div>
                    </div>
                    <progress className="progress is-warning" value="78" max="100">78%</progress>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="column is-6">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  Próximos Vencimientos
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="notification is-warning is-light mb-3">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="has-text-weight-semibold">Factura FAC-2024-018</p>
                            <p className="has-text-grey is-size-7">Constructora ABC S.A.</p>
                            <p className="has-text-grey-light is-size-7">Vence en 2 días</p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="tag is-warning">$15,800</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification is-info is-light mb-3">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="has-text-weight-semibold">Certificado de Seguro</p>
                            <p className="has-text-grey is-size-7">Equipo ABC123</p>
                            <p className="has-text-grey-light is-size-7">Vence en 5 días</p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="tag is-info">Renovar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification is-success is-light">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="has-text-weight-semibold">Pago Confirmado</p>
                            <p className="has-text-grey is-size-7">Transportes XYZ</p>
                            <p className="has-text-grey-light is-size-7">Recibido hoy</p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <span className="tag is-success">$8,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 