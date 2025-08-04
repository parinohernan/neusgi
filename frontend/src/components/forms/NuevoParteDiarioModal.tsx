import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { parteDiarioService } from '../../services/parteDiarioService';
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
  codigo: z.string().optional(),
});

type ParteDiarioFormData = z.infer<typeof parteDiarioSchema>;

interface NuevoParteDiarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuesto: Presupuesto | null;
  onSuccess: () => void;
}

export const NuevoParteDiarioModal: React.FC<NuevoParteDiarioModalProps> = ({
  isOpen,
  onClose,
  presupuesto,
  onSuccess
}) => {
  const { success, error } = useNotifications();
  
  const [conductores, setConductores] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<ParteDiarioFormData>({
    resolver: zodResolver(parteDiarioSchema),
    mode: 'onChange',
  });

  const kmInicial = watch('kmInicial');
  const kmFinal = watch('kmFinal');

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
      reset();
      setImageUrls([]);
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const [conductoresData, equiposData] = await Promise.all([
        empleadoService.getConductores(),
        equipoService.getAll(),
      ]);

      setConductores(conductoresData);
      setEquipos(equiposData.data || equiposData);
    } catch (err) {
      error('Error al cargar los datos');
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
      onSuccess();
      onClose();
    } catch (err) {
      error('Error al crear el parte diario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setValue('archivosAdjuntos', newUrls);
  };

  const addImageUrl = () => {
    const newUrls = [...imageUrls, ''];
    setImageUrls(newUrls);
    setValue('archivosAdjuntos', newUrls);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('archivosAdjuntos', newUrls);
  };

  if (!presupuesto) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Parte Diario"
      size="lg"
    >
      {/* Info del Presupuesto */}
      <div className="notification is-info is-light">
        <h4 className="title is-6 mb-2">Información del Presupuesto</h4>
        <div className="columns is-mobile">
          <div className="column">
            <p className="has-text-grey-dark is-size-7">Cliente</p>
            <p className="has-text-weight-medium">{presupuesto.cliente?.nombreEmpresa}</p>
          </div>
          <div className="column">
            <p className="has-text-grey-dark is-size-7">Orden de Compra</p>
            <p className="has-text-weight-medium">#{presupuesto.ordenCompra?.id}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="columns is-multiline">
          {/* Fecha */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Fecha *</label>
              <div className="control">
                <input
                  type="date"
                  className={`input ${errors.fecha ? 'is-danger' : ''}`}
                  {...register('fecha', { valueAsDate: true })}
                />
              </div>
              {errors.fecha && (
                <p className="help is-danger">{errors.fecha.message}</p>
              )}
            </div>
          </div>

          {/* Código */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Código</label>
              <div className="control">
                <input
                  type="text"
                  className={`input ${errors.codigo ? 'is-danger' : ''}`}
                  {...register('codigo')}
                  placeholder="PD-001"
                />
              </div>
              {errors.codigo && (
                <p className="help is-danger">{errors.codigo.message}</p>
              )}
            </div>
          </div>

          {/* Conductor */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Conductor</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    {...register('conductorId', { valueAsNumber: true })}
                  >
                    <option value="">Seleccionar conductor</option>
                    {conductores.map((conductor) => (
                      <option key={conductor.id} value={conductor.id}>
                        {conductor.nombre} {conductor.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.conductorId && (
                <p className="help is-danger">{errors.conductorId.message}</p>
              )}
            </div>
          </div>

          {/* Equipo */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Equipo</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    {...register('equipoId', { valueAsNumber: true })}
                  >
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

          {/* Combustible Consumido */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Combustible (litros)</label>
              <div className="control">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.combustibleConsumido ? 'is-danger' : ''}`}
                  {...register('combustibleConsumido', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              {errors.combustibleConsumido && (
                <p className="help is-danger">{errors.combustibleConsumido.message}</p>
              )}
            </div>
          </div>

          {/* Horas Trabajadas */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Horas Trabajadas</label>
              <div className="control">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.horasTrabajadas ? 'is-danger' : ''}`}
                  {...register('horasTrabajadas', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              {errors.horasTrabajadas && (
                <p className="help is-danger">{errors.horasTrabajadas.message}</p>
              )}
            </div>
          </div>

          {/* KM Inicial */}
          <div className="column is-6">
            <div className="field">
              <label className="label">KM Inicial</label>
              <div className="control">
                <input
                  type="number"
                  min="0"
                  className={`input ${errors.kmInicial ? 'is-danger' : ''}`}
                  {...register('kmInicial', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              {errors.kmInicial && (
                <p className="help is-danger">{errors.kmInicial.message}</p>
              )}
            </div>
          </div>

          {/* KM Final */}
          <div className="column is-6">
            <div className="field">
              <label className="label">KM Final</label>
              <div className="control">
                <input
                  type="number"
                  min="0"
                  className={`input ${errors.kmFinal ? 'is-danger' : ''}`}
                  {...register('kmFinal', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              {errors.kmFinal && (
                <p className="help is-danger">{errors.kmFinal.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* KM Recorridos (calculado automáticamente) */}
        {kmInicial && kmFinal && (
          <div className="notification is-success is-light">
            <p className="is-size-7">
              <strong>KM Recorridos calculados automáticamente:</strong> {kmFinal - kmInicial} km
            </p>
          </div>
        )}

        {/* Observaciones */}
        <div className="field">
          <label className="label">Observaciones</label>
          <div className="control">
            <textarea
              className={`textarea ${errors.observaciones ? 'is-danger' : ''}`}
              {...register('observaciones')}
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>
          {errors.observaciones && (
            <p className="help is-danger">{errors.observaciones.message}</p>
          )}
        </div>

        {/* URLs de Imágenes */}
        <div className="field">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <label className="label">URLs de Imágenes</label>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="button is-small is-info"
                >
                  <span className="icon is-small">
                    <Upload size={14} />
                  </span>
                  <span>Agregar URL</span>
                </button>
              </div>
            </div>
          </div>
          
          {(imageUrls || []).map((url, index) => (
            <div key={index} className="field has-addons">
              <div className="control is-expanded">
                <input
                  type="url"
                  className="input"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="control">
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="button is-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="field is-grouped is-grouped-right">
          <div className="control">
            <button
              type="button"
              onClick={onClose}
              className="button"
            >
              Cancelar
            </button>
          </div>
          <div className="control">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={`button is-primary ${submitting ? 'is-loading' : ''}`}
            >
              <span className="icon">
                <Save size={16} />
              </span>
              <span>{submitting ? 'Guardando...' : 'Guardar Parte Diario'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}; 