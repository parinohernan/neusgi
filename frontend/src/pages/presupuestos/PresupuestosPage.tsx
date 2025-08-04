import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Play, 
  FileText, 
  Calendar
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { NuevoParteDiarioModal } from '../../components/forms/NuevoParteDiarioModal';
import { NuevoRemitoModal } from '../../components/forms/NuevoRemitoModal';
import { presupuestoService } from '../../services/presupuestoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Presupuesto } from '../../types';

export const PresupuestosPage: React.FC = () => {
  const { success, error } = useNotifications();
  
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [showParteDiarioModal, setShowParteDiarioModal] = useState(false);
  const [showRemitoModal, setShowRemitoModal] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  const cargarPresupuestos = async () => {
    try {
      setLoading(true);
      const data = await presupuestoService.getAll();
      setPresupuestos(data.data || data);
    } catch (err) {
      error('Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (presupuesto: Presupuesto, action: string) => {
    try {
      switch (action) {
        case 'aceptar':
          await presupuestoService.cambiarEstado(presupuesto.id, 'aceptado');
          success('Presupuesto aceptado exitosamente');
          break;
        case 'iniciar-actividad':
          await presupuestoService.iniciarActividad(presupuesto.id);
          success('Actividad iniciada exitosamente');
          break;
        case 'agregar-parte-diario':
          setSelectedPresupuesto(presupuesto);
          setShowParteDiarioModal(true);
          return; // No recargar aquí
        case 'agregar-remito':
          setSelectedPresupuesto(presupuesto);
          setShowRemitoModal(true);
          return; // No recargar aquí
        default:
          return;
      }
      cargarPresupuestos(); // Recargar solo para acciones que cambian el estado
    } catch (err) {
      error('Error al ejecutar la acción');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'is-warning';
      case 'aceptado':
        return 'is-success';
      case 'rechazado':
        return 'is-danger';
      case 'activo':
        return 'is-primary';
      case 'concluido':
        return 'is-info';
      case 'finalizado':
        return 'is-dark';
      default:
        return 'is-light';
    }
  };

  const getAccionesDisponibles = (presupuesto: Presupuesto) => {
    const acciones = [
      {
        label: 'Descargar PDF',
        action: 'download-pdf',
        icon: Download,
        always: true
      },
      {
        label: 'Ver Detalles',
        action: 'view-details',
        icon: Eye,
        always: true
      },
      {
        label: 'Ver Documentos',
        action: 'view-documents',
        icon: FileText,
        always: true
      }
    ];

    // Acciones específicas por estado
    switch (presupuesto.estado) {
      case 'pendiente':
        acciones.push({
          label: 'Aceptar',
          action: 'aceptar',
          icon: Edit,
          always: false
        });
        break;
      case 'aceptado':
        acciones.push(
          {
            label: 'Agregar OC',
            action: 'agregar-oc',
            icon: FileText,
            always: false
          },
          {
            label: 'Iniciar Actividad',
            action: 'iniciar-actividad',
            icon: Play,
            always: false
          }
        );
        break;
      case 'activo':
        acciones.push(
          {
            label: 'Agregar Remito',
            action: 'agregar-remito',
            icon: FileText,
            always: false
          },
          {
            label: 'Agregar Parte Diario',
            action: 'agregar-parte-diario',
            icon: Calendar,
            always: false
          }
        );
        break;
    }

    return acciones;
  };

  const filteredPresupuestos = presupuestos.filter(presupuesto => {
    const matchesSearch = presupuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         presupuesto.cliente?.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !estadoFilter || presupuesto.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  if (loading) {
    return (
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <div className="has-text-centered">
            <div className="loading-spinner"></div>
            <p className="mt-3">Cargando presupuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="page-title">Presupuestos</h1>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link
                  to="/presupuestos/nuevo"
                  className="button is-primary"
                >
                  <span className="icon">
                    <Plus size={20} />
                  </span>
                  <span>Nuevo Presupuesto</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-5">
          <div className="card-content">
            <div className="columns">
              <div className="column is-8">
                <div className="field has-addons">
                  <div className="control has-icons-left is-expanded">
                    <input
                      type="text"
                      className="input"
                      placeholder="Buscar presupuestos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="icon is-left">
                      <Search size={20} />
                    </span>
                  </div>
                </div>
              </div>
              <div className="column is-4">
                <div className="field">
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                      >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aceptado">Aceptado</option>
                        <option value="rechazado">Rechazado</option>
                        <option value="activo">Activo</option>
                        <option value="concluido">Concluido</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Presupuestos */}
        <div className="columns is-multiline">
          {filteredPresupuestos.length === 0 ? (
            <div className="column is-12">
              <div className="has-text-centered py-6">
                <h3 className="title is-4">No se encontraron presupuestos</h3>
                <p className="subtitle is-6 has-text-grey">
                  {searchTerm || estadoFilter 
                    ? 'Intenta ajustar los filtros de búsqueda.' 
                    : 'Aún no hay presupuestos creados.'}
                </p>
              </div>
            </div>
          ) : (
            filteredPresupuestos.map((presupuesto) => {
              const acciones = getAccionesDisponibles(presupuesto);
              
              return (
                <div key={presupuesto.id} className="column is-12">
                  <div className="card shadow-hover presupuesto-card">
                    <div className="card-content">
                      <div className="level">
                        <div className="level-left">
                          <div className="level-item">
                            <div>
                              <div className="level mb-2">
                                <div className="level-left">
                                  <div className="level-item">
                                    <h3 className="title is-4">
                                      Presupuesto #{presupuesto.id}
                                    </h3>
                                  </div>
                                  <div className="level-item ml-3">
                                    <span className={`tag ${getEstadoColor(presupuesto.estado)}`}>
                                      {presupuesto.estado}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="subtitle is-6 has-text-grey mb-3">{presupuesto.descripcion}</p>
                              <div className="columns is-mobile">
                                <div className="column">
                                  <p className="has-text-grey-light is-size-7">Cliente</p>
                                  <p className="has-text-weight-medium">{presupuesto.cliente?.nombreEmpresa}</p>
                                </div>
                                <div className="column">
                                  <p className="has-text-grey-light is-size-7">Costo</p>
                                  <p className="has-text-weight-medium">${presupuesto.costo.toLocaleString()}</p>
                                </div>
                                <div className="column">
                                  <p className="has-text-grey-light is-size-7">Válido hasta</p>
                                  <p className="has-text-weight-medium">
                                    {new Date(presupuesto.validoHasta).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="buttons mt-4">
                        {acciones.map((accion) => {
                          const IconComponent = accion.icon;
                          
                          if (accion.action === 'view-details') {
                            return (
                              <Link
                                key={accion.action}
                                to={`/presupuestos/${presupuesto.id}`}
                                className="button is-small is-info"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </Link>
                            );
                          }

                          if (accion.action === 'view-documents') {
                            return (
                              <Link
                                key={accion.action}
                                to={`/presupuestos/${presupuesto.id}/documentos`}
                                className="button is-small is-primary"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </Link>
                            );
                          }

                          if (accion.action === 'download-pdf') {
                            return (
                              <button
                                key={accion.action}
                                onClick={() => presupuestoService.downloadPdf(presupuesto.id)}
                                className="button is-small is-success"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </button>
                            );
                          }

                          // Botones de acción específicos por estado
                          if (accion.action === 'aceptar') {
                            return (
                              <button
                                key={accion.action}
                                onClick={() => handleAction(presupuesto, accion.action)}
                                className="button is-small is-success"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </button>
                            );
                          }

                          if (accion.action === 'iniciar-actividad') {
                            return (
                              <button
                                key={accion.action}
                                onClick={() => handleAction(presupuesto, accion.action)}
                                className="button is-small is-warning"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </button>
                            );
                          }

                          if (accion.action === 'agregar-parte-diario') {
                            return (
                              <button
                                key={accion.action}
                                onClick={() => handleAction(presupuesto, accion.action)}
                                className="button is-small is-info"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </button>
                            );
                          }

                          if (accion.action === 'agregar-remito') {
                            return (
                              <button
                                key={accion.action}
                                onClick={() => handleAction(presupuesto, accion.action)}
                                className="button is-small is-warning"
                              >
                                <span className="icon is-small">
                                  <IconComponent size={16} />
                                </span>
                                <span>{accion.label}</span>
                              </button>
                            );
                          }

                          // Botones genéricos
                          return (
                            <button
                              key={accion.action}
                              onClick={() => handleAction(presupuesto, accion.action)}
                              className="button is-small is-primary"
                            >
                              <span className="icon is-small">
                                <IconComponent size={16} />
                              </span>
                              <span>{accion.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Parte Diario */}
      <NuevoParteDiarioModal
        isOpen={showParteDiarioModal}
        onClose={() => {
          setShowParteDiarioModal(false);
          setSelectedPresupuesto(null);
        }}
        presupuesto={selectedPresupuesto}
        onSuccess={cargarPresupuestos}
      />

      {/* Modal de Remito */}
      <NuevoRemitoModal
        isOpen={showRemitoModal}
        onClose={() => {
          setShowRemitoModal(false);
          setSelectedPresupuesto(null);
        }}
        presupuesto={selectedPresupuesto}
        onSuccess={cargarPresupuestos}
      />
    </div>
  );
}; 