import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useNotifications } from '../../hooks/useNotifications';
import { remitoService } from '../../services/remitoService';
import { empleadoService } from '../../services/empleadoService';
import { equipoService } from '../../services/equipoService';
import type { Presupuesto, Empleado, Equipo } from '../../types';

// Esquema de validación para el formulario
const remitoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  contenido: z.string().min(1, 'El contenido es requerido'),
  observaciones: z.string().optional(),
  conductorId: z.number().optional(),
  equipoId: z.number().optional(),
  archivosAdjuntos: z.array(z.string().url('Debe ser una URL válida')).optional(),
});

type RemitoFormData = z.infer<typeof remitoSchema>;

interface NuevoRemitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuesto: Presupuesto | null;
  onSuccess: () => void;
}

export const NuevoRemitoModal: React.FC<NuevoRemitoModalProps> = ({
  isOpen,
  onClose,
  presupuesto,
  onSuccess
}) => {
  const [conductores, setConductores] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { success, error } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<RemitoFormData>({
    resolver: zodResolver(remitoSchema),
    mode: 'onChange',
  });

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
      setEquipos(equiposData.data);
    } catch (err) {
      error('Error al cargar datos');
    }
  };

  const onSubmit = async (data: RemitoFormData) => {
    if (!presupuesto?.ordenCompra?.id) {
      error('No se encontró la orden de compra');
      return;
    }

    setSubmitting(true);
    try {
      const remitoData = {
        ...data,
        ordenCompraId: presupuesto.ordenCompra.id,
        archivosAdjuntos: imageUrls.filter(url => url.trim() !== ''),
      };

      await remitoService.create(remitoData);
      success('Remito creado exitosamente');
      onSuccess();
      onClose();
    } catch (err) {
      error('Error al crear el remito');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Remito" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Información del presupuesto */}
        {presupuesto && (
          <div className="notification is-info is-light">
            <p><strong>Cliente:</strong> {presupuesto.cliente?.nombreEmpresa}</p>
            <p><strong>Descripción:</strong> {presupuesto.descripcion}</p>
          </div>
        )}

        {/* Código */}
        <div className="field">
          <label className="label">Código del Remito</label>
          <div className="control">
            <input
              type="text"
              className={`input ${errors.codigo ? 'is-danger' : ''}`}
              {...register('codigo')}
              placeholder="RE-001"
            />
          </div>
          {errors.codigo && (
            <p className="help is-danger">{errors.codigo.message}</p>
          )}
        </div>

        {/* Contenido */}
        <div className="field">
          <label className="label">Contenido</label>
          <div className="control">
            <textarea
              className={`textarea ${errors.contenido ? 'is-danger' : ''}`}
              {...register('contenido')}
              rows={4}
              placeholder="Descripción del contenido del remito..."
            />
          </div>
          {errors.contenido && (
            <p className="help is-danger">{errors.contenido.message}</p>
          )}
        </div>

        {/* Conductor y Equipo */}
        <div className="columns">
          {/* Conductor */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Conductor</label>
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
              {errors.conductorId && (
                <p className="help is-danger">{errors.conductorId.message}</p>
              )}
            </div>
          </div>

          {/* Equipo */}
          <div className="column is-6">
            <div className="field">
              <label className="label">Equipo</label>
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
              {errors.equipoId && (
                <p className="help is-danger">{errors.equipoId.message}</p>
              )}
            </div>
          </div>
        </div>

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
              <span>{submitting ? 'Guardando...' : 'Guardar Remito'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}; 