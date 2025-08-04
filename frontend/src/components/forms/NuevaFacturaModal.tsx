import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { facturaService } from '../../services/facturaService';
import { presupuestoService } from '../../services/presupuestoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { CreateFacturaDto, PresupuestoItem } from '../../types';

const facturaSchema = z.object({
  ordenCompraId: z.number(),
  numeroFactura: z.string().min(1, 'El número de factura es requerido'),
  fechaEmision: z.string().min(1, 'La fecha de emisión es requerida'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  concepto: z.string().min(1, 'El concepto es requerido'),
  observaciones: z.string().optional(),
});

interface NuevaFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoId: number;
  onSuccess?: () => void;
}

interface FacturaItemForm {
  numero: number;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  precioTotal: number;
  observaciones?: string;
}

export const NuevaFacturaModal: React.FC<NuevaFacturaModalProps> = ({
  isOpen,
  onClose,
  presupuestoId,
  onSuccess
}) => {
  const { success, error } = useNotifications();
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [items, setItems] = useState<FacturaItemForm[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      ordenCompraId: 0,
      numeroFactura: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      concepto: '',
      observaciones: ''
    }
  });

  const ordenCompraId = watch('ordenCompraId');

  // Cargar datos del presupuesto
  useEffect(() => {
    if (isOpen && presupuestoId) {
      cargarPresupuesto();
    }
  }, [isOpen, presupuestoId]);

  const cargarPresupuesto = async () => {
    try {
      setLoading(true);
      const presupuestoData = await presupuestoService.getById(presupuestoId);
      setPresupuesto(presupuestoData);
      
      // Establecer ordenCompraId si existe
      if (presupuestoData.ordenCompra?.id) {
        setValue('ordenCompraId', presupuestoData.ordenCompra.id);
      }

      // Cargar items del presupuesto
      if (presupuestoData.items && presupuestoData.items.length > 0) {
        const itemsForm: FacturaItemForm[] = presupuestoData.items.map((item: PresupuestoItem, index: number) => ({
          numero: index + 1,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          unidad: item.unidad,
          precioUnitario: item.precioUnitario,
          precioTotal: item.precioTotal,
          observaciones: item.observaciones
        }));
        setItems(itemsForm);
      }
    } catch (err) {
      error('Error al cargar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = () => {
    const nuevoItem: FacturaItemForm = {
      numero: items.length + 1,
      descripcion: '',
      cantidad: 1,
      unidad: 'unidad',
      precioUnitario: 0,
      precioTotal: 0,
      observaciones: ''
    };
    setItems([...items, nuevoItem]);
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    // Renumerar items
    const itemsRenumerados = nuevosItems.map((item, i) => ({
      ...item,
      numero: i + 1
    }));
    setItems(itemsRenumerados);
  };

  const editarItem = (index: number) => {
    setEditingItem(index);
  };

  const guardarItem = (index: number, itemData: FacturaItemForm) => {
    const nuevosItems = [...items];
    nuevosItems[index] = {
      ...itemData,
      precioTotal: itemData.cantidad * itemData.precioUnitario
    };
    setItems(nuevosItems);
    setEditingItem(null);
  };

  const cancelarEdicion = () => {
    setEditingItem(null);
  };

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.precioTotal, 0);
  };

  const onSubmit = async (data: any) => {
    if (items.length === 0) {
      error('Debe agregar al menos un item a la factura');
      return;
    }

    if (!ordenCompraId) {
      error('No se pudo obtener la orden de compra');
      return;
    }

    try {
      const facturaData: CreateFacturaDto = {
        ...data,
        ordenCompraId,
        monto: calcularTotal(),
        items: items.map(item => ({
          facturaId: 0, // Se asignará automáticamente
          numero: item.numero,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          unidad: item.unidad,
          precioUnitario: item.precioUnitario,
          precioTotal: item.precioTotal,
          observaciones: item.observaciones
        }))
      };

      await facturaService.create(facturaData);
      success('Factura creada exitosamente');
      reset();
      setItems([]);
      setEditingItem(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Error al crear la factura');
    }
  };

  const handleClose = () => {
    reset();
    setItems([]);
    setEditingItem(null);
    setPresupuesto(null);
    onClose();
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" title="Nueva Factura">
        <div className="has-text-centered py-6">
          <div className="loading-spinner"></div>
          <p className="mt-3">Cargando datos del presupuesto...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" title="Nueva Factura">
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Nueva Factura</p>
          <button className="delete" aria-label="close" onClick={handleClose}></button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="modal-card-body">
            {/* Información del Presupuesto */}
            {presupuesto && (
              <div className="notification is-info is-light mb-4">
                <strong>Presupuesto #{presupuesto.id}</strong> - {presupuesto.descripcion}
                <br />
                <small>Cliente: {presupuesto.cliente?.nombreEmpresa}</small>
              </div>
            )}

            <div className="columns is-multiline">
              {/* Número de Factura */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Número de Factura *</label>
                  <div className="control">
                    <input
                      className={`input ${errors.numeroFactura ? 'is-danger' : ''}`}
                      type="text"
                      placeholder="FAC-001"
                      {...register('numeroFactura')}
                    />
                  </div>
                  {errors.numeroFactura && (
                    <p className="help is-danger">{errors.numeroFactura.message}</p>
                  )}
                </div>
              </div>

              {/* Concepto */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Concepto *</label>
                  <div className="control">
                    <input
                      className={`input ${errors.concepto ? 'is-danger' : ''}`}
                      type="text"
                      placeholder="Servicios de alquiler de equipos"
                      {...register('concepto')}
                    />
                  </div>
                  {errors.concepto && (
                    <p className="help is-danger">{errors.concepto.message}</p>
                  )}
                </div>
              </div>

              {/* Fecha de Emisión */}
              <div className="column is-6">
                <div className="field">
                  <label className="label">Fecha de Emisión *</label>
                  <div className="control">
                    <input
                      className={`input ${errors.fechaEmision ? 'is-danger' : ''}`}
                      type="date"
                      {...register('fechaEmision')}
                    />
                  </div>
                  {errors.fechaEmision && (
                    <p className="help is-danger">{errors.fechaEmision.message}</p>
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
              <div className="column is-12">
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
            </div>

            {/* Items de la Factura */}
            <div className="mt-5">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h4 className="title is-5">Items de la Factura</h4>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button
                      type="button"
                      className="button is-info is-small"
                      onClick={agregarItem}
                    >
                      <span className="icon is-small">
                        <Plus size={16} />
                      </span>
                      <span>Agregar Item</span>
                    </button>
                  </div>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="notification is-light has-text-centered">
                  No hay items en la factura. Haga clic en "Agregar Item" para comenzar.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table is-fullwidth is-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.numero}</td>
                          <td>{item.descripcion}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.unidad}</td>
                          <td>${item.precioUnitario.toFixed(2)}</td>
                          <td>${item.precioTotal.toFixed(2)}</td>
                          <td>
                            <div className="buttons are-small">
                              <button
                                type="button"
                                className="button is-info"
                                onClick={() => editarItem(index)}
                              >
                                <span className="icon is-small">
                                  <Edit2 size={12} />
                                </span>
                              </button>
                              <button
                                type="button"
                                className="button is-danger"
                                onClick={() => eliminarItem(index)}
                              >
                                <span className="icon is-small">
                                  <Trash2 size={12} />
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="has-text-right has-text-weight-bold">
                          Total:
                        </td>
                        <td className="has-text-weight-bold">
                          ${calcularTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </section>

          <footer className="modal-card-foot">
            <button
              type="submit"
              className={`button is-success ${isSubmitting ? 'is-loading' : ''}`}
              disabled={isSubmitting || items.length === 0}
            >
              Crear Factura
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

      {/* Modal para editar item */}
      {editingItem !== null && (
        <Modal isOpen={editingItem !== null} onClose={cancelarEdicion} size="md" title="Editar Item">
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Editar Item #{items[editingItem]?.numero}</p>
              <button className="delete" aria-label="close" onClick={cancelarEdicion}></button>
            </header>

            <section className="modal-card-body">
              <div className="columns is-multiline">
                <div className="column is-12">
                  <div className="field">
                    <label className="label">Descripción *</label>
                    <div className="control">
                      <textarea
                        className="textarea"
                        defaultValue={items[editingItem]?.descripcion}
                        onChange={(e) => {
                          const nuevosItems = [...items];
                          nuevosItems[editingItem].descripcion = e.target.value;
                          setItems(nuevosItems);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="column is-4">
                  <div className="field">
                    <label className="label">Cantidad *</label>
                    <div className="control">
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={items[editingItem]?.cantidad}
                        onChange={(e) => {
                          const nuevosItems = [...items];
                          const cantidad = parseFloat(e.target.value) || 0;
                          nuevosItems[editingItem].cantidad = cantidad;
                          nuevosItems[editingItem].precioTotal = cantidad * nuevosItems[editingItem].precioUnitario;
                          setItems(nuevosItems);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="column is-4">
                  <div className="field">
                    <label className="label">Unidad *</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        defaultValue={items[editingItem]?.unidad}
                        onChange={(e) => {
                          const nuevosItems = [...items];
                          nuevosItems[editingItem].unidad = e.target.value;
                          setItems(nuevosItems);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="column is-4">
                  <div className="field">
                    <label className="label">Precio Unitario *</label>
                    <div className="control">
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={items[editingItem]?.precioUnitario}
                        onChange={(e) => {
                          const nuevosItems = [...items];
                          const precioUnitario = parseFloat(e.target.value) || 0;
                          nuevosItems[editingItem].precioUnitario = precioUnitario;
                          nuevosItems[editingItem].precioTotal = nuevosItems[editingItem].cantidad * precioUnitario;
                          setItems(nuevosItems);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="column is-12">
                  <div className="field">
                    <label className="label">Observaciones</label>
                    <div className="control">
                      <textarea
                        className="textarea"
                        defaultValue={items[editingItem]?.observaciones}
                        onChange={(e) => {
                          const nuevosItems = [...items];
                          nuevosItems[editingItem].observaciones = e.target.value;
                          setItems(nuevosItems);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="modal-card-foot">
              <button
                type="button"
                className="button is-success"
                onClick={() => guardarItem(editingItem, items[editingItem])}
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                className="button"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </Modal>
  );
}; 