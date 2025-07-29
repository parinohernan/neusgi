import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  Truck, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Info
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Presupuesto } from '../../types';

export const DetallePresupuestoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      cargarPresupuesto(parseInt(id));
    }
  }, [id]);

  const cargarPresupuesto = async (presupuestoId: number) => {
    try {
      setIsLoading(true);
      const data = await presupuestoService.getById(presupuestoId);
      setPresupuesto(data);
    } catch (err) {
      error('Error al cargar el presupuesto');
      console.error('Error cargando presupuesto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!presupuesto) return;
    
    try {
      setIsGeneratingPDF(true);
      await presupuestoService.downloadPdf(presupuesto.id);
      success('PDF descargado exitosamente');
    } catch (err) {
      error('Error al descargar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleEditar = () => {
    navigate(`/presupuestos/${presupuesto?.id}/editar`);
  };

  const handleEliminar = async () => {
    if (!presupuesto) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await presupuestoService.delete(presupuesto.id);
        success('Presupuesto eliminado exitosamente');
        navigate('/presupuestos');
      } catch (err) {
        error('Error al eliminar el presupuesto');
      }
    }
  };

  const handleCambiarEstado = async (nuevoEstado: 'pendiente' | 'aceptado' | 'rechazado') => {
    if (!presupuesto) return;
    
    try {
      await presupuestoService.cambiarEstado(presupuesto.id, nuevoEstado);
      success(`Estado cambiado a ${getEstadoTexto(nuevoEstado)}`);
      cargarPresupuesto(presupuesto.id);
    } catch (err) {
      error('Error al cambiar el estado');
    }
  };

  // Funciones auxiliares
  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'is-warning';
      case 'aceptado': return 'is-success';
      case 'rechazado': return 'is-danger';
      default: return 'is-light';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock size={16} />;
      case 'aceptado': return <CheckCircle size={16} />;
      case 'rechazado': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="main-container">
        <Sidebar title="NEUSGI" subtitle="Detalle Presupuesto" />
        <main className="content-area">
          <div className="has-text-centered py-6">
            <div className="spinner"></div>
            <p className="mt-3">Cargando presupuesto...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="main-container">
        <Sidebar title="NEUSGI" subtitle="Detalle Presupuesto" />
        <main className="content-area">
          <div className="has-text-centered py-6">
            <div className="icon is-large has-text-grey-light">
              <FileText size={48} />
            </div>
            <p className="title is-4 has-text-grey-light mt-3">
              Presupuesto no encontrado
            </p>
            <button 
              className="button is-primary mt-4"
              onClick={() => navigate('/presupuestos')}
            >
              Volver a Presupuestos
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar 
        title="NEUSGI" 
        subtitle="Detalle Presupuesto" 
      />

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Presupuesto #{presupuesto.id}</h1>
                  <p className="page-subtitle">
                    Detalles del presupuesto
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <div className="buttons">
                  <button 
                    className="button is-outlined"
                    onClick={() => navigate('/presupuestos')}
                  >
                    <span className="icon">
                      <ArrowLeft size={16} />
                    </span>
                    <span>Volver</span>
                  </button>
                  <button 
                    className="button is-info is-light"
                    onClick={handleDescargarPDF}
                    disabled={isGeneratingPDF}
                  >
                    <span className="icon">
                      <Download size={16} />
                    </span>
                    <span>{isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}</span>
                  </button>
                  <button 
                    className="button is-success is-light"
                    onClick={handleImprimir}
                  >
                    <span className="icon">
                      <Printer size={16} />
                    </span>
                    <span>Imprimir</span>
                  </button>
                  <button 
                    className="button is-warning is-light"
                    onClick={handleEditar}
                  >
                    <span className="icon">
                      <Edit size={16} />
                    </span>
                    <span>Editar</span>
                  </button>
                  <button 
                    className="button is-danger is-light"
                    onClick={handleEliminar}
                  >
                    <span className="icon">
                      <Trash2 size={16} />
                    </span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del presupuesto */}
        <div className="columns">
          <div className="column is-8">
            {/* Información principal */}
            <div className="card mb-4">
              <div className="card-header">
                <p className="card-header-title">
                  <span className="icon">
                    <FileText size={20} />
                  </span>
                  Información del Presupuesto
                </p>
              </div>
              <div className="card-content">
                <div className="columns">
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Estado</label>
                      <div className="control">
                        <span className={`tag is-medium ${getEstadoColor(presupuesto.estado)}`}>
                          <span className="icon">
                            {getEstadoIcono(presupuesto.estado)}
                          </span>
                          <span>{getEstadoTexto(presupuesto.estado)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Costo Total</label>
                      <div className="control">
                        <p className="title is-4 has-text-success">
                          {formatearMoneda(presupuesto.costo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Descripción del Servicio</label>
                  <div className="control">
                    <div className="box has-background-light">
                      <p className="has-text-justified">{presupuesto.descripcion}</p>
                    </div>
                  </div>
                </div>

                <div className="columns">
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Fecha de Creación</label>
                      <div className="control">
                        <p className="has-text-weight-medium">
                          {formatearFecha(presupuesto.creadoEn)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Válido Hasta</label>
                      <div className="control">
                        <p className="has-text-weight-medium">
                          {formatearFecha(presupuesto.validoHasta)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            {presupuesto.cliente && (
              <div className="card mb-4">
                <div className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <Users size={20} />
                    </span>
                    Información del Cliente
                  </p>
                </div>
                <div className="card-content">
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Empresa</label>
                        <div className="control">
                          <p className="has-text-weight-semibold">{presupuesto.cliente.nombreEmpresa}</p>
                        </div>
                      </div>
                    </div>
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">RUT/CUIT</label>
                        <div className="control">
                          <p className="has-text-weight-medium">{presupuesto.cliente.rutCuit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {presupuesto.cliente.telefono && (
                    <div className="field">
                      <label className="label">Teléfono</label>
                      <div className="control">
                        <p>{presupuesto.cliente.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {presupuesto.cliente.email && (
                    <div className="field">
                      <label className="label">Email</label>
                      <div className="control">
                        <p>{presupuesto.cliente.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {presupuesto.cliente.direccion && (
                    <div className="field">
                      <label className="label">Dirección</label>
                      <div className="control">
                        <p>{presupuesto.cliente.direccion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del equipo */}
            {presupuesto.equipo && (
              <div className="card mb-4">
                <div className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <Truck size={20} />
                    </span>
                    Información del Equipo
                  </p>
                </div>
                <div className="card-content">
                  <div className="columns">
                    <div className="column is-4">
                      <div className="field">
                        <label className="label">Patente</label>
                        <div className="control">
                          <p className="has-text-weight-semibold">{presupuesto.equipo.patente}</p>
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="field">
                        <label className="label">Modelo</label>
                        <div className="control">
                          <p className="has-text-weight-medium">{presupuesto.equipo.modelo}</p>
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="field">
                        <label className="label">Capacidad</label>
                        <div className="control">
                          <p className="has-text-weight-medium">{presupuesto.equipo.capacidadKg} kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field">
                    <label className="label">Estado del Equipo</label>
                    <div className="control">
                      <span className={`tag ${presupuesto.equipo.estado === 'disponible' ? 'is-success' : 'is-warning'}`}>
                        {presupuesto.equipo.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="column is-4">
            {/* Acciones de estado */}
            <div className="card mb-4">
              <div className="card-header">
                <p className="card-header-title">
                  <span className="icon">
                    <CheckCircle size={16} />
                  </span>
                  Cambiar Estado
                </p>
              </div>
              <div className="card-content">
                <div className="buttons are-small is-fullwidth">
                  <button
                    className={`button is-fullwidth ${presupuesto.estado === 'pendiente' ? 'is-warning' : 'is-light'}`}
                    onClick={() => handleCambiarEstado('pendiente')}
                    disabled={presupuesto.estado === 'pendiente'}
                  >
                    <span className="icon">
                      <Clock size={14} />
                    </span>
                    <span>Pendiente</span>
                  </button>
                  <button
                    className={`button is-fullwidth ${presupuesto.estado === 'aceptado' ? 'is-success' : 'is-light'}`}
                    onClick={() => handleCambiarEstado('aceptado')}
                    disabled={presupuesto.estado === 'aceptado'}
                  >
                    <span className="icon">
                      <CheckCircle size={14} />
                    </span>
                    <span>Aceptado</span>
                  </button>
                  <button
                    className={`button is-fullwidth ${presupuesto.estado === 'rechazado' ? 'is-danger' : 'is-light'}`}
                    onClick={() => handleCambiarEstado('rechazado')}
                    disabled={presupuesto.estado === 'rechazado'}
                  >
                    <span className="icon">
                      <XCircle size={14} />
                    </span>
                    <span>Rechazado</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="card">
              <div className="card-header">
                <p className="card-header-title">
                  <span className="icon">
                    <Info size={16} />
                  </span>
                  Información Adicional
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="field">
                    <label className="label is-small">ID del Presupuesto</label>
                    <p className="has-text-weight-semibold">#{presupuesto.id}</p>
                  </div>
                  
                  <div className="field">
                    <label className="label is-small">Creado por</label>
                    <p className="has-text-weight-medium">
                      {presupuesto.usuario?.nombre || 'Usuario no disponible'}
                    </p>
                  </div>
                  
                  <div className="field">
                    <label className="label is-small">Rol del Usuario</label>
                    <p className="has-text-weight-medium">
                      {presupuesto.usuario?.rol || 'No disponible'}
                    </p>
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