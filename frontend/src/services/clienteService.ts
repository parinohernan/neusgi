import { api } from './api';
import type { Cliente, CreateClienteDto, UpdateClienteDto, PaginatedResponse, PaginationQuery } from '../types';

// Tipos específicos para clientes
export interface ClienteFilters extends PaginationQuery {
  search?: string;
  estado?: 'activo' | 'inactivo';
}

export interface ClienteEstadisticas {
  total: number;
  conUsuario: number;
  sinUsuario: number;
  activos: number;
}

// Servicio de clientes
export const clienteService = {
  // Obtener todos los clientes con filtros y paginación
  async getAll(filters?: ClienteFilters): Promise<PaginatedResponse<Cliente>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.estado) params.append('estado', filters.estado);

    const queryString = params.toString();
    const url = `/clientes${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse<Cliente>>(url);
    return response.data!;
  },

  // Obtener cliente por ID
  async getById(id: number): Promise<Cliente> {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data!;
  },

  // Crear nuevo cliente
  async create(data: CreateClienteDto): Promise<Cliente> {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data!;
  },

  // Actualizar cliente
  async update(id: number, data: UpdateClienteDto): Promise<Cliente> {
    const response = await api.put<Cliente>(`/clientes/${id}`, data);
    return response.data!;
  },

  // Eliminar cliente
  async delete(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  // Buscar cliente por RUT/CUIT
  async findByRutCuit(rutCuit: string): Promise<Cliente> {
    const response = await api.get<Cliente>(`/clientes/buscar/rut/${rutCuit}`);
    return response.data!;
  },

  // Buscar cliente por email
  async findByEmail(email: string): Promise<Cliente> {
    const response = await api.get<Cliente>(`/clientes/buscar/email/${email}`);
    return response.data!;
  },

  // Buscar clientes por nombre
  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>(`/clientes/buscar/nombre/${nombre}`);
    return response.data!;
  },

  // Obtener clientes activos
  async getClientesActivos(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/clientes/activos');
    return response.data!;
  },

  // Obtener estadísticas de clientes
  async getEstadisticas(): Promise<ClienteEstadisticas> {
    const response = await api.get<ClienteEstadisticas>('/clientes/estadisticas/dashboard');
    return response.data!;
  }
}; 