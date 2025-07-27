import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { useNotifications } from '../../stores/uiStore';
import { clienteService } from '../../services/clienteService';
import type { CreateClienteDto } from '../../types';

// Schema de validación para cliente
const clienteSchema = z.object({
  nombreEmpresa: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  rutCuit: z.string()
    .min(10, 'El RUT/CUIT debe tener al menos 10 caracteres')
    .max(30, 'El RUT/CUIT no puede exceder 30 caracteres')
    .regex(/^[0-9-]+$/, 'El RUT/CUIT solo puede contener números y guiones'),
  direccion: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  telefono: z.string()
    .min(8, 'El teléfono debe tener al menos 8 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[0-9+\-()\s]+$/, 'El teléfono solo puede contener números, espacios, guiones, paréntesis y +'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  observaciones: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export const NuevoClientePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para la API
      const clienteData: CreateClienteDto = {
        nombreEmpresa: data.nombreEmpresa,
        rutCuit: data.rutCuit,
        direccion: data.direccion,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        // usuarioId se asignará automáticamente desde el backend
      };

      // Llamar a la API
      const nuevoCliente = await clienteService.create(clienteData);
      
      success(`Cliente "${nuevoCliente.nombreEmpresa}" creado exitosamente`);
      navigate('/clientes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el cliente';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/clientes');
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="main-container">
      {/* Sidebar placeholder */}
      <aside className="sidebar">
        <div className="sidebar-header mb-4">
          <h3 className="title is-4 has-text-primary">NEUSGI</h3>
          <p className="subtitle is-6 has-text-grey">Gestión de Clientes</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="content-area">
        {/* Header */}
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Nuevo Cliente</h1>
                  <p className="page-subtitle">
                    Registra un nuevo cliente en el sistema
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
                    <UserPlus size={20} />
                  </span>
                  Información del Cliente
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
                              <Building2 size={16} />
                            </span>
                            <span>Nombre de la Empresa *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('nombreEmpresa')}
                            type="text"
                            className={`input ${errors.nombreEmpresa ? 'is-danger' : ''}`}
                            placeholder="Ej: Constructora ABC S.A."
                          />
                        </div>
                        {errors.nombreEmpresa && (
                          <p className="help is-danger">{errors.nombreEmpresa.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <FileText size={16} />
                            </span>
                            <span>RUT/CUIT *</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('rutCuit')}
                            type="text"
                            className={`input ${errors.rutCuit ? 'is-danger' : ''}`}
                            placeholder="Ej: 20-12345678-9"
                          />
                        </div>
                        {errors.rutCuit && (
                          <p className="help is-danger">{errors.rutCuit.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Mail size={16} />
                            </span>
                            <span>Email</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('email')}
                            type="email"
                            className={`input ${errors.email ? 'is-danger' : ''}`}
                            placeholder="contacto@empresa.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="help is-danger">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">
                          <span className="icon-text">
                            <span className="icon">
                              <Phone size={16} />
                            </span>
                            <span>Teléfono</span>
                          </span>
                        </label>
                        <div className="control">
                          <input
                            {...register('telefono')}
                            type="tel"
                            className={`input ${errors.telefono ? 'is-danger' : ''}`}
                            placeholder="+54 11 1234-5678"
                          />
                        </div>
                        {errors.telefono && (
                          <p className="help is-danger">{errors.telefono.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <MapPin size={16} />
                        </span>
                        <span>Dirección *</span>
                      </span>
                    </label>
                    <div className="control">
                      <textarea
                        {...register('direccion')}
                        className={`textarea ${errors.direccion ? 'is-danger' : ''}`}
                        placeholder="Av. San Martín 1234, Buenos Aires, Argentina"
                        rows={3}
                      />
                    </div>
                    {errors.direccion && (
                      <p className="help is-danger">{errors.direccion.message}</p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div className="field">
                    <label className="label">
                      <span className="icon-text">
                        <span className="icon">
                          <FileText size={16} />
                        </span>
                        <span>Observaciones</span>
                      </span>
                    </label>
                    <div className="control">
                      <textarea
                        {...register('observaciones')}
                        className={`textarea ${errors.observaciones ? 'is-danger' : ''}`}
                        placeholder="Información adicional sobre el cliente..."
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
                        <span>Guardar Cliente</span>
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
                      <li><strong>Nombre de la Empresa:</strong> Nombre legal de la empresa</li>
                      <li><strong>RUT/CUIT:</strong> Número de identificación fiscal</li>
                      <li><strong>Dirección:</strong> Dirección física completa</li>
                    </ul>
                  </div>

                  <div className="notification is-warning is-light">
                    <h4 className="title is-6">Validaciones</h4>
                    <ul>
                      <li>El RUT/CUIT debe ser único en el sistema</li>
                      <li>El email debe tener formato válido</li>
                      <li>El teléfono debe incluir código de país</li>
                    </ul>
                  </div>

                  <div className="notification is-success is-light">
                    <h4 className="title is-6">Próximos Pasos</h4>
                    <ul>
                      <li>Crear presupuestos para el cliente</li>
                      <li>Configurar condiciones de pago</li>
                      <li>Asignar representante comercial</li>
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
                        <p className="heading">Total Clientes</p>
                        <p className="title">24</p>
                      </div>
                    </div>
                    <div className="level-item has-text-centered">
                      <div>
                        <p className="heading">Activos</p>
                        <p className="title has-text-success">18</p>
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