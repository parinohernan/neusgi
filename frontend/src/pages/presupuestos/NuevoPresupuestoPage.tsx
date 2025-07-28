import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Save, 
  X, 
  FileText, 
  Users, 
  Truck, 
  DollarSign, 
  Calendar,
  Info
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { clienteService } from '../../services/clienteService';
import { equipoService } from '../../services/equipoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Cliente, Equipo } from '../../types';

// Schema de validación para presupuesto
const presupuestoSchema = z.object({
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
  equipoId: z.number().min(1, 'Debe seleccionar un equipo'),
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  costo: z.number()
    .min(1, 'El costo debe ser mayor a 0')
    .max(10000000, 'El costo no puede exceder $10,000,000'),
  validoHasta: z.string()
    .min(1, 'Debe seleccionar una fecha de validez'),
});

type PresupuestoFormData = z.infer<typeof presupuestoSchema>;

export const NuevoPresupuestoPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    mode: 'onChange',
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoadingData(true);
        const [clientesData, equiposData] = await Promise.all([
          clienteService.getAll(),
          equipoService.getAll()
        ]);
        
        setClientes(clientesData.data || []);
        setEquipos(equiposData.data || []);
      } catch (err) {
        error('Error al cargar los datos');
        console.error('Error cargando datos:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    cargarDatos();
  }, [error]);

  const onSubmit = async (data: PresupuestoFormData) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const presupuestoData = {
        clienteId: data.clienteId,
        equipoId: data.equipoId,
        descripcion: data.descripcion,
        costo: data.costo,
        validoHasta: new Date(data.validoHasta),
        estado: 'pendiente' as const,
      };

      // Llamar a la API
      const nuevoPresupuesto = await presupuestoService.create(presupuestoData);
      
      success(`Presupuesto #${nuevoPresupuesto.id} creado exitosamente`);
      navigate('/presupuestos');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el presupuesto';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/presupuestos');
  };

  const handleReset = () => {
    reset();
  };

  // Obtener cliente seleccionado
  const clienteSeleccionado = watch('clienteId');
  const cliente = clientes.find(c => c.id === clienteSeleccionado);

  // Obtener equipo seleccionado
  const equipoSeleccionado = watch('equipoId');
  const equipo = equipos.find(e => e.id === equipoSeleccionado);

  // Formatear moneda
  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  // Fecha mínima (hoy)
  const fechaMinima = new Date().toISOString().split('T')[0];

  if (isLoadingData) {
    return (
      <div className="main-container">
        <Sidebar title="NEUSGI" subtitle="Nuevo Presupuesto" />
        <main className="content-area">
          <div className="has-text-centered py-6">
            <div className="spinner"></div>
            <p className="mt-3">Cargando datos...</p>
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
        subtitle="Nuevo Presupuesto" 
      />

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Nuevo Presupuesto</h1>
                  <p className="page-subtitle">
                    Crea un nuevo presupuesto para un cliente
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-outlined"
                  onClick={handleCancel}
                >
                  <span className="icon">
                    <ArrowLeft size={16} />
                  </span>
                  <span>Volver</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="columns">
          <div className="column is-8">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  <span className="icon">
                    <FileText size={20} />
                  </span>
                  Información del Presupuesto
                </p>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Cliente y Equipo */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Users size={16} />
                            </span>
                            <span>Cliente *</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className={`select is-fullwidth ${errors.clienteId ? 'is-danger' : ''}`}>
                            <select {...register('clienteId', { valueAsNumber: true })}>
                              <option value="">Seleccionar cliente</option>
                              {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                  {cliente.nombreEmpresa}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {errors.clienteId && (
                          <p className="help is-danger">{errors.clienteId.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Truck size={16} />
                            </span>
                            <span>Equipo *</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className={`select is-fullwidth ${errors.equipoId ? 'is-danger' : ''}`}>
                            <select {...register('equipoId', { valueAsNumber: true })}>
                              <option value="">Seleccionar equipo</option>
                              {equipos
                                .filter(equipo => equipo.estado === 'disponible')
                                .map(equipo => (
                                  <option key={equipo.id} value={equipo.id}>
                                    {equipo.patente} - {equipo.modelo} ({equipo.capacidadKg}kg)
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                        {errors.equipoId && (
                          <p className="help is-danger">{errors.equipoId.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <FileText size={16} />
                        </span>
                        <span>Descripción del Servicio *</span>
                      </span>
                    </label>
                    <div className="control">
                      <textarea
                        {...register('descripcion')}
                        className={`textarea ${errors.descripcion ? 'is-danger' : ''}`}
                        placeholder="Describe detalladamente el servicio a realizar, incluyendo origen, destino, fechas, condiciones especiales..."
                        rows={6}
                      />
                    </div>
                    {errors.descripcion && (
                      <p className="help is-danger">{errors.descripcion.message}</p>
                    )}
                  </div>

                  {/* Costo y Validez */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <DollarSign size={16} />
                            </span>
                            <span>Costo Total *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('costo', { valueAsNumber: true })}
                            type="number"
                            className={`input ${errors.costo ? 'is-danger' : ''}`}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {errors.costo && (
                          <p className="help is-danger">{errors.costo.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Calendar size={16} />
                            </span>
                            <span>Válido Hasta *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('validoHasta')}
                            type="date"
                            className={`input ${errors.validoHasta ? 'is-danger' : ''}`}
                            min={fechaMinima}
                          />
                        </div>
                        {errors.validoHasta && (
                          <p className="help is-danger">{errors.validoHasta.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="field is-grouped is-grouped-right">
                    <p className="control">
                      <button
                        type="button"
                        className="button is-light"
                        onClick={handleReset}
                        disabled={isSubmitting}
                      >
                        <span className="icon">
                          <X size={16} />
                        </span>
                        <span>Limpiar</span>
                      </button>
                    </p>
                    <p className="control">
                      <button
                        type="button"
                        className="button is-outlined"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <span>Cancelar</span>
                      </button>
                    </p>
                    <p className="control">
                      <button
                        type="submit"
                        className="button is-primary"
                        disabled={isSubmitting || !isValid}
                      >
                        <span className="icon">
                          <Save size={16} />
                        </span>
                        <span>{isSubmitting ? 'Guardando...' : 'Guardar Presupuesto'}</span>
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Panel lateral con información */}
          <div className="column is-4">
            {/* Información del cliente */}
            {cliente && (
              <div className="card mb-4">
                <div className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <Users size={16} />
                    </span>
                    Cliente Seleccionado
                  </p>
                </div>
                <div className="card-content">
                  <div className="content">
                    <p className="has-text-weight-semibold">{cliente.nombreEmpresa}</p>
                    <p className="has-text-grey">RUT/CUIT: {cliente.rutCuit}</p>
                    {cliente.telefono && (
                      <p className="has-text-grey">Tel: {cliente.telefono}</p>
                    )}
                    {cliente.email && (
                      <p className="has-text-grey">Email: {cliente.email}</p>
                    )}
                    {cliente.direccion && (
                      <p className="has-text-grey">Dir: {cliente.direccion}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Información del equipo */}
            {equipo && (
              <div className="card mb-4">
                <div className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <Truck size={16} />
                    </span>
                    Equipo Seleccionado
                  </p>
                </div>
                <div className="card-content">
                  <div className="content">
                    <p className="has-text-weight-semibold">{equipo.patente}</p>
                    <p className="has-text-grey">Modelo: {equipo.modelo}</p>
                    <p className="has-text-grey">Capacidad: {equipo.capacidadKg} kg</p>
                    <span className={`tag ${equipo.estado === 'disponible' ? 'is-success' : 'is-warning'}`}>
                      {equipo.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Información del flujo */}
            <div className="card">
              <div className="card-header">
                <p className="card-header-title">
                  <span className="icon">
                    <Info size={16} />
                  </span>
                  Flujo del Presupuesto
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <ol className="is-size-7">
                    <li><strong>Creación:</strong> Presupuesto en estado "Pendiente"</li>
                    <li><strong>Aprobación:</strong> Cliente aprueba → Orden de Compra</li>
                    <li><strong>Ejecución:</strong> Servicio en obra con partes diarios</li>
                    <li><strong>Cierre:</strong> Generación de factura</li>
                    <li><strong>Pago:</strong> Registro de pagos recibidos</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 