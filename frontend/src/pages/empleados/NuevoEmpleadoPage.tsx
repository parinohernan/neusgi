import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserCheck, Loader2 } from 'lucide-react';
import { empleadoService } from '../../services/empleadoService';
import type { Empleado, CreateEmpleadoDto, TipoEmpleado } from '../../types';
import { useAuth } from '../../stores/authStore';
import { Sidebar } from '../../components/layout';

const NuevoEmpleadoPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [tiposEmpleado, setTiposEmpleado] = useState<TipoEmpleado[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateEmpleadoDto>({
    nombre: '',
    apellido: '',
    dni: '',
    tipoEmpleadoId: 0,
    sexo: 'masculino',
    telefono: '',
    email: '',
    direccion: '',
    fechaIngreso: new Date(),
    imagen: '',
    activo: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      cargarTiposEmpleado();
    }
  }, [isAuthenticated]);

  const cargarTiposEmpleado = async () => {
    try {
      setLoadingTipos(true);
      // Por ahora usaremos datos mock, después implementaremos el servicio
      const tiposMock: TipoEmpleado[] = [
        { id: 1, nombre: 'Conductor', descripcion: 'Operadores de equipos y vehículos', activo: true, creadoEn: new Date() },
        { id: 2, nombre: 'Mecánico', descripcion: 'Mantenimiento de equipos', activo: true, creadoEn: new Date() },
        { id: 3, nombre: 'Administración', descripcion: 'Personal administrativo', activo: true, creadoEn: new Date() }
      ];
      setTiposEmpleado(tiposMock);
    } catch (err) {
      console.error('Error al cargar tipos de empleado:', err);
      setError('Error al cargar tipos de empleado');
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim()) {
      setError('Los campos nombre, apellido y DNI son obligatorios');
      return;
    }

    if (formData.tipoEmpleadoId === 0) {
      setError('Debe seleccionar un tipo de empleado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await empleadoService.create(formData);
      alert('Empleado creado exitosamente');
      navigate('/empleados');
    } catch (err: any) {
      console.error('Error al crear empleado:', err);
      setError(err.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <Sidebar 
        title="NEUSGI" 
        subtitle="Nuevo Empleado" 
      />

      <main className="content-area">
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Nuevo Empleado</h1>
                  <p className="page-subtitle">
                    Agregar un nuevo empleado al sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link 
                  to="/empleados"
                  className="button is-outlined"
                >
                  <span className="icon">
                    <ArrowLeft size={16} />
                  </span>
                  <span>Volver</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="card shadow-hover mb-4">
            <div className="card-content">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card shadow-hover">
          <div className="card-content">
            <form onSubmit={handleSubmit}>
              <div className="columns">
                {/* Información Personal */}
                <div className="column is-6">
                  <h3 className="title is-5 mb-4">
                    <span className="icon-text">
                      <span className="icon">
                        <UserCheck size={20} />
                      </span>
                      <span>Información Personal</span>
                    </span>
                  </h3>
                  
                  <div className="field">
                    <label className="label">Nombre *</label>
                    <div className="control">
                      <input
                        type="text"
                        name="nombre"
                        className="input"
                        placeholder="Nombre del empleado"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Apellido *</label>
                    <div className="control">
                      <input
                        type="text"
                        name="apellido"
                        className="input"
                        placeholder="Apellido del empleado"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">DNI *</label>
                    <div className="control">
                      <input
                        type="text"
                        name="dni"
                        className="input"
                        placeholder="Número de documento"
                        value={formData.dni}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Sexo</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          name="sexo"
                          value={formData.sexo}
                          onChange={handleInputChange}
                        >
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="column is-6">
                  <h3 className="title is-5 mb-4">
                    <span className="icon-text">
                      <span className="icon">
                        <UserCheck size={20} />
                      </span>
                      <span>Información Laboral</span>
                    </span>
                  </h3>
                  
                  <div className="field">
                    <label className="label">Tipo de Empleado *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          name="tipoEmpleadoId"
                          value={formData.tipoEmpleadoId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value={0}>Seleccionar tipo</option>
                          {tiposEmpleado.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Fecha de Ingreso</label>
                    <div className="control">
                      <input
                        type="date"
                        name="fechaIngreso"
                        className="input"
                        value={formData.fechaIngreso instanceof Date ? formData.fechaIngreso.toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Estado</label>
                    <div className="control">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={formData.activo}
                          onChange={handleInputChange}
                        />
                        <span className="ml-2">Empleado activo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="columns mt-4">
                <div className="column is-12">
                  <h3 className="title is-5 mb-4">
                    <span className="icon-text">
                      <span className="icon">
                        <UserCheck size={20} />
                      </span>
                      <span>Información de Contacto</span>
                    </span>
                  </h3>
                  
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Teléfono</label>
                        <div className="control">
                          <input
                            type="tel"
                            name="telefono"
                            className="input"
                            placeholder="Número de teléfono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Email</label>
                        <div className="control">
                          <input
                            type="email"
                            name="email"
                            className="input"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Dirección</label>
                    <div className="control">
                      <textarea
                        name="direccion"
                        className="textarea"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">URL de Imagen</label>
                    <div className="control">
                      <input
                        type="url"
                        name="imagen"
                        className="input"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={formData.imagen}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="help">Dejar vacío para usar imagen por defecto</p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="field is-grouped is-grouped-right mt-6">
                <div className="control">
                  <Link 
                    to="/empleados"
                    className="button is-outlined"
                  >
                    Cancelar
                  </Link>
                </div>
                <div className="control">
                  <button
                    type="submit"
                    className="button is-primary"
                    disabled={loading || loadingTipos}
                  >
                    <span className="icon">
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                    </span>
                    <span>
                      {loading ? 'Guardando...' : 'Guardar Empleado'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export { NuevoEmpleadoPage }; 