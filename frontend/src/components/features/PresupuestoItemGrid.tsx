import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import type { PresupuestoItem } from '../../types';

interface PresupuestoItemGridProps {
  items: PresupuestoItem[];
  onItemsChange: (items: PresupuestoItem[]) => void;
  presupuestoId?: number;
}

interface ItemFormData {
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  observaciones: string;
}

export const PresupuestoItemGrid: React.FC<PresupuestoItemGridProps> = ({
  items,
  onItemsChange,
  presupuestoId
}) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    descripcion: '',
    cantidad: 1,
    unidad: 'días',
    precioUnitario: 0,
    observaciones: ''
  });

  const unidades = ['días', 'horas', 'km', 'unidades', 'metros', 'litros'];

  const calculateTotal = (cantidad: number, precioUnitario: number) => {
    return cantidad * precioUnitario;
  };

  const handleAddItem = () => {
    if (!formData.descripcion.trim() || formData.precioUnitario < 0) {
      return;
    }

    const newItem: PresupuestoItem = {
      id: Date.now(), // ID temporal para el frontend
      presupuestoId: presupuestoId || 0,
      numero: items.length + 1,
      descripcion: formData.descripcion.trim(),
      cantidad: formData.cantidad,
      unidad: formData.unidad,
      precioUnitario: formData.precioUnitario,
      precioTotal: calculateTotal(formData.cantidad, formData.precioUnitario),
      observaciones: formData.observaciones.trim()
    };

    onItemsChange([...items, newItem]);
    setFormData({
      descripcion: '',
      cantidad: 1,
      unidad: 'días',
      precioUnitario: 0,
      observaciones: ''
    });
    setIsAddingItem(false);
  };

  const handleEditItem = (id: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setFormData({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidad: item.unidad,
        precioUnitario: item.precioUnitario,
        observaciones: item.observaciones || ''
      });
      setEditingItem(id);
    }
  };

  const handleUpdateItem = () => {
    if (!editingItem || !formData.descripcion.trim() || formData.precioUnitario < 0) {
      return;
    }

    const updatedItems = items.map(item => 
      item.id === editingItem 
        ? {
            ...item,
            descripcion: formData.descripcion.trim(),
            cantidad: formData.cantidad,
            unidad: formData.unidad,
            precioUnitario: formData.precioUnitario,
            precioTotal: calculateTotal(formData.cantidad, formData.precioUnitario),
            observaciones: formData.observaciones.trim()
          }
        : item
    );

    onItemsChange(updatedItems);
    setFormData({
      descripcion: '',
      cantidad: 1,
      unidad: 'días',
      precioUnitario: 0,
      observaciones: ''
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    // Renumerar los items
    const renumberedItems = updatedItems.map((item, index) => ({
      ...item,
      numero: index + 1
    }));
    onItemsChange(renumberedItems);
  };

  const handleCancel = () => {
    setFormData({
      descripcion: '',
      cantidad: 1,
      unidad: 'días',
      precioUnitario: 0,
      observaciones: ''
    });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const totalPresupuesto = items.reduce((sum, item) => sum + item.precioTotal, 0);

  return (
    <div className="presupuesto-item-grid">
      {/* Header */}
      <div className="level mb-4">
        <div className="level-left">
          <div className="level-item">
            <h3 className="title is-5">Items del Presupuesto</h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button
              className="button is-primary is-small"
              onClick={() => setIsAddingItem(true)}
              disabled={isAddingItem || editingItem !== null}
            >
              <span className="icon">
                <Plus size={16} />
              </span>
              <span>Agregar Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulario para agregar/editar item */}
      {(isAddingItem || editingItem !== null) && (
        <div className="card mb-4">
          <div className="card-content">
            <h4 className="title is-6 mb-3">
              {isAddingItem ? 'Agregar Nuevo Item' : 'Editar Item'}
            </h4>
            
            <div className="columns">
              <div className="column is-6">
                <div className="field">
                  <label className="label">Descripción *</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      placeholder="Descripción del servicio o producto"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="column is-6">
                <div className="columns">
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Cantidad *</label>
                      <div className="control">
                        <input
                          className="input"
                          type="number"
                          value={formData.cantidad}
                          onChange={(e) => setFormData({...formData, cantidad: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="column is-6">
                    <div className="field">
                      <label className="label">Unidad *</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={formData.unidad}
                            onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                          >
                            {unidades.map(unidad => (
                              <option key={unidad} value={unidad}>{unidad}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">Precio Unitario *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="number"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({...formData, precioUnitario: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">Observaciones</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      placeholder="Observaciones adicionales"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <button className="button is-light" onClick={handleCancel}>
                  Cancelar
                </button>
              </p>
              <p className="control">
                <button
                  className="button is-primary"
                  onClick={isAddingItem ? handleAddItem : handleUpdateItem}
                  disabled={!formData.descripcion.trim() || formData.precioUnitario < 0}
                >
                  {isAddingItem ? 'Agregar' : 'Actualizar'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de items */}
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>#</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Precio Unitario</th>
              <th>Precio Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="has-text-centered has-text-grey">
                  No hay items agregados
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.numero}</td>
                  <td>
                    <div>
                      <strong>{item.descripcion}</strong>
                      {item.observaciones && (
                        <p className="has-text-grey is-size-7 mt-1">{item.observaciones}</p>
                      )}
                    </div>
                  </td>
                  <td>{item.cantidad}</td>
                  <td>{item.unidad}</td>
                  <td>${item.precioUnitario.toFixed(2)}</td>
                  <td><strong>${item.precioTotal.toFixed(2)}</strong></td>
                  <td>
                    <div className="buttons are-small">
                      <button
                        className="button is-info is-light"
                        onClick={() => handleEditItem(item.id)}
                        disabled={isAddingItem || editingItem !== null}
                      >
                        <span className="icon">
                          <Edit size={12} />
                        </span>
                      </button>
                      <button
                        className="button is-danger is-light"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isAddingItem || editingItem !== null}
                      >
                        <span className="icon">
                          <Trash2 size={12} />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} className="has-text-right">
                  <strong>Total del Presupuesto:</strong>
                </td>
                <td>
                  <strong className="has-text-primary">${totalPresupuesto.toFixed(2)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}; 