import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, RefreshCw, X, Filter } from 'lucide-react';
import { empleadoService } from '../../services/empleadoService';
import type { Empleado } from '../../types';
import { useAuth } from '../../stores/authStore';
import { Sidebar } from '../../components/layout';

const EmpleadosPage: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      cargarEmpleados();
    }
  }, [isAuthenticated]);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const data = await empleadoService.getAll();
      setEmpleados(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setErrorState('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await empleadoService.delete(id);
        alert('Empleado eliminado exitosamente');
        cargarEmpleados();
      } catch (err) {
        console.error('Error al eliminar empleado:', err);
        alert('Error al eliminar empleado');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorState(null);
    await cargarEmpleados();
    setRefreshing(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterActivo(e.target.value as 'todos' | 'activos' | 'inactivos');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterActivo('todos');
  };

  const getImagenEmpleado = (empleado: Empleado) => {
    if (empleado.imagen) {
      return empleado.imagen;
    }
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDULVubDSslUM2paQyy3UFhghYSAC4HzEQ1Q&s';
  };

  const empleadosFiltrados = (empleados || []).filter(empleado => {
    const cumpleBusqueda = 
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.tipoEmpleado?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const cumpleFiltro = 
      filterActivo === 'todos' ||
      (filterActivo === 'activos' && empleado.activo) ||
      (filterActivo === 'inactivos' && !empleado.activo);

    return cumpleBusqueda && cumpleFiltro;
  });

  return (
    <div className="main-container">
      <Sidebar 
        title="NEUSGI" 
        subtitle="Gestión de Empleados" 
      />

      <main className="content-area">
        <div className="page-header">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <div>
                  <h1 className="page-title">Empleados</h1>
                  <p className="page-subtitle">
                    Gestiona todos los empleados del sistema
                  </p>
                </div>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button 
                  className="button is-outlined mr-2"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Recargar datos"
                >
                  <span className="icon">
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  </span>
                  <span>{refreshing ? 'Actualizando...' : 'Recargar'}</span>
                </button>
                <Link 
                  to="/empleados/nuevo"
                  className="button is-primary"
                >
                  <span className="icon">
                    <Plus size={16} />
                  </span>
                  <span>Nuevo Empleado</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="card shadow-hover mb-4">
            <div className="card-content">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        )}

        {errorState && (
          <div className="card shadow-hover mb-4">
            <div className="card-content">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 bg-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                      <p className="text-sm text-red-700">{errorState}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="text-sm text-red-700 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => setErrorState(null)}
                      className="text-sm text-red-700 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !errorState && (
          <>
            <div className="card shadow-hover mb-4">
              <div className="card-content">
                <div className="columns">
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">
                        <span className="icon-text">
                          <span className="icon">
                            <Search size={16} />
                          </span>
                          <span>Buscar</span>
                        </span>
                      </label>
                      <div className="control">
                        <input
                          type="text"
                          className="input"
                          placeholder="Buscar por nombre, apellido, DNI o tipo..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="column is-3">
                    <div className="field">
                      <label className="label">
                        <span className="icon-text">
                          <span className="icon">
                            <Filter size={16} />
                          </span>
                          <span>Estado</span>
                        </span>
                      </label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={filterActivo}
                            onChange={handleFilterChange}
                          >
                            <option value="todos">Todos</option>
                            <option value="activos">Activos</option>
                            <option value="inactivos">Inactivos</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="column is-3">
                    <div className="field">
                      <label className="label">Acciones</label>
                      <div className="control">
                        <div className="buttons">
                          {(searchTerm || filterActivo !== 'todos') && (
                            <button
                              onClick={clearFilters}
                              className="button is-small is-outlined"
                            >
                              <span className="icon">
                                <X size={14} />
                              </span>
                              <span>Limpiar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-hover">
              <div className="card-content">
                <div className="table-container">
                  <table className="table is-fullwidth is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>DNI</th>
                        <th>Tipo</th>
                        <th>Contacto</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosFiltrados.map((empleado) => (
                        <tr key={empleado.id}>
                          <td>
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <img
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #e5e7eb'
                                  }}
                                  src={getImagenEmpleado(empleado)}
                                  alt={`${empleado.nombre} ${empleado.apellido}`}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/avatars/default-avatar.svg';
                                  }}
                                />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {empleado.nombre} {empleado.apellido}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {empleado.sexo}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-sm text-gray-900">{empleado.dni}</span>
                          </td>
                          <td>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {empleado.tipoEmpleado?.nombre || 'Sin tipo'}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm text-gray-900">
                              {empleado.telefono && (
                                <div>{empleado.telefono}</div>
                              )}
                              {empleado.email && (
                                <div className="text-gray-500">{empleado.email}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              empleado.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {empleado.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <Link
                                to={`/empleados/${empleado.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                to={`/empleados/${empleado.id}/editar`}
                                className="text-green-600 hover:text-green-900"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(empleado.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {empleadosFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm || filterActivo !== 'todos' 
                        ? 'No se encontraron empleados'
                        : 'No hay empleados registrados'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterActivo !== 'todos' 
                        ? 'No se encontraron empleados con los filtros aplicados.'
                        : 'Comienza agregando el primer empleado.'}
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      {!searchTerm && filterActivo === 'todos' && (
                        <Link
                          to="/empleados/nuevo"
                          className="button is-primary"
                        >
                          <span className="icon">
                            <Plus size={16} />
                          </span>
                          <span>Nuevo Empleado</span>
                        </Link>
                      )}
                      {(searchTerm || filterActivo !== 'todos') && (
                        <button
                          onClick={clearFilters}
                          className="button is-outlined"
                        >
                          <span className="icon">
                            <X size={16} />
                          </span>
                          <span>Limpiar Filtros</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="columns mt-6">
              <div className="column is-4">
                <div className="card shadow-hover">
                  <div className="card-content">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="heading">Total Empleados</p>
                            <p className="title">{empleados?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="icon is-large has-text-primary">
                            <UserCheck size={32} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="column is-4">
                <div className="card shadow-hover">
                  <div className="card-content">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="heading">Empleados Activos</p>
                            <p className="title has-text-success">
                              {(empleados || []).filter(e => e.activo).length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="icon is-large has-text-success">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="column is-4">
                <div className="card shadow-hover">
                  <div className="card-content">
                    <div className="level">
                      <div className="level-left">
                        <div className="level-item">
                          <div>
                            <p className="heading">Empleados Inactivos</p>
                            <p className="title has-text-danger">
                              {(empleados || []).filter(e => !e.activo).length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="level-right">
                        <div className="level-item">
                          <div className="icon is-large has-text-danger">
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                              <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export { EmpleadosPage }; 