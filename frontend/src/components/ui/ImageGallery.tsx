import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, StarOff } from 'lucide-react';
import type { EquipoImagen } from '../../types';

interface ImageGalleryProps {
  imagenes: EquipoImagen[];
  onImageUpdate?: (imagenes: EquipoImagen[]) => void;
  editable?: boolean;
  maxImages?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  imagenes = [],
  onImageUpdate,
  editable = false,
  maxImages = 10
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null && selectedImage < imagenes.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const toggleDestacada = (index: number) => {
    if (!editable || !onImageUpdate) return;

    const nuevasImagenes = imagenes.map((img, i) => ({
      ...img,
      destacada: i === index ? !img.destacada : false // Solo una puede ser destacada
    }));

    onImageUpdate(nuevasImagenes);
  };

  const removeImage = (index: number) => {
    if (!editable || !onImageUpdate) return;

    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    onImageUpdate(nuevasImagenes);
  };

  const getImagenDestacada = () => {
    return imagenes.find(img => img.destacada) || imagenes[0];
  };

  if (imagenes.length === 0) {
    return (
      <div className="has-text-centered py-4">
        <div className="icon is-large has-text-grey-light">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
        <p className="has-text-grey-light mt-2">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {/* Imagen destacada */}
      {getImagenDestacada() && (
        <div className="mb-4">
          <div className="image-container" style={{ position: 'relative' }}>
            <img
              src={getImagenDestacada().url}
              alt={getImagenDestacada().descripcion}
              className="image is-4by3"
              style={{ cursor: 'pointer', objectFit: 'cover' }}
              onClick={() => handleImageClick(imagenes.indexOf(getImagenDestacada()!))}
            />
            {editable && (
              <div className="image-actions" style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <button
                  className="button is-small is-danger"
                  onClick={() => removeImage(imagenes.indexOf(getImagenDestacada()!))}
                  title="Eliminar imagen"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="image-overlay" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              <span className="tag is-primary is-light">
                {getImagenDestacada().destacada ? 'Destacada' : 'Principal'}
              </span>
            </div>
          </div>
          <p className="has-text-centered mt-2">
            <strong>{getImagenDestacada().descripcion}</strong>
          </p>
        </div>
      )}

      {/* Galería de miniaturas */}
      {imagenes.length > 1 && (
        <div className="columns is-multiline">
          {imagenes.map((imagen, index) => (
            <div key={index} className="column is-2">
              <div className="image-container" style={{ position: 'relative' }}>
                <img
                  src={imagen.url}
                  alt={imagen.descripcion}
                  className="image is-square"
                  style={{ 
                    cursor: 'pointer', 
                    objectFit: 'cover',
                    border: imagen.destacada ? '2px solid #00d1b2' : '1px solid #dbdbdb'
                  }}
                  onClick={() => handleImageClick(index)}
                />
                
                {editable && (
                  <div className="image-actions" style={{ position: 'absolute', top: '4px', right: '4px' }}>
                    <button
                      className="button is-small is-danger"
                      onClick={() => removeImage(index)}
                      title="Eliminar imagen"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                <div className="image-overlay" style={{ position: 'absolute', bottom: '4px', left: '4px' }}>
                  <button
                    className={`button is-small ${imagen.destacada ? 'is-warning' : 'is-light'}`}
                    onClick={() => toggleDestacada(index)}
                    title={imagen.destacada ? 'Quitar destacada' : 'Marcar como destacada'}
                    disabled={!editable}
                  >
                    {imagen.destacada ? <Star size={12} /> : <StarOff size={12} />}
                  </button>
                </div>
              </div>
              <p className="has-text-centered mt-1 is-size-7">
                {imagen.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal para vista ampliada */}
      {isModalOpen && selectedImage !== null && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="box" style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
              <div className="image-viewer" style={{ position: 'relative' }}>
                <img
                  src={imagenes[selectedImage].url}
                  alt={imagenes[selectedImage].descripcion}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '80vh', 
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
                
                {/* Botones de navegación */}
                {imagenes.length > 1 && (
                  <>
                    <button
                      className="button is-rounded is-white"
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={prevImage}
                      disabled={selectedImage === 0}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="button is-rounded is-white"
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={nextImage}
                      disabled={selectedImage === imagenes.length - 1}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Botón de cerrar */}
                <button
                  className="button is-rounded is-white"
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                  onClick={closeModal}
                >
                  <X size={24} />
                </button>
                
                {/* Información de la imagen */}
                <div 
                  className="notification is-light"
                  style={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    left: '10px', 
                    right: '10px',
                    margin: 0
                  }}
                >
                  <p className="has-text-centered">
                    <strong>{imagenes[selectedImage].descripcion}</strong>
                    {imagenes[selectedImage].destacada && (
                      <span className="tag is-primary is-light ml-2">Destacada</span>
                    )}
                  </p>
                  <p className="has-text-centered is-size-7">
                    {selectedImage + 1} de {imagenes.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 