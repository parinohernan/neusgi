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
import { PresupuestoItemGrid } from '../../components/features/PresupuestoItemGrid';
import type { Cliente, Equipo, PresupuestoItem } from '../../types';

// Schema de validación para presupuesto
const presupuestoSchema = z.object({
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  validoHasta: z.string()
    .min(1, 'Debe seleccionar una fecha de validez'),
  plazoEntrega: z.string().max(100, 'El plazo de entrega no puede exceder 100 caracteres').optional(),
  lugarEntrega: z.string().max(200, 'El lugar de entrega no puede exceder 200 caracteres').optional(),
  formaPago: z.string().max(100, 'La forma de pago no puede exceder 100 caracteres').optional(),
  validez: z.string().max(100, 'La validez no puede exceder 100 caracteres').optional(),
});

type PresupuestoFormData = z.infer<typeof presupuestoSchema>;

export const NuevoPresupuestoPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([]);
  const [items, setItems] = useState<PresupuestoItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm<PresupuestoFormData>({
    resolver: zodResolver(presupuestoSchema),
    mode: 'onChange',
  });

  // Función para validar todos los campos
  const validateAllFields = (): boolean => {
    const errors: string[] = [];
    const formData = getValues();

    // Validar cliente
    if (!formData.clienteId || formData.clienteId <= 0) {
      errors.push('Debe seleccionar un cliente');
    }

    // Validar equipos
    if (equiposSeleccionados.length === 0) {
      errors.push('Debe seleccionar al menos un equipo');
    }

    // Validar descripción
    if (!formData.descripcion || formData.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    // Validar fecha de validez
    if (!formData.validoHasta) {
      errors.push('Debe seleccionar una fecha de validez');
    }

    // Validar items
    if (items.length === 0) {
      errors.push('Debe agregar al menos un item al presupuesto');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Funciones para verificar el estado de cada campo
  const isClienteValid = () => {
    const formData = getValues();
    return formData.clienteId && formData.clienteId > 0;
  };

  const isEquiposValid = () => {
    return equiposSeleccionados.length > 0;
  };

  const isDescripcionValid = () => {
    const formData = getValues();
    return formData.descripcion && formData.descripcion.length >= 10;
  };

  const isFechaValid = () => {
    const formData = getValues();
    return formData.validoHasta && formData.validoHasta.length > 0;
  };

  const isItemsValid = () => {
    return items.length > 0;
  };

  // Validar cuando cambien los equipos, items o campos del formulario
  useEffect(() => {
    validateAllFields();
  }, [equiposSeleccionados, items, watch('clienteId'), watch('descripcion'), watch('validoHasta')]);

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
      // Validar todos los campos
      if (!validateAllFields()) {
        error('Por favor, complete todos los campos requeridos');
        setIsSubmitting(false);
        return;
      }

      // Calcular el costo total desde los items
      const costoTotal = items.reduce((sum, item) => sum + item.precioTotal, 0);

      // Preparar datos para la API
      const presupuestoData = {
        clienteId: data.clienteId,
        equipoIds: equiposSeleccionados,
        descripcion: data.descripcion,
        costo: costoTotal,
        validoHasta: new Date(data.validoHasta),
        estado: 'pendiente' as const,
        plazoEntrega: data.plazoEntrega || 'Inmediato',
        lugarEntrega: data.lugarEntrega || 'Rincon de los Sauces',
        formaPago: data.formaPago || '30 días FF',
        validez: data.validez || '3 días',
        items: items.map(item => ({
          presupuestoId: 0, // Se asignará desde el backend
          numero: item.numero,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          unidad: item.unidad,
          precioUnitario: item.precioUnitario,
          precioTotal: item.precioTotal,
          observaciones: item.observaciones
        }))
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
    reset({
      clienteId: undefined,
      descripcion: '',
      validoHasta: '',
      plazoEntrega: 'Inmediato',
      lugarEntrega: 'Rincon de los Sauces',
      formaPago: '30 días FF',
      validez: '3 días'
    });
    setEquiposSeleccionados([]);
    setItems([]);
    setValidationErrors([]);
  };

  // Obtener cliente seleccionado
  const clienteSeleccionado = watch('clienteId');
  const cliente = clientes.find(c => c.id === clienteSeleccionado);

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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Errores de validación generales */}
                  {validationErrors.length > 0 && (
                    <div className="notification is-danger is-light">
                      <button 
                        className="delete" 
                        onClick={() => setValidationErrors([])}
                      />
                      <strong>Por favor, complete los siguientes campos:</strong>
                      <ul className="mt-2">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cliente y Equipos */}
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
                          <div className={`select is-fullwidth ${errors.clienteId ? 'is-danger' : isClienteValid() ? 'is-success' : ''}`}>
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
                        {isClienteValid() && (
                          <p className="help is-success">✓ Cliente seleccionado</p>
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
                          <div className={`select is-fullwidth ${validationErrors.some(e => e.includes('equipo')) ? 'is-danger' : isEquiposValid() ? 'is-success' : ''}`}>
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
                                .filter(equipo => equipo.estado === 'disponible' && !equiposSeleccionados.includes(equipo.id))
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
                          <p className="help is-danger">Debe seleccionar al menos un equipo</p>
                        )}
                        {isEquiposValid() && (
                          <p className="help is-success">✓ {equiposSeleccionados.length} equipo(s) seleccionado(s)</p>
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
                        className={`textarea ${errors.descripcion ? 'is-danger' : isDescripcionValid() ? 'is-success' : ''}`}
                        placeholder="Describe detalladamente el servicio a realizar, incluyendo origen, destino, fechas, condiciones especiales..."
                        rows={6}
                      />
                    </div>
                    {errors.descripcion && (
                      <p className="help is-danger">{errors.descripcion.message}</p>
                    )}
                    {isDescripcionValid() && (
                      <p className="help is-success">✓ Descripción válida</p>
                    )}
                  </div>

                  {/* Grilla de Items */}
                  <div className={`field ${isItemsValid() ? 'has-success' : ''}`}>
                    <PresupuestoItemGrid
                      items={items}
                      onItemsChange={setItems}
                    />
                    {isItemsValid() && (
                      <p className="help is-success">✓ {items.length} item(s) agregado(s)</p>
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
                            type="number"
                            className="input"
                            value={items.reduce((sum, item) => sum + item.precioTotal, 0).toFixed(2)}
                            readOnly
                            style={{ backgroundColor: '#f5f5f5' }}
                          />
                        </div>
                        <p className="help">Calculado automáticamente desde los items</p>
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
                            className={`input ${errors.validoHasta ? 'is-danger' : isFechaValid() ? 'is-success' : ''}`}
                            min={fechaMinima}
                          />
                        </div>
                        {errors.validoHasta && (
                          <p className="help is-danger">{errors.validoHasta.message}</p>
                        )}
                        {isFechaValid() && (
                          <p className="help is-success">✓ Fecha de validez seleccionada</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Condiciones del Presupuesto */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <Info size={16} />
                        </span>
                        <span>Condiciones del Presupuesto</span>
                      </span>
                    </label>
                  </div>

                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Plazo de Entrega</label>
                        <div className="control">
                          <input
                            {...register('plazoEntrega')}
                            type="text"
                            className="input"
                            placeholder="Ej: Inmediato, 15 días, etc."
                            defaultValue="Inmediato"
                          />
                        </div>
                        {errors.plazoEntrega && (
                          <p className="help is-danger">{errors.plazoEntrega.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Lugar de Entrega</label>
                        <div className="control">
                          <input
                            {...register('lugarEntrega')}
                            type="text"
                            className="input"
                            placeholder="Ej: Rincon de los Sauces, etc."
                            defaultValue="Rincon de los Sauces"
                          />
                        </div>
                        {errors.lugarEntrega && (
                          <p className="help is-danger">{errors.lugarEntrega.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Forma de Pago</label>
                        <div className="control">
                          <input
                            {...register('formaPago')}
                            type="text"
                            className="input"
                            placeholder="Ej: 30 días FF, Contado, etc."
                            defaultValue="30 días FF"
                          />
                        </div>
                        {errors.formaPago && (
                          <p className="help is-danger">{errors.formaPago.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Validez de la Oferta</label>
                        <div className="control">
                          <input
                            {...register('validez')}
                            type="text"
                            className="input"
                            placeholder="Ej: 3 días, 7 días, etc."
                            defaultValue="3 días"
                          />
                        </div>
                        {errors.validez && (
                          <p className="help is-danger">{errors.validez.message}</p>
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
                        disabled={isSubmitting || validationErrors.length > 0}
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

            {/* Información de los equipos */}
            {equiposSeleccionados.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <Truck size={16} />
                    </span>
                    Equipos Seleccionados ({equiposSeleccionados.length})
                  </p>
                </div>
                <div className="card-content">
                  <div className="content">
                    {equiposSeleccionados.map(equipoId => {
                      const equipo = equipos.find(e => e.id === equipoId);
                      return equipo ? (
                        <div key={equipoId} className="mb-3">
                          <p className="has-text-weight-semibold">{equipo.patente}</p>
                          <p className="has-text-grey">Modelo: {equipo.modelo}</p>
                          <p className="has-text-grey">Capacidad: {equipo.capacidadKg} kg</p>
                          <span className={`tag ${equipo.estado === 'disponible' ? 'is-success' : 'is-warning'}`}>
                            {equipo.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                          </span>
                        </div>
                      ) : null;
                    })}
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