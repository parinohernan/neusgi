import { api } from './api';
import type { PresupuestoItem, CreatePresupuestoItemDto, UpdatePresupuestoItemDto } from '../types';

// Servicio de items de presupuesto
export const presupuestoItemService = {
  // Obtener todos los items
  async getAll(): Promise<PresupuestoItem[]> {
    const response = await api.get<PresupuestoItem[]>('/presupuesto-items');
    return response.data!;
  },

  // Obtener item por ID
  async getById(id: number): Promise<PresupuestoItem> {
    const response = await api.get<PresupuestoItem>(`/presupuesto-items/${id}`);
    return response.data!;
  },

  // Obtener items por presupuesto ID
  async getByPresupuestoId(presupuestoId: number): Promise<PresupuestoItem[]> {
    const response = await api.get<PresupuestoItem[]>(`/presupuesto-items/presupuesto/${presupuestoId}`);
    return response.data!;
  },

  // Crear nuevo item
  async create(data: CreatePresupuestoItemDto): Promise<PresupuestoItem> {
    const response = await api.post<PresupuestoItem>('/presupuesto-items', data);
    return response.data!;
  },

  // Actualizar item
  async update(id: number, data: UpdatePresupuestoItemDto): Promise<PresupuestoItem> {
    const response = await api.put<PresupuestoItem>(`/presupuesto-items/${id}`, data);
    return response.data!;
  },

  // Eliminar item
  async delete(id: number): Promise<void> {
    await api.delete(`/presupuesto-items/${id}`);
  },

  // Crear múltiples items
  async createMultiple(items: CreatePresupuestoItemDto[]): Promise<PresupuestoItem[]> {
    const promises = items.map(item => this.create(item));
    return Promise.all(promises);
  },

  // Actualizar múltiples items
  async updateMultiple(items: { id: number; data: UpdatePresupuestoItemDto }[]): Promise<PresupuestoItem[]> {
    const promises = items.map(({ id, data }) => this.update(id, data));
    return Promise.all(promises);
  },

  // Eliminar múltiples items
  async deleteMultiple(ids: number[]): Promise<void> {
    const promises = ids.map(id => this.delete(id));
    await Promise.all(promises);
  },
}; 