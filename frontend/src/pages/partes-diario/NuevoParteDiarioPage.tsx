import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { parteDiarioService } from '../../services/parteDiarioService';
import { presupuestoService } from '../../services/presupuestoService';
import { empleadoService } from '../../services/empleadoService';
import { equipoService } from '../../services/equipoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Presupuesto, Empleado, Equipo } from '../../types';

const parteDiarioSchema = z.object({
  fecha: z.date(),
  conductorId: z.number().optional(),
  equipoId: z.number().optional(),
  observaciones: z.string().optional(),
  archivosAdjuntos: z.array(z.string().url()).optional(),
  combustibleConsumido: z.number().min(0).optional(),
  horasTrabajadas: z.number().min(0).optional(),
  kmFinal: z.number().min(0).optional(),
  kmInicial: z.number().min(0).optional(),
});

type ParteDiarioFormData = z.infer<typeof parteDiarioSchema>;

export const NuevoParteDiarioPage: React.FC = () => {
  const { presupuestoId } = useParams<{ presupuestoId: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [conductores, setConductores] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ParteDiarioFormData>({
    resolver: zodResolver(parteDiarioSchema),
    mode: 'onChange',
  });

  const kmInicial = watch('kmInicial');
  const kmFinal = watch('kmFinal');

  useEffect(() => {
    if (presupuestoId) {
      cargarDatos();
    }
  }, [presupuestoId]);

  const cargarDatos = async () => {
    if (!presupuestoId) return;
    
    setLoading(true);
    try {
      const [presupuestoData, conductoresData, equiposData] = await Promise.all([
        presupuestoService.getById(parseInt(presupuestoId)),
        empleadoService.getConductores(),
        equipoService.getAll(),
      ]);

      setPresupuesto(presupuestoData);
      setConductores(conductoresData);
      setEquipos(equiposData.data || equiposData);
    } catch (err) {
      error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ParteDiarioFormData) => {
    if (!presupuesto?.ordenCompra?.id) {
      error('El presupuesto no tiene una orden de compra asociada');
      return;
    }

    setSubmitting(true);
    try {
      const parteDiarioData = {
        ...data,
        ordenCompraId: presupuesto.ordenCompra.id,
        archivosAdjuntos: data.archivosAdjuntos || [],
      };

      await parteDiarioService.create(parteDiarioData);
      success('Parte diario creado exitosamente');
      navigate(`/presupuestos/${presupuestoId}`);
    } catch (err) {
      error('Error al crear el parte diario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const currentUrls = watch('archivosAdjuntos') || [];
    const newUrls = [...currentUrls];
    newUrls[index] = value;
    setValue('archivosAdjuntos', newUrls);
  };

  const addImageUrl = () => {
    const currentUrls = watch('archivosAdjuntos') || [];
    setValue('archivosAdjuntos', [...currentUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const currentUrls = watch('archivosAdjuntos') || [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    setValue('archivosAdjuntos', newUrls);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Presupuesto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/presupuestos/${presupuestoId}`)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Parte Diario</h1>
          </div>
        </div>

        {/* Info del Presupuesto */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Información del Presupuesto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Cliente</p>
              <p className="font-medium">{presupuesto.cliente?.nombreEmpresa}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Descripción</p>
              <p className="font-medium">{presupuesto.descripcion}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Estado</p>
              <p className="font-medium capitalize">{presupuesto.estado}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Orden de Compra</p>
              <p className="font-medium">#{presupuesto.ordenCompra?.id}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Datos del Parte Diario</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  {...register('fecha', { valueAsDate: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                )}
              </div>

              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductor
                </label>
                <select
                  {...register('conductorId', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar conductor</option>
                  {conductores.map((conductor) => (
                    <option key={conductor.id} value={conductor.id}>
                      {conductor.nombre} {conductor.apellido}
                    </option>
                  ))}
                </select>
                {errors.conductorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.conductorId.message}</p>
                )}
              </div>

              {/* Equipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipo
                </label>
                <select
                  {...register('equipoId', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar equipo</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.patente} - {equipo.modelo}
                    </option>
                  ))}
                </select>
                {errors.equipoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.equipoId.message}</p>
                )}
              </div>

              {/* Combustible Consumido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Combustible Consumido (litros)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('combustibleConsumido', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.combustibleConsumido && (
                  <p className="mt-1 text-sm text-red-600">{errors.combustibleConsumido.message}</p>
                )}
              </div>

              {/* Horas Trabajadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Trabajadas
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('horasTrabajadas', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.horasTrabajadas && (
                  <p className="mt-1 text-sm text-red-600">{errors.horasTrabajadas.message}</p>
                )}
              </div>

              {/* KM Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KM Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('kmInicial', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.kmInicial && (
                  <p className="mt-1 text-sm text-red-600">{errors.kmInicial.message}</p>
                )}
              </div>

              {/* KM Final */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KM Final
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('kmFinal', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                {errors.kmFinal && (
                  <p className="mt-1 text-sm text-red-600">{errors.kmFinal.message}</p>
                )}
              </div>
            </div>

            {/* KM Recorridos (calculado automáticamente) */}
            {kmInicial && kmFinal && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <strong>KM Recorridos calculados automáticamente:</strong> {kmFinal - kmInicial} km
                </p>
              </div>
            )}

            {/* Observaciones */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                {...register('observaciones')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones adicionales..."
              />
              {errors.observaciones && (
                <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>
              )}
            </div>

            {/* URLs de Imágenes */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  URLs de Imágenes
                </label>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Upload size={16} />
                  <span>Agregar URL</span>
                </button>
              </div>
              
              {(watch('archivosAdjuntos') || []).map((url, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/presupuestos/${presupuestoId}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              <span>{submitting ? 'Guardando...' : 'Guardar Parte Diario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 