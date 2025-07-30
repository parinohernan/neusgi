import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Eye, 
  Edit, 
  Trash2, 
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  CalendarDays
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { useAuth } from '../../stores/authStore';
import { equipoService } from '../../services/equipoService';
import type { Equipo } from '../../types';
import type { EquipoEstadisticas } from '../../services/equipoService';
import { Sidebar } from '../../components/layout';

export const EquiposPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: notificationError } = useNotifications();
  const { isAuthenticated } = useAuth();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio'>('todos');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'camion' | 'excavadora' | 'retroexcavadora' | 'pala_cargadora' | 'compactador' | 'otro'>('todos');
  const [sortBy, setSortBy] = useState<'patente' | 'modelo' | 'estado' | 'tipo'>('patente');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estado para los datos reales
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EquipoEstadisticas>({
    total: 0,
    disponibles: 0,
    enMantenimiento: 0,
    ocupados: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar equipos
        const response = await equipoService.getAll();
        setEquipos(response.data);
        
        // Cargar estadísticas
        const stats = await equipoService.getEstadisticas();
        setEstadisticas(stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
        setError(errorMessage);
        notificationError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      cargarDatos();
    }
  }, [isAuthenticated]); // Se ejecuta cuando cambia la autenticación

  // Filtrar y ordenar equipos
  const filteredEquipos = useMemo(() => {
    let filtered = equipos.filter(equipo => {
      const matchesSearch = equipo.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = estadoFilter === 'todos' || equipo.estado === estadoFilter;
      const matchesTipo = tipoFilter === 'todos' || equipo.tipo === tipoFilter;
      
      return matchesSearch && matchesEstado && matchesTipo;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'patente':
          aValue = a.patente;
          bValue = b.patente;
          break;
        case 'modelo':
          aValue = a.modelo;
          bValue = b.modelo;
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'tipo':
          aValue = a.tipo;
          bValue = b.tipo;
          break;
        default:
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [equipos, searchTerm, estadoFilter, tipoFilter, sortBy, sortOrder]);

  // Acciones
  const handleNuevoEquipo = () => {
    navigate('/equipos/nuevo');
  };

  const handleVerEquipo = (id: number) => {
    navigate(`/equipos/${id}`);
  };

  const handleEditarEquipo = (id: number) => {
    navigate(`/equipos/${id}/editar`);
  };

  // Función para recargar datos
  const recargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar equipos
      const response = await equipoService.getAll();
      setEquipos(response.data);
      
      // Cargar estadísticas
      const stats = await equipoService.getEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(errorMessage);
      notificationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarEquipo = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      try {
        await equipoService.delete(id);
        success('Equipo eliminado exitosamente');
        await recargarDatos();
      } catch (err) {
        notificationError('Error al eliminar el equipo');
      }
    }
  };

  const handleSort = (field: 'patente' | 'modelo' | 'estado' | 'tipo') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'patente' | 'modelo' | 'estado' | 'tipo') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <CheckCircle size={16} className="has-text-success" />;
      case 'en_uso':
        return <Clock size={16} className="has-text-warning" />;
      case 'mantenimiento':
        return <Wrench size={16} className="has-text-info" />;
      case 'fuera_servicio':
        return <AlertTriangle size={16} className="has-text-danger" />;
      default:
        return <Truck size={16} />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <span className="tag is-success is-light">Disponible</span>;
      case 'en_uso':
        return <span className="tag is-warning is-light">En Uso</span>;
      case 'mantenimiento':
        return <span className="tag is-info is-light">Mantenimiento</span>;
      case 'fuera_servicio':
        return <span className="tag is-danger is-light">Fuera de Servicio</span>;
      default:
        return <span className="tag is-light">{estado}</span>;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'camion':
        return 'Camión';
      case 'excavadora':
        return 'Excavadora';
      case 'retroexcavadora':
        return 'Retroexcavadora';
      case 'pala_cargadora':
        return 'Pala Cargadora';
      case 'compactador':
        return 'Compactador';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar 
        title="NEUSGI" 
        subtitle="Gestión de Equipos" 
      />

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Equipos</h1>
                  <p className="page-subtitle">
                    Gestiona todos los equipos del sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-outlined mr-2"
                  onClick={recargarDatos}
                  disabled={isLoading}
                  title="Recargar datos"
                >
                  <span className="icon">
                    <Truck size={16} />
                  </span>
                  <span>{isLoading ? 'Cargando...' : 'Recargar'}</span>
                </button>
                <button 
                  className="button is-primary"
                  onClick={handleNuevoEquipo}
                >
                  <span className="icon">
                    <Plus size={16} />
                  </span>
                  <span>Nuevo Equipo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="card shadow-hover mb-4">
          <div className="card-content">
            <div className="columns">
              <div className="column is-4">
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
                      placeholder="Buscar por patente o modelo..."
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
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value as any)}
                      >
                        <option value="todos">Todos</option>
                        <option value="disponible">Disponible</option>
                        <option value="en_uso">En Uso</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="fuera_servicio">Fuera de Servicio</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column is-3">
                <div className="field">
                  <label className="label">
                    <span className="icon-text">
                      <span className="icon">
                        <Truck size={16} />
                      </span>
                      <span>Tipo</span>
                    </span>
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={tipoFilter}
                        onChange={(e) => setTipoFilter(e.target.value as any)}
                      >
                        <option value="todos">Todos</option>
                        <option value="camion">Camión</option>
                        <option value="excavadora">Excavadora</option>
                        <option value="retroexcavadora">Retroexcavadora</option>
                        <option value="pala_cargadora">Pala Cargadora</option>
                        <option value="compactador">Compactador</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="columns mb-4">
          <div className="column is-2">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Total Equipos</p>
                        <p className="title">{estadisticas.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-primary">
                        <Truck size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-2">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Disponibles</p>
                        <p className="title has-text-success">
                          {estadisticas.disponibles}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-success">
                        <CheckCircle size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-2">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Ocupados</p>
                        <p className="title has-text-warning">
                          {estadisticas.ocupados}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-warning">
                        <Clock size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="column is-2">
            <div className="card shadow-hover">
              <div className="card-content">
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      <div>
                        <p className="heading">Mantenimiento</p>
                        <p className="title has-text-info">
                          {estadisticas.enMantenimiento}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      <div className="icon is-large has-text-info">
                        <Wrench size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="notification is-danger">
            <p><strong>Error:</strong> {error}</p>
            <button 
              className="button is-small"
              onClick={recargarDatos}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Reintentar'}
            </button>
          </div>
        )}

        {/* Tabla de equipos */}
        {!isLoading && !error && (
          <div className="card shadow-hover">
            <div className="card-content">
              <div className="table-container">
                <table className="table is-fullwidth is-striped is-hoverable">
                  <thead>
                    <tr>
                      <th>
                        <button 
                          className="button is-small is-text"
                          onClick={() => handleSort('patente')}
                        >
                          <span className="icon-text">
                            <span>Patente</span>
                            <span className="icon">
                              {getSortIcon('patente')}
                            </span>
                          </span>
                        </button>
                      </th>
                      <th>
                        <button 
                          className="button is-small is-text"
                          onClick={() => handleSort('modelo')}
                        >
                          <span className="icon-text">
                            <span>Modelo</span>
                            <span className="icon">
                              {getSortIcon('modelo')}
                            </span>
                          </span>
                        </button>
                      </th>
                      <th>Capacidad</th>
                      <th>
                        <button 
                          className="button is-small is-text"
                          onClick={() => handleSort('tipo')}
                        >
                          <span className="icon-text">
                            <span>Tipo</span>
                            <span className="icon">
                              {getSortIcon('tipo')}
                            </span>
                          </span>
                        </button>
                      </th>
                      <th>
                        <button 
                          className="button is-small is-text"
                          onClick={() => handleSort('estado')}
                        >
                          <span className="icon-text">
                            <span>Estado</span>
                            <span className="icon">
                              {getSortIcon('estado')}
                            </span>
                          </span>
                        </button>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipos.map((equipo) => (
                      <tr key={equipo.id}>
                        <td>
                          <div className="level">
                            <div className="level-left">
                              <div className="level-item">
                                <div>
                                  <strong>{equipo.patente}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{equipo.modelo}</td>
                        <td>{equipo.capacidadKg.toLocaleString()} kg</td>
                        <td>{getTipoLabel(equipo.tipo)}</td>
                        <td>
                          <div className="level">
                            <div className="level-left">
                              <div className="level-item">
                                {getEstadoBadge(equipo.estado)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="buttons are-small">
                            <button 
                              className="button is-info is-light"
                              onClick={() => handleVerEquipo(equipo.id)}
                              title="Ver detalles"
                            >
                              <span className="icon">
                                <Eye size={14} />
                              </span>
                            </button>
                            <button 
                              className="button is-warning is-light"
                              onClick={() => handleEditarEquipo(equipo.id)}
                              title="Editar"
                            >
                              <span className="icon">
                                <Edit size={14} />
                              </span>
                            </button>
                            <button 
                              className="button is-danger is-light"
                              onClick={() => handleEliminarEquipo(equipo.id)}
                              title="Eliminar"
                            >
                              <span className="icon">
                                <Trash2 size={14} />
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
              {filteredEquipos.length === 0 && (
                <div className="has-text-centered py-6">
                  <div className="icon is-large has-text-grey-light">
                    <Truck size={64} />
                  </div>
                  <p className="title is-4 has-text-grey-light mt-4">
                    No se encontraron equipos
                  </p>
                  <p className="subtitle is-6 has-text-grey-light">
                    {searchTerm || estadoFilter !== 'todos' || tipoFilter !== 'todos' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay equipos registrados en el sistema'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="has-text-centered py-6">
            <div className="icon is-large">
              <div className="fa fa-spinner fa-spin"></div>
            </div>
            <p className="title is-4 has-text-grey-light mt-4">
              Cargando equipos...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}; 