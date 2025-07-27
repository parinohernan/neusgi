import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { clienteService } from '../../services/clienteService';
import type { Cliente } from '../../types';

// Extender el tipo Cliente del backend con campos adicionales para la UI
interface ClienteWithUI extends Cliente {
  estado?: 'activo' | 'inactivo';
  fechaCreacion?: string;
  ultimaActividad?: string;
}

// Estado para los datos reales
const [clientes, setClientes] = useState<Cliente[]>([]);
const [estadisticas, setEstadisticas] = useState({
  total: 0,
  activos: 0,
  inactivos: 0,
  nuevosEsteMes: 0
});
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

export const ClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: notificationError } = useNotifications();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [sortBy, setSortBy] = useState<'nombre' | 'fecha' | 'estado'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar clientes
        const response = await clienteService.getAll();
        setClientes(response.data);
        
        // Cargar estadísticas
        const stats = await clienteService.getEstadisticas();
        setEstadisticas(stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
        setError(errorMessage);
        notificationError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [notificationError]);

  // Filtrar y ordenar clientes
  const filteredClientes = useMemo(() => {
    let filtered = clientes.filter(cliente => {
      const matchesSearch = cliente.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.rutCuit.includes(searchTerm) ||
                           cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Por ahora todos los clientes se consideran activos
      const matchesStatus = statusFilter === 'todos' || statusFilter === 'activo';
      
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'nombre':
          aValue = a.nombreEmpresa;
          bValue = b.nombreEmpresa;
          break;
        case 'fecha':
          // Por ahora usar el ID como fecha de creación
          aValue = a.id.toString();
          bValue = b.id.toString();
          break;
        case 'estado':
          // Por ahora todos son activos
          aValue = 'activo';
          bValue = 'activo';
          break;
        default:
          aValue = a.nombreEmpresa;
          bValue = b.nombreEmpresa;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [clientes, searchTerm, statusFilter, sortBy, sortOrder]);

  // Acciones
  const handleNuevoCliente = () => {
    navigate('/clientes/nuevo');
  };

  const handleVerCliente = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const handleEditarCliente = (id: string) => {
    navigate(`/clientes/${id}/editar`);
  };

  const handleEliminarCliente = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await clienteService.delete(id);
        success('Cliente eliminado exitosamente');
        // Recargar datos
        const response = await clienteService.getAll();
        setClientes(response.data);
      } catch (err) {
        notificationError('Error al eliminar el cliente');
      }
    }
  };

  const handleSort = (field: 'nombre' | 'fecha' | 'estado') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'nombre' | 'fecha' | 'estado') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="main-container">
      {/* Sidebar placeholder */}
      <aside className="sidebar">
        <div className="sidebar-header mb-4">
          <h3 className="title is-4 has-text-primary">NEUSGI</h3>
          <p className="subtitle is-6 has-text-grey">Gestión de Clientes</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Clientes</h1>
                  <p className="page-subtitle">
                    Gestiona todos los clientes del sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-primary"
                  onClick={handleNuevoCliente}
                >
                  <span className="icon">
                    <Plus size={16} />
                  </span>
                  <span>Nuevo Cliente</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="card shadow-hover mb-4">
          <div className="card-content">
            <div className="columns">
              <div className="column is-6">
                <div className="field">
                  <label className="label">
                    <span className="icon-text">
                      <span className="icon">
                        <Search size={16} />
                      </span>
                      <span>Buscar</span>
                    </span>
                  </label>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      placeholder="Buscar por nombre, RUT/CUIT o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="column is-3">
                <div className="field">
                  <label className="label">
                    <span className="icon-text">
                      <span className="icon">
                        <Filter size={16} />
                      </span>
                      <span>Estado</span>
                    </span>
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                      >
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="column is-3">
                <div className="field">
                  <label className="label">Ordenar por</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="nombre">Nombre</option>
                        <option value="fecha">Fecha de creación</option>
                        <option value="estado">Estado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="card shadow-hover">
          <div className="card-header">
            <p className="card-header-title">
              <span className="icon">
                <Users size={20} />
              </span>
              Lista de Clientes ({filteredClientes.length})
            </p>
          </div>
          <div className="card-content">
            {isLoading && (
              <div className="has-text-centered py-6">
                <div className="icon is-large has-text-grey-light">
                  <Users size={64} />
                </div>
                <p className="title is-4 has-text-grey-light mt-4">
                  Cargando clientes...
                </p>
              </div>
            )}

            {error && (
              <div className="notification is-danger">
                <p><strong>Error:</strong> {error}</p>
                <button 
                  className="button is-small"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !error && (
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th 
                      className="is-clickable"
                      onClick={() => handleSort('nombre')}
                    >
                      Empresa {getSortIcon('nombre')}
                    </th>
                    <th>RUT/CUIT</th>
                    <th>Contacto</th>
                    <th>Dirección</th>
                    <th 
                      className="is-clickable"
                      onClick={() => handleSort('estado')}
                    >
                      Estado {getSortIcon('estado')}
                    </th>
                    <th 
                      className="is-clickable"
                      onClick={() => handleSort('fecha')}
                    >
                      Fecha Creación {getSortIcon('fecha')}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <div className="level">
                          <div className="level-left">
                            <div className="level-item">
                              <div>
                                <p className="has-text-weight-semibold">
                                  {cliente.nombreEmpresa}
                                </p>
                                <p className="has-text-grey is-size-7">
                                  ID: {cliente.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="icon-text">
                          <span className="icon">
                            <FileText size={14} />
                          </span>
                          <span>{cliente.rutCuit}</span>
                        </span>
                      </td>
                      <td>
                        <div className="content">
                          {cliente.email && (
                            <div className="icon-text">
                              <span className="icon">
                                <Mail size={12} />
                              </span>
                              <span className="is-size-7">{cliente.email}</span>
                            </div>
                          )}
                          {cliente.telefono && (
                            <div className="icon-text">
                              <span className="icon">
                                <Phone size={12} />
                              </span>
                              <span className="is-size-7">{cliente.telefono}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="icon-text">
                          <span className="icon">
                            <MapPin size={12} />
                          </span>
                          <span className="is-size-7">{cliente.direccion}</span>
                        </div>
                      </td>
                      <td>
                        <span className="tag is-success">
                          Activo
                        </span>
                      </td>
                      <td>
                        <span className="is-size-7">
                          ID: {cliente.id}
                        </span>
                      </td>
                      <td>
                        <div className="buttons are-small">
                          <button
                            className="button is-info is-light"
                            onClick={() => handleVerCliente(cliente.id.toString())}
                            title="Ver detalles"
                          >
                            <span className="icon">
                              <Eye size={12} />
                            </span>
                          </button>
                          <button
                            className="button is-warning is-light"
                            onClick={() => handleEditarCliente(cliente.id.toString())}
                            title="Editar"
                          >
                            <span className="icon">
                              <Edit size={12} />
                            </span>
                          </button>
                          <button
                            className="button is-danger is-light"
                            onClick={() => handleEliminarCliente(cliente.id)}
                            title="Eliminar"
                          >
                            <span className="icon">
                              <Trash2 size={12} />
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mensaje cuando no hay resultados */}
            {filteredClientes.length === 0 && (
              <div className="has-text-centered py-6">
                <div className="icon is-large has-text-grey-light">
                  <Users size={64} />
                </div>
                <p className="title is-4 has-text-grey-light mt-4">
                  No se encontraron clientes
                </p>
                <p className="subtitle is-6 has-text-grey-light">
                  {searchTerm || statusFilter !== 'todos' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay clientes registrados en el sistema'
                  }
                </p>
                {!searchTerm && statusFilter === 'todos' && (
                  <button
                    className="button is-primary mt-4"
                    onClick={handleNuevoCliente}
                  >
                    <span className="icon">
                      <Plus size={16} />
                    </span>
                    <span>Crear primer cliente</span>
                  </button>
                )}
              </div>
            )}
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="columns mt-4">
          <div className="column is-3">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Total Clientes</p>
                        <p className="title">{estadisticas.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-primary">
                        <Users size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-3">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Activos</p>
                        <p className="title has-text-success">
                          {estadisticas.activos}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-success">
                        <Building2 size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-3">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Inactivos</p>
                        <p className="title has-text-danger">
                          {estadisticas.inactivos}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-danger">
                        <Users size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-3">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Este Mes</p>
                        <p className="title has-text-info">
                          {estadisticas.nuevosEsteMes}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-info">
                        <Plus size={32} />
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