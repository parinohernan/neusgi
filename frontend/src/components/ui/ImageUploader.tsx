import React, { useState } from 'react';
import { Plus, Upload, X, Star, StarOff } from 'lucide-react';
import type { EquipoImagen } from '../../types';

interface ImageUploaderProps {
  imagenes: EquipoImagen[];
  onImagesChange: (imagenes: EquipoImagen[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagenes = [],
  onImagesChange,
  maxImages = 10
}) => {
  const [newImage, setNewImage] = useState({ descripcion: '', url: '' });
  const [showForm, setShowForm] = useState(false);

  const addImage = () => {
    if (!newImage.descripcion.trim() || !newImage.url.trim()) {
      return;
    }

    const imagen: EquipoImagen = {
      descripcion: newImage.descripcion.trim(),
      url: newImage.url.trim(),
      destacada: imagenes.length === 0 // La primera imagen será destacada por defecto
    };

    const nuevasImagenes = [...imagenes, imagen];
    onImagesChange(nuevasImagenes);
    
    setNewImage({ descripcion: '', url: '' });
    setShowForm(false);
  };

  const removeImage = (index: number) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    onImagesChange(nuevasImagenes);
  };

  const toggleDestacada = (index: number) => {
    const nuevasImagenes = imagenes.map((img, i) => ({
      ...img,
      destacada: i === index ? !img.destacada : false // Solo una puede ser destacada
    }));
    onImagesChange(nuevasImagenes);
  };

  const canAddMore = imagenes.length < maxImages;

  return (
    <div className="image-uploader">
      {/* Lista de imágenes existentes */}
      {imagenes.length > 0 && (
        <div className="mb-4">
          <h4 className="title is-6">Imágenes del equipo</h4>
          <div className="columns is-multiline">
            {imagenes.map((imagen, index) => (
              <div key={index} className="column is-3">
                <div className="card">
                  <div className="card-image">
                    <figure className="image is-4by3">
                      <img 
                        src={imagen.url} 
                        alt={imagen.descripcion}
                        style={{ objectFit: 'cover' }}
                      />
                    </figure>
                  </div>
                  <div className="card-content">
                    <div className="content">
                      <p className="is-size-7 has-text-weight-medium">{imagen.descripcion}</p>
                      <div className="level is-mobile">
                        <div className="level-left">
                          <div className="level-item">
                            <button
                              className={`button is-small ${imagen.destacada ? 'is-warning' : 'is-light'}`}
                              onClick={() => toggleDestacada(index)}
                              title={imagen.destacada ? 'Quitar destacada' : 'Marcar como destacada'}
                            >
                              {imagen.destacada ? <Star size={12} /> : <StarOff size={12} />}
                            </button>
                          </div>
                        </div>
                        <div className="level-right">
                          <div className="level-item">
                            <button
                              className="button is-small is-danger"
                              onClick={() => removeImage(index)}
                              title="Eliminar imagen"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {imagen.destacada && (
                        <span className="tag is-primary is-light is-size-7">Destacada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para agregar nueva imagen */}
      {canAddMore && (
        <div className="card">
          <div className="card-content">
            {!showForm ? (
              <button
                className="button is-fullwidth is-outlined"
                onClick={() => setShowForm(true)}
              >
                <span className="icon">
                  <Plus size={16} />
                </span>
                <span>Agregar imagen</span>
              </button>
            ) : (
              <div>
                <h4 className="title is-6">Nueva imagen</h4>
                
                <div className="field">
                  <label className="label">Descripción</label>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      placeholder="Ej: Vista frontal del camión"
                      value={newImage.descripcion}
                      onChange={(e) => setNewImage({ ...newImage, descripcion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">URL de la imagen</label>
                  <div className="control">
                    <input
                      type="url"
                      className="input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={newImage.url}
                      onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                    />
                  </div>
                  <p className="help">
                    Ingresa la URL de la imagen. Puede ser una imagen local o externa.
                  </p>
                </div>

                <div className="field is-grouped">
                  <div className="control">
                    <button
                      className="button is-primary"
                      onClick={addImage}
                      disabled={!newImage.descripcion.trim() || !newImage.url.trim()}
                    >
                      <span className="icon">
                        <Upload size={16} />
                      </span>
                      <span>Agregar</span>
                    </button>
                  </div>
                  <div className="control">
                    <button
                      className="button is-light"
                      onClick={() => {
                        setShowForm(false);
                        setNewImage({ descripcion: '', url: '' });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje cuando se alcanza el límite */}
      {!canAddMore && (
        <div className="notification is-warning is-light">
          <p>Has alcanzado el límite máximo de {maxImages} imágenes por equipo.</p>
        </div>
      )}

      {/* Información de ayuda */}
      <div className="notification is-info is-light mt-4">
        <h4 className="title is-6">Información sobre las imágenes</h4>
        <ul>
          <li>Puedes agregar hasta {maxImages} imágenes por equipo</li>
          <li>Una imagen debe ser marcada como <strong>destacada</strong></li>
          <li>La imagen destacada se mostrará como principal en la galería</li>
          <li>Las URLs pueden ser de imágenes locales o externas</li>
          <li>Formatos soportados: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
}; 