import { api } from './api';
import type { Remito, CreateRemitoDto, UpdateRemitoDto, PaginatedResponse } from '../types';

export const remitoService = {
  async getAll(params?: any): Promise<PaginatedResponse<Remito>> {
    const response = await api.get('/remitos', { params });
    return response.data as PaginatedResponse<Remito>;
  },

  async getById(id: number): Promise<Remito> {
    const response = await api.get(`/remitos/${id}`);
    return response.data as Remito;
  },

  async create(data: CreateRemitoDto): Promise<Remito> {
    const response = await api.post('/remitos', data);
    return response.data as Remito;
  },

  async update(id: number, data: UpdateRemitoDto): Promise<Remito> {
    const response = await api.put(`/remitos/${id}`, data);
    return response.data as Remito;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/remitos/${id}`);
  },

  async findByOrdenCompra(ordenCompraId: number): Promise<Remito[]> {
    const response = await api.get(`/remitos/orden-compra/${ordenCompraId}`);
    return response.data as Remito[];
  },

  async cambiarEstado(id: number, estado: 'pendiente' | 'entregado' | 'cancelado'): Promise<Remito> {
    const response = await api.patch(`/remitos/${id}/estado`, { estado });
    return response.data as Remito;
  },
}; 