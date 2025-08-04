import { api } from './api';
import type { CreateParteDiarioDto, UpdateParteDiarioDto } from '../types';

export const parteDiarioService = {
  async getAll(): Promise<any[]> {
    const response = await api.get('/partes-diario');
    return (response.data as any).data || response.data;
  },

  async getById(id: number): Promise<any> {
    const response = await api.get(`/partes-diario/${id}`);
    return (response.data as any).data || response.data;
  },

  async create(data: CreateParteDiarioDto): Promise<any> {
    const response = await api.post('/partes-diario', data);
    return (response.data as any).data || response.data;
  },

  async update(id: number, data: UpdateParteDiarioDto): Promise<any> {
    const response = await api.put(`/partes-diario/${id}`, data);
    return (response.data as any).data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/partes-diario/${id}`);
  },

  async findByOrdenCompra(ordenCompraId: number): Promise<any[]> {
    const response = await api.get(`/partes-diario/orden-compra/${ordenCompraId}`);
    return (response.data as any).data || response.data;
  },
}; 