import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  DollarSign,
  Calendar,
  Users,
  Truck
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { clienteService } from '../../services/clienteService';
import { equipoService } from '../../services/equipoService';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../stores/authStore';
import type { Presupuesto, Cliente, Equipo } from '../../types';

interface PresupuestoEstadisticas {
  total: number;
  pendientes: number;
  aceptados: number;
  rechazados: number;
  vencidos: number;
  valorTotal: number;
}

export const PresupuestosPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const { isAuthenticated } = useAuth();
  
  // Estados
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [estadisticas, setEstadisticas] = useState<PresupuestoEstadisticas>({
    total: 0,
    pendientes: 0,
    aceptados: 0,
    rechazados: 0,
    vencidos: 0,
    valorTotal: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroCliente, setFiltroCliente] = useState<string>('');
  const [filtroEquipo, setFiltroEquipo] = useState<string>('');

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [presupuestosData, clientesData, equiposData] = await Promise.all([
        presupuestoService.getAll(),
        clienteService.getAll(),
        equipoService.getAll()
      ]);
      
      setPresupuestos(presupuestosData.data || []);
      setClientes(clientesData.data || []);
      setEquipos(equiposData.data || []);
    } catch (err) {
      error('Error al cargar los presupuestos');
      console.error('Error cargando presupuestos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await presupuestoService.getEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
      cargarEstadisticas();
    }
  }, [isAuthenticated]);

  // Filtrar presupuestos
  const presupuestosFiltrados = presupuestos.filter(presupuesto => {
    const cliente = clientes.find(c => c.id === presupuesto.clienteId);
    const equipo = equipos.find(e => e.id === presupuesto.equipoId);
    
    const cumpleBusqueda = !searchTerm || 
      presupuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo?.patente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleEstado = !filtroEstado || presupuesto.estado === filtroEstado;
    const cumpleCliente = !filtroCliente || presupuesto.clienteId.toString() === filtroCliente;
    const cumpleEquipo = !filtroEquipo || (presupuesto.equipoId && presupuesto.equipoId.toString() === filtroEquipo);
    
    return cumpleBusqueda && cumpleEstado && cumpleCliente && cumpleEquipo;
  });

  // Obtener nombre del cliente
  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nombreEmpresa || 'Cliente no encontrado';
  };

  // Obtener patente del equipo
  const getEquipoPatente = (equipoId?: number) => {
    if (!equipoId) return 'Sin equipo';
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo?.patente || 'Equipo no encontrado';
  };

  // Formatear fecha
  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  // Formatear moneda
  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'is-warning';
      case 'aceptado': return 'is-success';
      case 'rechazado': return 'is-danger';
      default: return 'is-light';
    }
  };

  // Obtener texto del estado
  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  // Acciones
  const handleVer = (id: number) => {
    navigate(`/presupuestos/${id}`);
  };

  const handleEditar = (id: number) => {
    navigate(`/presupuestos/${id}/editar`);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await presupuestoService.delete(id);
        success('Presupuesto eliminado exitosamente');
        cargarDatos();
        cargarEstadisticas();
      } catch (err) {
        error('Error al eliminar el presupuesto');
      }
    }
  };

  const handleDescargarPDF = async (id: number) => {
    try {
      await presupuestoService.downloadPdf(id);
      success('PDF descargado exitosamente');
    } catch (err) {
      error('Error al descargar el PDF');
    }
  };

  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar 
        title="NEUSGI" 
        subtitle="Gestión de Presupuestos" 
      />

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Presupuestos</h1>
                  <p className="page-subtitle">
                    Gestiona los presupuestos del sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-primary"
                  onClick={() => navigate('/presupuestos/nuevo')}
                >
                  <span className="icon">
                    <Plus size={16} />
                  </span>
                  <span>Nuevo Presupuesto</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {!isLoadingStats && (
          <div className="columns mb-4">
            <div className="column is-3">
              <div className="card has-background-primary has-text-white">
                <div className="card-content">
                  <div className="level">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="heading has-text-white">Total</p>
                          <p className="title has-text-white">{estadisticas.total}</p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span className="icon has-text-white">
                          <FileText size={24} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-3">
              <div className="card has-background-warning has-text-white">
                <div className="card-content">
                  <div className="level">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="heading has-text-white">Pendientes</p>
                          <p className="title has-text-white">{estadisticas.pendientes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span className="icon has-text-white">
                          <Calendar size={24} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-3">
              <div className="card has-background-success has-text-white">
                <div className="card-content">
                  <div className="level">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="heading has-text-white">Aceptados</p>
                          <p className="title has-text-white">{estadisticas.aceptados}</p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span className="icon has-text-white">
                          <Users size={24} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-3">
              <div className="card has-background-info has-text-white">
                <div className="card-content">
                  <div className="level">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="heading has-text-white">Monto Total</p>
                          <p className="title has-text-white">{formatearMoneda(estadisticas.valorTotal)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span className="icon has-text-white">
                          <DollarSign size={24} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="card mb-4">
          <div className="card-content">
            <div className="columns">
              <div className="column is-4">
                <div className="field">
                  <label className="label">Buscar</label>
                  <div className="control has-icons-left">
                    <input
                      className="input"
                      type="text"
                      placeholder="Buscar por descripción, cliente o equipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="icon is-left">
                      <Search size={16} />
                    </span>
                  </div>
                </div>
              </div>
              <div className="column is-2">
                <div className="field">
                  <label className="label">Estado</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select 
                        value={filtroEstado} 
                        onChange={(e) => setFiltroEstado(e.target.value)}
                      >
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aceptado">Aceptado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column is-3">
                <div className="field">
                  <label className="label">Cliente</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select 
                        value={filtroCliente} 
                        onChange={(e) => setFiltroCliente(e.target.value)}
                      >
                        <option value="">Todos los clientes</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nombreEmpresa}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column is-3">
                <div className="field">
                  <label className="label">Equipo</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select 
                        value={filtroEquipo} 
                        onChange={(e) => setFiltroEquipo(e.target.value)}
                      >
                        <option value="">Todos los equipos</option>
                        {equipos.map(equipo => (
                          <option key={equipo.id} value={equipo.id.toString()}>
                            {equipo.patente} - {equipo.modelo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de presupuestos */}
        <div className="card">
          <div className="card-content">
            {isLoading ? (
              <div className="has-text-centered py-6">
                <div className="icon is-large">
                  <div className="spinner"></div>
                </div>
                <p className="mt-3">Cargando presupuestos...</p>
              </div>
            ) : presupuestosFiltrados.length === 0 ? (
              <div className="has-text-centered py-6">
                <div className="icon is-large has-text-grey-light">
                  <FileText size={48} />
                </div>
                <p className="title is-4 has-text-grey-light mt-3">
                  No se encontraron presupuestos
                </p>
                <p className="subtitle is-6 has-text-grey-light">
                  {searchTerm || filtroEstado || filtroCliente || filtroEquipo 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Crea tu primer presupuesto para comenzar'
                  }
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table is-fullwidth is-striped is-hoverable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Equipo</th>
                      <th>Descripción</th>
                      <th>Costo</th>
                      <th>Válido Hasta</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presupuestosFiltrados.map(presupuesto => (
                      <tr key={presupuesto.id}>
                        <td>
                          <strong>#{presupuesto.id}</strong>
                        </td>
                        <td>
                          <div>
                            <p className="has-text-weight-semibold">
                              {getClienteNombre(presupuesto.clienteId)}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="level is-mobile">
                            <div className="level-left">
                              <div className="level-item">
                                <span className="icon">
                                  <Truck size={16} />
                                </span>
                                <span>{getEquipoPatente(presupuesto.equipoId)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="is-max-width-200">
                            <p className="is-clipped" title={presupuesto.descripcion}>
                              {presupuesto.descripcion}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="has-text-weight-semibold has-text-success">
                            {formatearMoneda(presupuesto.costo)}
                          </span>
                        </td>
                        <td>
                          <span className="has-text-weight-medium">
                            {formatearFecha(presupuesto.validoHasta)}
                          </span>
                        </td>
                        <td>
                          <span className={`tag ${getEstadoColor(presupuesto.estado)}`}>
                            {getEstadoTexto(presupuesto.estado)}
                          </span>
                        </td>
                        <td>
                          <div className="buttons are-small">
                            <button
                              className="button is-info is-light"
                              onClick={() => handleVer(presupuesto.id)}
                              title="Ver detalles"
                            >
                              <span className="icon">
                                <Eye size={14} />
                              </span>
                            </button>
                            <button
                              className="button is-success is-light"
                              onClick={() => handleDescargarPDF(presupuesto.id)}
                              title="Descargar PDF"
                            >
                              <span className="icon">
                                <Download size={14} />
                              </span>
                            </button>
                            <button
                              className="button is-warning is-light"
                              onClick={() => handleEditar(presupuesto.id)}
                              title="Editar"
                            >
                              <span className="icon">
                                <Edit size={14} />
                              </span>
                            </button>
                            <button
                              className="button is-danger is-light"
                              onClick={() => handleEliminar(presupuesto.id)}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 