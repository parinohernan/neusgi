import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Info,
  Loader2
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { clienteService } from '../../services/clienteService';
import { equipoService } from '../../services/equipoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Cliente, Equipo, UpdatePresupuestoDto } from '../../types';

// Schema de validación para presupuesto (igual que en NuevoPresupuestoPage)
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

export const EditarPresupuestoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    mode: 'onChange',
  });

  // Cargar datos del presupuesto al montar el componente
  useEffect(() => {
    const cargarPresupuesto = async () => {
      if (!id) {
        setLoadError('ID de presupuesto no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        
        const presupuestoData = await presupuestoService.getById(parseInt(id));
        setPresupuesto(presupuestoData);
        
        // Pre-llenar el formulario con los datos del presupuesto
        setValue('clienteId', presupuestoData.clienteId);
        setValue('equipoId', presupuestoData.equipoId);
        setValue('descripcion', presupuestoData.descripcion);
        setValue('costo', presupuestoData.costo);
        setValue('validoHasta', new Date(presupuestoData.validoHasta).toISOString().split('T')[0]);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el presupuesto';
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    cargarPresupuesto();
  }, [id, setValue]);

  // Cargar datos iniciales (clientes y equipos)
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

  // Mostrar notificación de error cuando loadError cambie
  useEffect(() => {
    if (loadError) {
      error(loadError);
    }
  }, [loadError, error]);

  const onSubmit = async (data: PresupuestoFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const presupuestoData: UpdatePresupuestoDto = {
        clienteId: data.clienteId,
        equipoId: data.equipoId,
        descripcion: data.descripcion,
        costo: data.costo,
        validoHasta: new Date(data.validoHasta),
      };

      // Llamar a la API
      const presupuestoActualizado = await presupuestoService.update(parseInt(id), presupuestoData);
      
      success(`Presupuesto #${presupuestoActualizado.id} actualizado exitosamente`);
      navigate('/presupuestos');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el presupuesto';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/presupuestos');
  };

  const handleReset = () => {
    if (presupuesto) {
      setValue('clienteId', presupuesto.clienteId);
      setValue('equipoId', presupuesto.equipoId);
      setValue('descripcion', presupuesto.descripcion);
      setValue('costo', presupuesto.costo);
      setValue('validoHasta', new Date(presupuesto.validoHasta).toISOString().split('T')[0]);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="main-container">
        <Sidebar 
          title="NEUSGI" 
          subtitle="Gestión de Presupuestos" 
        />
        <main className="content-area">
          <div className="has-text-centered py-6">
            <div className="icon is-large">
              <Loader2 size={64} className="fa-spin" />
            </div>
            <p className="title is-4 has-text-grey-light mt-4">
              Cargando presupuesto...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el presupuesto
  if (loadError) {
    return (
      <div className="main-container">
        <Sidebar 
          title="NEUSGI" 
          subtitle="Gestión de Presupuestos" 
        />
        <main className="content-area">
          <div className="notification is-danger">
            <p><strong>Error:</strong> {loadError}</p>
            <button 
              className="button is-small"
              onClick={() => navigate('/presupuestos')}
            >
              Volver a Presupuestos
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(monto);
  };

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombreEmpresa : 'Cliente no encontrado';
  };

  const getEquipoPatente = (equipoId: number) => {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo ? equipo.patente : 'Equipo no encontrado';
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
                  <h1 className="page-title">Editar Presupuesto</h1>
                  <p className="page-subtitle">
                    Modifica el presupuesto #{presupuesto?.id}
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
                              {clientes.map((cliente) => (
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
                              {equipos.map((equipo) => (
                                <option key={equipo.id} value={equipo.id}>
                                  {equipo.patente} - {equipo.modelo}
                                </option>
                              ))}
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
                        placeholder="Describe el servicio a realizar..."
                        rows={4}
                      />
                    </div>
                    {errors.descripcion && (
                      <p className="help is-danger">{errors.descripcion.message}</p>
                    )}
                  </div>

                  {/* Costo y Fecha de Validez */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <DollarSign size={16} />
                            </span>
                            <span>Costo *</span>
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
                        <span>Restaurar</span>
                      </button>
                    </p>
                    <p className="control">
                      <button
                        type="button"
                        className="button is-outlined"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                    </p>
                    <p className="control">
                      <button
                        type="submit"
                        className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
                        disabled={!isValid || isSubmitting}
                      >
                        <span className="icon">
                          <Save size={16} />
                        </span>
                        <span>Guardar Cambios</span>
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Panel lateral con información */}
          <div className="column is-4">
            <div className="card shadow-hover">
              <div className="card-header">
                <p className="card-header-title">
                  Información del Presupuesto
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  {presupuesto && (
                    <div className="notification is-info is-light">
                      <h4 className="title is-6">Datos Actuales</h4>
                      <ul>
                        <li><strong>ID:</strong> #{presupuesto.id}</li>
                        <li><strong>Cliente:</strong> {getClienteNombre(presupuesto.clienteId)}</li>
                        <li><strong>Equipo:</strong> {getEquipoPatente(presupuesto.equipoId)}</li>
                        <li><strong>Costo:</strong> {formatearMoneda(presupuesto.costo)}</li>
                        <li><strong>Estado:</strong> {presupuesto.estado}</li>
                        <li><strong>Válido hasta:</strong> {new Date(presupuesto.validoHasta).toLocaleDateString()}</li>
                      </ul>
                    </div>
                  )}

                  <div className="notification is-warning is-light">
                    <h4 className="title is-6">Notas Importantes</h4>
                    <ul>
                      <li>Los cambios se aplicarán inmediatamente</li>
                      <li>El estado del presupuesto no se puede modificar aquí</li>
                      <li>Puedes restaurar los valores originales</li>
                      <li>La fecha de validez debe ser futura</li>
                    </ul>
                  </div>

                  <div className="notification is-success is-light">
                    <h4 className="title is-6">Campos Editables</h4>
                    <ul>
                      <li><strong>Cliente:</strong> Cambiar cliente asignado</li>
                      <li><strong>Equipo:</strong> Cambiar equipo asignado</li>
                      <li><strong>Descripción:</strong> Modificar detalles del servicio</li>
                      <li><strong>Costo:</strong> Actualizar precio</li>
                      <li><strong>Validez:</strong> Extender fecha de validez</li>
                    </ul>
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