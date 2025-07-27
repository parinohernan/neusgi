import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Plus, 
  Save, 
  X, 
  ArrowLeft,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { equipoService } from '../../services/equipoService';
import type { CreateEquipoDto } from '../../types';
import { Sidebar } from '../../components/layout';

// Schema de validación para equipo
const equipoSchema = z.object({
  patente: z.string()
    .min(4, 'La patente debe tener al menos 4 caracteres')
    .max(20, 'La patente no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La patente solo puede contener letras mayúsculas, números y guiones'),
  modelo: z.string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(100, 'El modelo no puede exceder 100 caracteres'),
  capacidadKg: z.number()
    .min(1, 'La capacidad debe ser mayor a 0')
    .max(100000, 'La capacidad no puede exceder 100,000 kg'),
  estado: z.enum(['disponible', 'en_uso', 'mantenimiento', 'fuera_servicio']),
  tipo: z.enum(['camion', 'excavadora', 'retroexcavadora', 'pala_cargadora', 'compactador', 'otro']),
  observaciones: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

export const NuevoEquipoPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: EquipoFormData) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const equipoData: CreateEquipoDto = {
        patente: data.patente.toUpperCase(),
        modelo: data.modelo,
        capacidadKg: data.capacidadKg,
        estado: data.estado,
        tipo: data.tipo,
        observaciones: data.observaciones || undefined,
        // usuarioId se asignará automáticamente desde el backend
      };

      // Llamar a la API
      const nuevoEquipo = await equipoService.create(equipoData);
      
      success(`Equipo "${nuevoEquipo.patente}" creado exitosamente`);
      navigate('/equipos');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el equipo';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/equipos');
  };

  const handleReset = () => {
    reset();
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
                  <h1 className="page-title">Nuevo Equipo</h1>
                  <p className="page-subtitle">
                    Registra un nuevo equipo en el sistema
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
                    <Truck size={20} />
                  </span>
                  Información del Equipo
                </p>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Información básica */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Truck size={16} />
                            </span>
                            <span>Patente *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('patente')}
                            type="text"
                            className={`input ${errors.patente ? 'is-danger' : ''}`}
                            placeholder="Ej: ABC123"
                            style={{ textTransform: 'uppercase' }}
                          />
                        </div>
                        {errors.patente && (
                          <p className="help is-danger">{errors.patente.message}</p>
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
                            <span>Modelo *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('modelo')}
                            type="text"
                            className={`input ${errors.modelo ? 'is-danger' : ''}`}
                            placeholder="Ej: Volvo FH16"
                          />
                        </div>
                        {errors.modelo && (
                          <p className="help is-danger">{errors.modelo.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Capacidad y Tipo */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Truck size={16} />
                            </span>
                            <span>Capacidad (kg) *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('capacidadKg', { valueAsNumber: true })}
                            type="number"
                            className={`input ${errors.capacidadKg ? 'is-danger' : ''}`}
                            placeholder="Ej: 25000"
                            min="1"
                            max="100000"
                          />
                        </div>
                        {errors.capacidadKg && (
                          <p className="help is-danger">{errors.capacidadKg.message}</p>
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
                            <span>Tipo de Equipo *</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className={`select is-fullwidth ${errors.tipo ? 'is-danger' : ''}`}>
                            <select {...register('tipo')}>
                              <option value="">Seleccionar tipo</option>
                              <option value="camion">Camión</option>
                              <option value="excavadora">Excavadora</option>
                              <option value="retroexcavadora">Retroexcavadora</option>
                              <option value="pala_cargadora">Pala Cargadora</option>
                              <option value="compactador">Compactador</option>
                              <option value="otro">Otro</option>
                            </select>
                          </div>
                        </div>
                        {errors.tipo && (
                          <p className="help is-danger">{errors.tipo.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <CheckCircle size={16} />
                        </span>
                        <span>Estado *</span>
                      </span>
                    </label>
                    <div className="control">
                      <div className={`select is-fullwidth ${errors.estado ? 'is-danger' : ''}`}>
                        <select {...register('estado')}>
                          <option value="">Seleccionar estado</option>
                          <option value="disponible">Disponible</option>
                          <option value="en_uso">En Uso</option>
                          <option value="mantenimiento">Mantenimiento</option>
                          <option value="fuera_servicio">Fuera de Servicio</option>
                        </select>
                      </div>
                    </div>
                    {errors.estado && (
                      <p className="help is-danger">{errors.estado.message}</p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <Wrench size={16} />
                        </span>
                        <span>Observaciones</span>
                      </span>
                    </label>
                    <div className="control">
                      <textarea
                        {...register('observaciones')}
                        className={`textarea ${errors.observaciones ? 'is-danger' : ''}`}
                        placeholder="Información adicional sobre el equipo..."
                        rows={4}
                      />
                    </div>
                    {errors.observaciones && (
                      <p className="help is-danger">{errors.observaciones.message}</p>
                    )}
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
                        <span>Guardar Equipo</span>
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
                  Información de Ayuda
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="notification is-info is-light">
                    <h4 className="title is-6">Campos Requeridos</h4>
                    <ul>
                      <li><strong>Patente:</strong> Identificación única del vehículo</li>
                      <li><strong>Modelo:</strong> Modelo y marca del equipo</li>
                      <li><strong>Capacidad:</strong> Capacidad máxima en kilogramos</li>
                      <li><strong>Tipo:</strong> Categoría del equipo</li>
                      <li><strong>Estado:</strong> Estado actual del equipo</li>
                    </ul>
                  </div>

                  <div className="notification is-warning is-light">
                    <h4 className="title is-6">Estados del Equipo</h4>
                    <ul>
                      <li><strong>Disponible:</strong> Listo para usar</li>
                      <li><strong>En Uso:</strong> Actualmente en operación</li>
                      <li><strong>Mantenimiento:</strong> En reparación o mantenimiento</li>
                      <li><strong>Fuera de Servicio:</strong> No disponible temporalmente</li>
                    </ul>
                  </div>

                  <div className="notification is-success is-light">
                    <h4 className="title is-6">Tipos de Equipos</h4>
                    <ul>
                      <li><strong>Camiones:</strong> Transporte de carga</li>
                      <li><strong>Excavadoras:</strong> Excavación y movimiento de tierra</li>
                      <li><strong>Retroexcavadoras:</strong> Excavación y carga</li>
                      <li><strong>Pala Cargadora:</strong> Carga y transporte de materiales</li>
                      <li><strong>Compactador:</strong> Compactación de suelos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="card shadow-hover mt-4">
              <div className="card-header">
                <p className="card-header-title">
                  Estadísticas
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  <div className="level">
                    <div className="level-item has-text-centered">
                      <div>
                        <p className="heading">Total Equipos</p>
                        <p className="title">12</p>
                      </div>
                    </div>
                    <div className="level-item has-text-centered">
                      <div>
                        <p className="heading">Disponibles</p>
                        <p className="title has-text-success">8</p>
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