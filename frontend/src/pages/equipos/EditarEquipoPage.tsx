import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Truck, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { equipoService } from '../../services/equipoService';
import type { UpdateEquipoDto, EquipoImagen } from '../../types';
import { Sidebar } from '../../components/layout';
import { ImageUploader } from '../../components/ui/ImageUploader';

// Schema de validación para equipo (igual que en NuevoEquipoPage)
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
  estado: z.enum(['disponible', 'ocupado', 'mantenimiento']),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

export const EditarEquipoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipo, setEquipo] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imagenes, setImagenes] = useState<EquipoImagen[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    mode: 'onChange',
  });

  // Cargar datos del equipo al montar el componente
  useEffect(() => {
    const cargarEquipo = async () => {
      if (!id) {
        setLoadError('ID de equipo no válido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        
        const equipoData = await equipoService.getById(parseInt(id));
        setEquipo(equipoData);
        setImagenes(equipoData.imagenes || []);
        
        // Pre-llenar el formulario con los datos del equipo
        setValue('patente', equipoData.patente);
        setValue('modelo', equipoData.modelo);
        setValue('capacidadKg', equipoData.capacidadKg);
        setValue('estado', equipoData.estado);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el equipo';
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    cargarEquipo();
  }, [id, setValue]);

  // Mostrar notificación de error cuando loadError cambie
  useEffect(() => {
    if (loadError) {
      error(loadError);
    }
  }, [loadError, error]);

  const onSubmit = async (data: EquipoFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const equipoData: UpdateEquipoDto = {
        patente: data.patente.toUpperCase(),
        modelo: data.modelo,
        capacidadKg: data.capacidadKg,
        estado: data.estado,
        imagenes: imagenes,
      };

      // Llamar a la API
      const equipoActualizado = await equipoService.update(parseInt(id), equipoData);
      
      success(`Equipo "${equipoActualizado.patente}" actualizado exitosamente`);
      navigate('/equipos');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el equipo';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/equipos');
  };

  const handleReset = () => {
    if (equipo) {
      setValue('patente', equipo.patente);
      setValue('modelo', equipo.modelo);
      setValue('capacidadKg', equipo.capacidadKg);
      setValue('estado', equipo.estado);
    }
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
              <Loader2 size={64} className="fa-spin" />
            </div>
            <p className="title is-4 has-text-grey-light mt-4">
              Cargando equipo...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar el equipo
  if (loadError) {
    return (
      <div className="main-container">
        <Sidebar 
          title="NEUSGI" 
          subtitle="Gestión de Equipos" 
        />
        <main className="content-area">
          <div className="notification is-danger">
            <p><strong>Error:</strong> {loadError}</p>
            <button 
              className="button is-small"
              onClick={() => navigate('/equipos')}
            >
              Volver a Equipos
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
                  <h1 className="page-title">Editar Equipo</h1>
                  <p className="page-subtitle">
                    Modifica la información del equipo {equipo?.patente}
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

                  {/* Capacidad y Estado */}
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
                  Información del Equipo
                </p>
              </div>
              <div className="card-content">
                <div className="content">
                  {equipo && (
                    <div className="notification is-info is-light">
                      <h4 className="title is-6">Datos Actuales</h4>
                      <ul>
                        <li><strong>ID:</strong> {equipo.id}</li>
                        <li><strong>Patente:</strong> {equipo.patente}</li>
                        <li><strong>Modelo:</strong> {equipo.modelo}</li>
                        <li><strong>Capacidad:</strong> {equipo.capacidadKg.toLocaleString()} kg</li>
                        <li><strong>Estado:</strong> {equipo.estado}</li>
                      </ul>
                    </div>
                  )}

                  <div className="notification is-warning is-light">
                    <h4 className="title is-6">Estados del Equipo</h4>
                    <ul>
                      <li><strong>Disponible:</strong> Listo para usar</li>
                      <li><strong>Ocupado:</strong> Actualmente en operación</li>
                      <li><strong>Mantenimiento:</strong> En reparación o mantenimiento</li>
                    </ul>
                  </div>

                  <div className="notification is-success is-light">
                    <h4 className="title is-6">Notas Importantes</h4>
                    <ul>
                      <li>La patente debe ser única en el sistema</li>
                      <li>Los cambios se guardarán inmediatamente</li>
                      <li>Puedes restaurar los valores originales</li>
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