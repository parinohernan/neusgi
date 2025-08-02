import { api } from './api';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export const categoriaService = {
  async getAll(): Promise<Categoria[]> {
    const response = await api.get('/categorias');
    return response.data as Categoria[];
  },

  async getActivas(): Promise<Categoria[]> {
    const response = await api.get('/categorias/activas');
    return response.data as Categoria[];
  },

  async getById(id: number): Promise<Categoria> {
    const response = await api.get(`/categorias/${id}`);
    return response.data as Categoria;
  },

  async create(data: CreateCategoriaDto): Promise<Categoria> {
    const response = await api.post('/categorias', data);
    return response.data as Categoria;
  },

  async update(id: number, data: UpdateCategoriaDto): Promise<Categoria> {
    const response = await api.put(`/categorias/${id}`, data);
    return response.data as Categoria;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  }
}; 