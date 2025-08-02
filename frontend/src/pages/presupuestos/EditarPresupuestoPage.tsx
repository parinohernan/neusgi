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
  Loader2
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { clienteService } from '../../services/clienteService';
import { equipoService } from '../../services/equipoService';
import { useNotifications } from '../../hooks/useNotifications';
import { PresupuestoItemGrid } from '../../components/features/PresupuestoItemGrid';
import type { Cliente, Equipo, UpdatePresupuestoDto, PresupuestoItem } from '../../types';

// Schema de validación para presupuesto (actualizado para incluir items)
const presupuestoSchema = z.object({
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  costo: z.number()
    .min(0, 'El costo debe ser mayor o igual a 0')
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
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([]);
  const [items, setItems] = useState<PresupuestoItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    mode: 'onChange',
  });

  // Función para validar todos los campos
  const validateAllFields = () => {
    const errors: string[] = [];
    
    // Validar cliente
    if (!watch('clienteId') || watch('clienteId') === 0) {
      errors.push('Debe seleccionar un cliente');
    }
    
    // Validar equipos - asegurar que sea un array válido
    let equiposValidos = false;
    
    if (Array.isArray(equiposSeleccionados) && equiposSeleccionados.length > 0) {
      equiposValidos = equiposSeleccionados.every(id => typeof id === 'number' && !isNaN(id));
    } else if (presupuesto && presupuesto.equipos && presupuesto.equipos.length > 0) {
      // Fallback: usar los equipos del presupuesto original
      equiposValidos = true;
    } else if (presupuesto && presupuesto.equipoId) {
      // Fallback: usar el equipo del presupuesto original
      equiposValidos = true;
    }
    
    if (!equiposValidos) {
      console.log('=== DEBUG VALIDATION ===');
      console.log('equiposSeleccionados type:', typeof equiposSeleccionados);
      console.log('equiposSeleccionados value:', equiposSeleccionados);
      console.log('Array.isArray(equiposSeleccionados):', Array.isArray(equiposSeleccionados));
      console.log('presupuesto.equipos:', presupuesto?.equipos);
      console.log('presupuesto.equipoId:', presupuesto?.equipoId);
      errors.push('Debe seleccionar al menos un equipo');
    }
    
    // Validar descripción
    const descripcion = watch('descripcion');
    if (!descripcion || descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    // Validar fecha de validez
    const validoHasta = watch('validoHasta');
    if (!validoHasta) {
      errors.push('Debe seleccionar una fecha de validez');
    } else {
      const fecha = new Date(validoHasta);
      if (fecha <= new Date()) {
        errors.push('La fecha de validez debe ser futura');
      }
    }
    
    // Validar items
    if (items.length === 0) {
      errors.push('Debe agregar al menos un item al presupuesto');
    } else {
      items.forEach((item, index) => {
        if (!item.descripcion.trim()) {
          errors.push(`Item ${index + 1}: La descripción es requerida`);
        }
        if (item.cantidad < 0) {
          errors.push(`Item ${index + 1}: La cantidad no puede ser negativa`);
        }
        if (item.precioUnitario < 0) {
          errors.push(`Item ${index + 1}: El precio unitario no puede ser negativo`);
        }
        if (!item.unidad.trim()) {
          errors.push(`Item ${index + 1}: La unidad es requerida`);
        }
      });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

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
        
        console.log('=== DEBUG FRONTEND ===');
        console.log('Presupuesto cargado:', presupuestoData);
        console.log('Items count:', presupuestoData.items?.length || 0);
        console.log('Items:', presupuestoData.items);
        
        // Pre-llenar el formulario con los datos del presupuesto
        setValue('clienteId', presupuestoData.clienteId);
        setValue('descripcion', presupuestoData.descripcion);
        setValue('costo', presupuestoData.costo);
        setValue('validoHasta', new Date(presupuestoData.validoHasta).toISOString().split('T')[0]);
        
        // Cargar equipos seleccionados
        if (presupuestoData.equipos && presupuestoData.equipos.length > 0) {
          const equiposIds = presupuestoData.equipos.map((equipo: any) => equipo.id);
          console.log('=== DEBUG EQUIPOS ===');
          console.log('presupuestoData.equipos:', presupuestoData.equipos);
          console.log('equiposIds:', equiposIds);
          setEquiposSeleccionados(equiposIds);
        } else if (presupuestoData.equipoId) {
          // Compatibilidad con presupuestos antiguos que solo tenían un equipo
          console.log('=== DEBUG EQUIPO ANTIGUO ===');
          console.log('presupuestoData.equipoId:', presupuestoData.equipoId);
          setEquiposSeleccionados([presupuestoData.equipoId]);
        } else {
          console.log('=== DEBUG SIN EQUIPOS ===');
          console.log('No se encontraron equipos en el presupuesto');
          setEquiposSeleccionados([]);
        }

        // Cargar items del presupuesto
        if (presupuestoData.items && presupuestoData.items.length > 0) {
          console.log('Estableciendo items:', presupuestoData.items);
          setItems(presupuestoData.items);
        } else {
          console.log('No se encontraron items para cargar');
        }
        
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
        const [clientesData, equiposData] = await Promise.all([
          clienteService.getAll(),
          equipoService.getAll()
        ]);
        
        setClientes(clientesData.data || []);
        setEquipos(equiposData.data || []);
      } catch (err) {
        error('Error al cargar los datos');
        console.error('Error cargando datos:', err);
      }
    };

    cargarDatos();
  }, [error]);

  // Validar campos cuando cambien los equipos o items
  useEffect(() => {
    console.log('=== DEBUG VALIDATION EFFECT ===');
    console.log('equiposSeleccionados en effect:', equiposSeleccionados);
    console.log('equiposSeleccionados type:', typeof equiposSeleccionados);
    console.log('Array.isArray(equiposSeleccionados):', Array.isArray(equiposSeleccionados));
    validateAllFields();
  }, [equiposSeleccionados, items, watch('clienteId'), watch('descripcion'), watch('validoHasta')]);

  // Mostrar notificación de error cuando loadError cambie
  useEffect(() => {
    if (loadError) {
      error(loadError);
    }
  }, [loadError, error]);

  const onSubmit = async (data: PresupuestoFormData) => {
    if (!id) return;
    
    console.log('=== DEBUG ONSUBMIT ===');
    console.log('equiposSeleccionados al inicio:', equiposSeleccionados);
    console.log('equiposSeleccionados type:', typeof equiposSeleccionados);
    console.log('Array.isArray(equiposSeleccionados):', Array.isArray(equiposSeleccionados));
    
    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      error('Por favor, corrija los errores antes de continuar');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calcular el costo total de los items
      const costoTotal = items.reduce((total, item) => total + item.precioTotal, 0);

      // Asegurar que equipoIds sea un array válido - corrección más robusta
      let equipoIdsArray: number[] = [];
      
      if (Array.isArray(equiposSeleccionados)) {
        equipoIdsArray = equiposSeleccionados.filter(id => typeof id === 'number' && !isNaN(id));
      } else if (equiposSeleccionados && typeof equiposSeleccionados === 'number') {
        equipoIdsArray = [equiposSeleccionados];
      } else if (presupuesto && presupuesto.equipos && presupuesto.equipos.length > 0) {
        // Fallback: usar los equipos del presupuesto original
        equipoIdsArray = presupuesto.equipos.map((equipo: any) => equipo.id);
      } else if (presupuesto && presupuesto.equipoId) {
        // Fallback: usar el equipo del presupuesto original
        equipoIdsArray = [presupuesto.equipoId];
      }

      console.log('equipoIdsArray final:', equipoIdsArray);

      // Preparar datos para la API
      const presupuestoData: UpdatePresupuestoDto = {
        clienteId: data.clienteId,
        equipoIds: equipoIdsArray,
        descripcion: data.descripcion,
        costo: costoTotal,
        validoHasta: new Date(data.validoHasta),
        items: items,
      };

      console.log('=== DEBUG UPDATE PRESUPUESTO ===');
      console.log('equiposSeleccionados:', equiposSeleccionados);
      console.log('equipoIdsArray:', equipoIdsArray);
      console.log('presupuestoData:', presupuestoData);

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
      setValue('descripcion', presupuesto.descripcion);
      setValue('costo', presupuesto.costo);
      setValue('validoHasta', new Date(presupuesto.validoHasta).toISOString().split('T')[0]);
      
      // Restaurar equipos seleccionados
      if (presupuesto.equipos && presupuesto.equipos.length > 0) {
        setEquiposSeleccionados(presupuesto.equipos.map((equipo: any) => equipo.id));
      } else if (presupuesto.equipoId) {
        setEquiposSeleccionados([presupuesto.equipoId]);
      }

      // Restaurar items
      if (presupuesto.items && presupuesto.items.length > 0) {
        setItems(presupuesto.items);
      }
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
                            <span>Equipos *</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className={`select is-fullwidth ${validationErrors.some(e => e.includes('equipo')) ? 'is-danger' : ''}`}>
                            <select 
                              onChange={(e) => {
                                const equipoId = parseInt(e.target.value);
                                if (equipoId && !equiposSeleccionados.includes(equipoId)) {
                                  setEquiposSeleccionados([...equiposSeleccionados, equipoId]);
                                }
                              }}
                              value=""
                            >
                              <option value="">Agregar equipo</option>
                              {equipos
                                .filter(equipo => !equiposSeleccionados.includes(equipo.id))
                                .map(equipo => (
                                  <option key={equipo.id} value={equipo.id}>
                                    {equipo.patente} - {equipo.modelo} ({equipo.capacidadKg}kg)
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                        
                        {/* Lista de equipos seleccionados */}
                        {equiposSeleccionados.length > 0 && (
                          <div className="mt-3">
                            <div className="tags">
                              {equiposSeleccionados.map(equipoId => {
                                const equipo = equipos.find(e => e.id === equipoId);
                                return equipo ? (
                                  <span key={equipoId} className="tag is-info is-medium">
                                    {equipo.patente} - {equipo.modelo}
                                    <button
                                      className="delete is-small ml-2"
                                      onClick={() => setEquiposSeleccionados(equiposSeleccionados.filter(id => id !== equipoId))}
                                    />
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {validationErrors.some(e => e.includes('equipo')) && (
                          <p className="help is-danger">{validationErrors.find(e => e.includes('equipo'))}</p>
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
                            readOnly
                            value={items.reduce((total, item) => total + item.precioTotal, 0)}
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

                  {/* Items del Presupuesto */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <DollarSign size={16} />
                        </span>
                        <span>Items del Presupuesto *</span>
                      </span>
                    </label>
                    <PresupuestoItemGrid
                      items={items}
                      onItemsChange={setItems}
                      presupuestoId={parseInt(id || '0')}
                    />
                  </div>

                  {/* Errores de validación generales */}
                  {validationErrors.length > 0 && (
                    <div className="notification is-danger is-light">
                      <h4 className="title is-6">Errores de validación:</h4>
                      <ul>
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                        disabled={validationErrors.length > 0 || isSubmitting}
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
                        <li><strong>Equipos:</strong> {equiposSeleccionados.length}</li>
                        <li><strong>Costo:</strong> {formatearMoneda(presupuesto.costo)}</li>
                        <li><strong>Estado:</strong> {presupuesto.estado}</li>
                        <li><strong>Válido hasta:</strong> {new Date(presupuesto.validoHasta).toLocaleDateString()}</li>
                        <li><strong>Items:</strong> {items.length}</li>
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
                      <li>El costo se calcula automáticamente de los items</li>
                    </ul>
                  </div>

                  <div className="notification is-success is-light">
                    <h4 className="title is-6">Campos Editables</h4>
                    <ul>
                      <li><strong>Cliente:</strong> Cambiar cliente asignado</li>
                      <li><strong>Equipos:</strong> Cambiar equipos asignados</li>
                      <li><strong>Descripción:</strong> Modificar detalles del servicio</li>
                      <li><strong>Items:</strong> Agregar, editar o eliminar items</li>
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