import { api } from './api';
import type { CreateOrdenCompraDto, UpdateOrdenCompraDto } from '../types';

export const ordenCompraService = {
  // Obtener todas las órdenes de compra con paginación
  async getAll(filters?: any) {
    const response = await api.get('/ordenes-compra', { params: filters });
    return response.data;
  },

  // Obtener una orden de compra por ID
  async getById(id: number) {
    const response = await api.get(`/ordenes-compra/${id}`);
    return response.data;
  },

  // Crear una nueva orden de compra
  async create(data: CreateOrdenCompraDto) {
    const response = await api.post('/ordenes-compra', data);
    return response.data;
  },

  // Actualizar una orden de compra
  async update(id: number, data: UpdateOrdenCompraDto) {
    const response = await api.put(`/ordenes-compra/${id}`, data);
    return response.data;
  },

  // Eliminar una orden de compra
  async delete(id: number) {
    const response = await api.delete(`/ordenes-compra/${id}`);
    return response.data;
  },

  // Obtener órdenes de compra por presupuesto
  async getByPresupuesto(presupuestoId: number) {
    const response = await api.get(`/ordenes-compra/presupuesto/${presupuestoId}`);
    return response.data;
  },

  // Obtener órdenes de compra por estado
  async getByEstado(estado: 'activa' | 'completada' | 'cancelada') {
    const response = await api.get(`/ordenes-compra/estado/${estado}`);
    return response.data;
  },

  // Cambiar estado de una orden de compra
  async cambiarEstado(id: number, estado: 'activa' | 'completada' | 'cancelada') {
    const response = await api.put(`/ordenes-compra/${id}/estado`, { estado });
    return response.data;
  },

  // Obtener órdenes activas
  async getActivas() {
    return this.getByEstado('activa');
  },

  // Obtener órdenes completadas
  async getCompletadas() {
    return this.getByEstado('completada');
  },

  // Obtener órdenes canceladas
  async getCanceladas() {
    return this.getByEstado('cancelada');
  }
}; 