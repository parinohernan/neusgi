import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { ordenCompraService } from '../../services/ordenCompraService';
import { presupuestoService } from '../../services/presupuestoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { UpdateOrdenCompraDto, Presupuesto, OrdenCompra } from '../../types';

const ordenCompraSchema = z.object({
  presupuestoId: z.number().positive('Presupuesto es requerido'),
  fechaInicio: z.string().min(1, 'Fecha de inicio es requerida'),
  fechaFin: z.string().min(1, 'Fecha de fin es requerida'),
  origen: z.string().min(1, 'Origen es requerido').max(100, 'Origen máximo 100 caracteres'),
  destino: z.string().min(1, 'Destino es requerido').max(100, 'Destino máximo 100 caracteres'),
  observaciones: z.string().optional(),
  documentos: z.array(z.string().url('URL inválida')).optional(),
  imagenes: z.array(z.string().url('URL inválida')).optional(),
});

type OrdenCompraFormData = z.infer<typeof ordenCompraSchema>;

export const EditarOrdenCompraPage: React.FC = () => {
  const navigate = useNavigate();
  const { presupuestoId } = useParams<{ presupuestoId: string }>();
  const { success, error } = useNotifications();
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [ordenCompra, setOrdenCompra] = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevoDocumento, setNuevoDocumento] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<OrdenCompraFormData>({
    resolver: zodResolver(ordenCompraSchema),
    mode: 'onChange',
  });

  // Cargar datos del presupuesto y orden de compra
  useEffect(() => {
    const cargarDatos = async () => {
      if (!presupuestoId) return;
      
      try {
        setLoading(true);
        const presupuestoData = await presupuestoService.getById(parseInt(presupuestoId));
        setPresupuesto(presupuestoData);
        
        if (presupuestoData.ordenCompra) {
          setOrdenCompra(presupuestoData.ordenCompra);
          setDocumentos(presupuestoData.ordenCompra.documentos || []);
          setImagenes(presupuestoData.ordenCompra.imagenes || []);
          
          // Pre-llenar el formulario
          setValue('presupuestoId', parseInt(presupuestoId));
          setValue('fechaInicio', presupuestoData.ordenCompra.fechaInicio.toISOString().slice(0, 16));
          setValue('fechaFin', presupuestoData.ordenCompra.fechaFin.toISOString().slice(0, 16));
          setValue('origen', presupuestoData.ordenCompra.origen);
          setValue('destino', presupuestoData.ordenCompra.destino);
          setValue('observaciones', presupuestoData.ordenCompra.observaciones || '');
        }
      } catch (err) {
        error('Error al cargar los datos');
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [presupuestoId, setValue, error]);

  // Validar fechas
  const fechaInicio = watch('fechaInicio');
  const fechaFin = watch('fechaFin');

  useEffect(() => {
    if (fechaInicio && fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
      setValue('fechaFin', '');
    }
  }, [fechaInicio, fechaFin, setValue]);

  const agregarDocumento = () => {
    if (nuevoDocumento.trim() && !documentos.includes(nuevoDocumento.trim())) {
      setDocumentos([...documentos, nuevoDocumento.trim()]);
      setNuevoDocumento('');
    }
  };

  const eliminarDocumento = (index: number) => {
    setDocumentos(documentos.filter((_, i) => i !== index));
  };

  const agregarImagen = () => {
    if (nuevaImagen.trim() && !imagenes.includes(nuevaImagen.trim())) {
      setImagenes([...imagenes, nuevaImagen.trim()]);
      setNuevaImagen('');
    }
  };

  const eliminarImagen = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: OrdenCompraFormData) => {
    if (!ordenCompra) return;
    
    try {
      setLoading(true);
      
      const ordenCompraData: UpdateOrdenCompraDto = {
        presupuestoId: parseInt(presupuestoId!),
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        origen: data.origen,
        destino: data.destino,
        observaciones: data.observaciones,
        documentos: documentos.length > 0 ? documentos : undefined,
        imagenes: imagenes.length > 0 ? imagenes : undefined,
      };

      await ordenCompraService.update(ordenCompra.id, ordenCompraData);
      success('Orden de compra actualizada exitosamente');
      navigate(`/presupuestos/${presupuestoId}`);
    } catch (err) {
      error('Error al actualizar la orden de compra');
      console.error('Error actualizando orden de compra:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/presupuestos/${presupuestoId}`);
  };

  if (loading && !presupuesto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="has-text-centered">
          <div className="spinner"></div>
          <p className="mt-3">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="notification is-danger">
          <p>Presupuesto no encontrado</p>
        </div>
      </div>
    );
  }

  if (!ordenCompra) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="notification is-warning">
          <p>No se encontró una orden de compra para este presupuesto</p>
          <button className="button is-primary mt-3" onClick={() => navigate(`/presupuestos/${presupuestoId}/orden-compra/nueva`)}>
            Crear Nueva Orden de Compra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="columns">
        <div className="column is-8 is-offset-2">
          {/* Header */}
          <div className="level mb-6">
            <div className="level-left">
              <div className="level-item">
                <button
                  className="button is-light"
                  onClick={handleCancel}
                >
                  <span className="icon">
                    <ArrowLeft size={16} />
                  </span>
                  <span>Volver</span>
                </button>
              </div>
              <div className="level-item">
                <h1 className="title is-4 mb-0">Editar Orden de Compra</h1>
              </div>
            </div>
          </div>

          {/* Información del Presupuesto */}
          <div className="box mb-6">
            <h2 className="title is-5 mb-4">Información del Presupuesto</h2>
            <div className="columns">
              <div className="column is-6">
                <p><strong>Cliente:</strong> {presupuesto.cliente?.nombreEmpresa}</p>
                <p><strong>Contacto:</strong> {presupuesto.usuario?.nombre}</p>
                <p><strong>Email:</strong> {presupuesto.usuario?.email}</p>
              </div>
              <div className="column is-6">
                <p><strong>Descripción:</strong> {presupuesto.descripcion}</p>
                <p><strong>Costo:</strong> ${presupuesto.costo.toLocaleString()}</p>
                <p><strong>Estado:</strong> {presupuesto.estado}</p>
              </div>
            </div>
          </div>

          {/* Información de la Orden de Compra */}
          <div className="box mb-6">
            <h2 className="title is-5 mb-4">Información de la Orden de Compra</h2>
            <div className="columns">
              <div className="column is-6">
                <p><strong>ID:</strong> {ordenCompra.id}</p>
                <p><strong>Estado:</strong> {ordenCompra.estado}</p>
                <p><strong>Creada:</strong> {new Date(ordenCompra.creadoEn).toLocaleDateString()}</p>
              </div>
              <div className="column is-6">
                <p><strong>Fecha Inicio:</strong> {new Date(ordenCompra.fechaInicio).toLocaleDateString()}</p>
                <p><strong>Fecha Fin:</strong> {new Date(ordenCompra.fechaFin).toLocaleDateString()}</p>
                <p><strong>Origen → Destino:</strong> {ordenCompra.origen} → {ordenCompra.destino}</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="box">
            <div className="columns">
              <div className="column is-6">
                <div className="field">
                  <label className="label">Fecha de Inicio *</label>
                  <div className="control">
                    <input
                      type="datetime-local"
                      className={`input ${errors.fechaInicio ? 'is-danger' : ''}`}
                      {...register('fechaInicio')}
                    />
                  </div>
                  {errors.fechaInicio && (
                    <p className="help is-danger">{errors.fechaInicio.message}</p>
                  )}
                </div>
              </div>
              <div className="column is-6">
                <div className="field">
                  <label className="label">Fecha de Fin *</label>
                  <div className="control">
                    <input
                      type="datetime-local"
                      className={`input ${errors.fechaFin ? 'is-danger' : ''}`}
                      {...register('fechaFin')}
                    />
                  </div>
                  {errors.fechaFin && (
                    <p className="help is-danger">{errors.fechaFin.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="columns">
              <div className="column is-6">
                <div className="field">
                  <label className="label">Origen *</label>
                  <div className="control">
                    <input
                      type="text"
                      className={`input ${errors.origen ? 'is-danger' : ''}`}
                      placeholder="Ciudad de origen"
                      {...register('origen')}
                    />
                  </div>
                  {errors.origen && (
                    <p className="help is-danger">{errors.origen.message}</p>
                  )}
                </div>
              </div>
              <div className="column is-6">
                <div className="field">
                  <label className="label">Destino *</label>
                  <div className="control">
                    <input
                      type="text"
                      className={`input ${errors.destino ? 'is-danger' : ''}`}
                      placeholder="Ciudad de destino"
                      {...register('destino')}
                    />
                  </div>
                  {errors.destino && (
                    <p className="help is-danger">{errors.destino.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Observaciones</label>
              <div className="control">
                <textarea
                  className={`textarea ${errors.observaciones ? 'is-danger' : ''}`}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  {...register('observaciones')}
                />
              </div>
              {errors.observaciones && (
                <p className="help is-danger">{errors.observaciones.message}</p>
              )}
            </div>

            {/* Documentos */}
            <div className="field">
              <label className="label">Documentos (URLs)</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input
                    type="url"
                    className="input"
                    placeholder="https://ejemplo.com/documento.pdf"
                    value={nuevoDocumento}
                    onChange={(e) => setNuevoDocumento(e.target.value)}
                  />
                </div>
                <div className="control">
                  <button
                    type="button"
                    className="button is-info"
                    onClick={agregarDocumento}
                  >
                    <span className="icon">
                      <Upload size={16} />
                    </span>
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
              
              {documentos.length > 0 && (
                <div className="mt-3">
                  {documentos.map((doc, index) => (
                    <div key={index} className="notification is-light is-small">
                      <button
                        type="button"
                        className="delete is-small"
                        onClick={() => eliminarDocumento(index)}
                      />
                      <a href={doc} target="_blank" rel="noopener noreferrer">
                        {doc}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Imágenes */}
            <div className="field">
              <label className="label">Imágenes (URLs)</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input
                    type="url"
                    className="input"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={nuevaImagen}
                    onChange={(e) => setNuevaImagen(e.target.value)}
                  />
                </div>
                <div className="control">
                  <button
                    type="button"
                    className="button is-info"
                    onClick={agregarImagen}
                  >
                    <span className="icon">
                      <Upload size={16} />
                    </span>
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
              
              {imagenes.length > 0 && (
                <div className="mt-3">
                  {imagenes.map((img, index) => (
                    <div key={index} className="notification is-light is-small">
                      <button
                        type="button"
                        className="delete is-small"
                        onClick={() => eliminarImagen(index)}
                      />
                      <a href={img} target="_blank" rel="noopener noreferrer">
                        {img}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="field is-grouped is-grouped-right">
              <div className="control">
                <button
                  type="button"
                  className="button is-light"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
              <div className="control">
                <button
                  type="submit"
                  className={`button is-primary ${loading ? 'is-loading' : ''}`}
                  disabled={!isValid || loading}
                >
                  <span className="icon">
                    <Save size={16} />
                  </span>
                  <span>Actualizar Orden de Compra</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 