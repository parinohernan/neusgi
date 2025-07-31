import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Package, 
  Users, 
  Truck, 
  Receipt, 
  CreditCard,
  Calendar,
  MapPin,
  Settings,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../stores/authStore';

interface SidebarProps {
  title?: string;
  subtitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  title = "NEUSGI", 
  subtitle = "Panel de Control" 
}) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      active: location.pathname === '/dashboard'
    },
    { 
      path: '/presupuestos', 
      label: 'Presupuestos', 
      icon: FileText,
      active: location.pathname.startsWith('/presupuestos')
    },
    { 
      path: '/ordenes-compra', 
      label: 'Órdenes de Compra', 
      icon: Package,
      active: location.pathname.startsWith('/ordenes-compra')
    },
    { 
      path: '/clientes', 
      label: 'Clientes', 
      icon: Users,
      active: location.pathname.startsWith('/clientes')
    },
    { 
      path: '/equipos', 
      label: 'Equipos', 
      icon: Truck,
      active: location.pathname.startsWith('/equipos')
    },
    { 
      path: '/empleados', 
      label: 'Empleados', 
      icon: UserCheck,
      active: location.pathname.startsWith('/empleados')
    },
    { 
      path: '/partes-diario', 
      label: 'Partes Diarios', 
      icon: Calendar,
      active: location.pathname.startsWith('/partes-diario')
    },
    { 
      path: '/facturas', 
      label: 'Facturas', 
      icon: Receipt,
      active: location.pathname.startsWith('/facturas')
    },
    { 
      path: '/pagos', 
      label: 'Pagos', 
      icon: CreditCard,
      active: location.pathname.startsWith('/pagos')
    },
    { 
      path: '/remitos', 
      label: 'Remitos', 
      icon: MapPin,
      active: location.pathname.startsWith('/remitos')
    },
    { 
      path: '/configuracion', 
      label: 'Configuración', 
      icon: Settings,
      active: location.pathname.startsWith('/configuracion')
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header mb-4">
        <h3 className="title is-4 has-text-primary">{title}</h3>
        <p className="subtitle is-6 has-text-grey">{subtitle}</p>
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.path} className="sidebar-item">
              <Link 
                to={item.path} 
                className={`sidebar-link ${item.active ? 'is-active' : ''}`}
              >
                <IconComponent className="sidebar-icon" />
                {item.label}
              </Link>
            </div>
          );
        })}
        
        {/* Separador */}
        <div className="sidebar-separator"></div>
        
        {/* Botón de logout */}
        <div className="sidebar-item">
          <button 
            onClick={logout}
            className="sidebar-link sidebar-logout"
          >
            <LogOut className="sidebar-icon" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </aside>
  );
}; 