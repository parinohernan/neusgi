import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { useAuth } from '../../stores/authStore';
import { equipoService } from '../../services/equipoService';
import { categoriaService } from '../../services/categoriaService';
import { empleadoService } from '../../services/empleadoService';
import type { CreateEquipoDto, EquipoImagen, Categoria, Empleado } from '../../types';
import { Sidebar } from '../../components/layout';
import { ImageUploader } from '../../components/ui/ImageUploader';

// Schema de validación para equipo
const equipoSchema = z.object({
  patente: z.string()
    .min(4, 'La patente debe tener al menos 4 caracteres')
    .max(20, 'La patente no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La patente solo puede contener letras mayúsculas, números y guiones'),
  modelo: z.string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(100, 'El modelo no puede exceder 100 caracteres'),
  categoriaId: z.number().min(1, 'Debe seleccionar una categoría'),
  capacidadKg: z.number()
    .min(1, 'La capacidad debe ser mayor a 0')
    .max(100000, 'La capacidad no puede exceder 100,000 kg'),
  estado: z.enum(['disponible', 'ocupado', 'mantenimiento']),
  conductorId: z.number().optional(),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

export const NuevoEquipoPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagenes, setImagenes] = useState<EquipoImagen[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [conductores, setConductores] = useState<Empleado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    mode: 'onChange',
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        
        // Cargar datos en paralelo
        const [categoriasData, conductoresData] = await Promise.all([
          categoriaService.getActivas(),
          empleadoService.getConductores()
        ]);
        
        setCategorias(categoriasData);
        setConductores(conductoresData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
        error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []); // Array de dependencias vacío para ejecutar solo una vez

  const onSubmit = async (data: EquipoFormData) => {
    console.log('NuevoEquipoPage - Estado de autenticación:', isAuthenticated);
    console.log('NuevoEquipoPage - Datos del formulario:', data);
    
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const equipoData: CreateEquipoDto = {
        patente: data.patente.toUpperCase(),
        modelo: data.modelo,
        categoriaId: data.categoriaId,
        capacidadKg: data.capacidadKg,
        estado: data.estado,
        conductorId: data.conductorId || undefined,
      };

      // Solo agregar imágenes si hay alguna
      if (imagenes && imagenes.length > 0) {
        equipoData.imagenes = imagenes;
      }

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

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="main-container">
        <Sidebar 
          title="NEUSGI" 
          subtitle="Gestión de Equipos" 
        />
        <main className="content-area">
          <div className="has-text-centered py-6">
            <div className="icon is-large">
              <div className="fa fa-spinner fa-spin"></div>
            </div>
            <p className="title is-4 has-text-grey-light mt-4">
              Cargando datos...
            </p>
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

                  {/* Categoría y Capacidad */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Truck size={16} />
                            </span>
                            <span>Categoría *</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className={`select is-fullwidth ${errors.categoriaId ? 'is-danger' : ''}`}>
                            <select {...register('categoriaId', { valueAsNumber: true })}>
                              <option value="">Seleccionar categoría</option>
                              {isLoading ? (
                                <option value="" disabled>Cargando categorías...</option>
                              ) : (
                                (categorias || []).map((categoria) => (
                                  <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>
                        {errors.categoriaId && (
                          <p className="help is-danger">{errors.categoriaId.message}</p>
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
                  </div>

                  {/* Conductor y Estado */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Truck size={16} />
                            </span>
                            <span>Conductor</span>
                          </span>
                        </label>
                        <div className="control">
                          <div className="select is-fullwidth">
                            <select {...register('conductorId', { valueAsNumber: true })}>
                              <option value="">Sin conductor asignado</option>
                              {isLoading ? (
                                <option value="" disabled>Cargando conductores...</option>
                              ) : (
                                (conductores || []).map((conductor) => (
                                  <option key={conductor.id} value={conductor.id}>
                                    {conductor.nombre} {conductor.apellido} - {conductor.dni}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="column is-6">
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
                              <option value="disponible">Disponible</option>
                              <option value="ocupado">Ocupado</option>
                              <option value="mantenimiento">Mantenimiento</option>
                            </select>
                          </div>
                        </div>
                        {errors.estado && (
                          <p className="help is-danger">{errors.estado.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección de imágenes */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <Truck size={16} />
                        </span>
                        <span>Imágenes del Equipo</span>
                      </span>
                    </label>
                    <div className="control">
                      <ImageUploader
                        imagenes={imagenes}
                        onImagesChange={setImagenes}
                        maxImages={10}
                      />
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