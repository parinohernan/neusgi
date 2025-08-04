import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { certificadoService } from '../../services/certificadoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { CreateCertificadoDto } from '../../types';

const certificadoSchema = z.object({
  ordenCompraId: z.number(),
  tipo: z.enum(['seguro', 'habilitacion', 'otros']),
  codigo: z.string().min(1, 'El código es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  observaciones: z.string().optional(),
});

interface NuevoCertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordenCompraId: number;
  onSuccess?: () => void;
}

export const NuevoCertificadoModal: React.FC<NuevoCertificadoModalProps> = ({
  isOpen,
  onClose,
  ordenCompraId,
  onSuccess
}) => {
  const { success, error } = useNotifications();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(certificadoSchema),
    defaultValues: {
      ordenCompraId,
      tipo: 'seguro'
    }
  });

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      const certificadoData: CreateCertificadoDto = {
        ...data,
        ordenCompraId,
        archivosAdjuntos: imageUrls.length > 0 ? imageUrls : undefined,
        fechaVencimiento: new Date(data.fechaVencimiento)
      };

      await certificadoService.create(certificadoData);
      success('Certificado creado exitosamente');
      reset();
      setImageUrls([]);
      setNewImageUrl('');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Error al crear el certificado');
    }
  };

  const handleClose = () => {
    reset();
    setImageUrls([]);
    setNewImageUrl('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="Nuevo Certificado">
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Nuevo Certificado</p>
          <button className="delete" aria-label="close" onClick={handleClose}></button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="modal-card-body">
            <div className="columns is-multiline">
              {/* Tipo de Certificado */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Tipo de Certificado *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select {...register('tipo')}>
                        <option value="seguro">Seguro</option>
                        <option value="habilitacion">Habilitación</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                  </div>
                  {errors.tipo && (
                    <p className="help is-danger">{errors.tipo.message}</p>
                  )}
                </div>
              </div>

              {/* Código */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Código *</label>
                  <div className="control">
                    <input
                      className={`input ${errors.codigo ? 'is-danger' : ''}`}
                      type="text"
                      placeholder="CERT-001"
                      {...register('codigo')}
                    />
                  </div>
                  {errors.codigo && (
                    <p className="help is-danger">{errors.codigo.message}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="column is-12">
                <div className="field">
                  <label className="label">Descripción *</label>
                  <div className="control">
                    <textarea
                      className={`textarea ${errors.descripcion ? 'is-danger' : ''}`}
                      placeholder="Descripción del certificado..."
                      {...register('descripcion')}
                    />
                  </div>
                  {errors.descripcion && (
                    <p className="help is-danger">{errors.descripcion.message}</p>
                  )}
                </div>
              </div>

              {/* Fecha de Vencimiento */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Fecha de Vencimiento *</label>
                  <div className="control">
                    <input
                      className={`input ${errors.fechaVencimiento ? 'is-danger' : ''}`}
                      type="date"
                      {...register('fechaVencimiento')}
                    />
                  </div>
                  {errors.fechaVencimiento && (
                    <p className="help is-danger">{errors.fechaVencimiento.message}</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Observaciones</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Observaciones adicionales..."
                      {...register('observaciones')}
                    />
                  </div>
                </div>
              </div>

              {/* Archivos Adjuntos */}
              <div className="column is-12">
                <div className="field">
                  <label className="label">Archivos Adjuntos</label>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input
                        className="input"
                        type="url"
                        placeholder="https://ejemplo.com/documento.pdf"
                        value={newImageUrl}
                        onChange={handleImageUrlChange}
                      />
                    </div>
                    <div className="control">
                      <button
                        type="button"
                        className="button is-info"
                        onClick={addImageUrl}
                      >
                        <span className="icon is-small">
                          <Plus size={16} />
                        </span>
                        <span>Agregar URL</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de URLs */}
                {imageUrls.length > 0 && (
                  <div className="field">
                    <div className="control">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="box mb-2">
                          <div className="level">
                            <div className="level-left">
                              <div className="level-item">
                                <span className="is-size-7 has-text-grey">
                                  {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                                </span>
                              </div>
                            </div>
                            <div className="level-right">
                              <div className="level-item">
                                <button
                                  type="button"
                                  className="button is-small is-danger"
                                  onClick={() => removeImageUrl(index)}
                                >
                                  <span className="icon is-small">
                                    <Trash2 size={12} />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="modal-card-foot">
            <button
              type="submit"
              className={`button is-success ${isSubmitting ? 'is-loading' : ''}`}
              disabled={isSubmitting}
            >
              Guardar Certificado
            </button>
            <button
              type="button"
              className="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </footer>
        </form>
      </div>
    </Modal>
  );
}; 