import { api } from './api';
import type { Equipo, CreateEquipoDto, UpdateEquipoDto, PaginatedResponse, PaginationQuery } from '../types';

// Tipos específicos para equipos
export interface EquipoFilters extends PaginationQuery {
  search?: string;
  estado?: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio';
  tipo?: 'camion' | 'excavadora' | 'retroexcavadora' | 'pala_cargadora' | 'compactador' | 'otro';
}

export interface EquipoEstadisticas {
  total: number;
  disponibles: number;
  enMantenimiento: number;
  ocupados: number;
}

// Servicio de equipos
export const equipoService = {
  // Obtener todos los equipos con filtros y paginación
  async getAll(filters?: EquipoFilters): Promise<PaginatedResponse<Equipo>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);

    const queryString = params.toString();
    const url = `/equipos${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<PaginatedResponse<Equipo>>(url);
    return response.data!;
  },

  // Obtener equipo por ID
  async getById(id: number): Promise<Equipo> {
    const response = await api.get<Equipo>(`/equipos/${id}`);
    return response.data!;
  },

  // Crear nuevo equipo
  async create(data: CreateEquipoDto): Promise<Equipo> {
    const response = await api.post<Equipo>('/equipos', data);
    return response.data!;
  },

  // Actualizar equipo
  async update(id: number, data: UpdateEquipoDto): Promise<Equipo> {
    const response = await api.put<Equipo>(`/equipos/${id}`, data);
    return response.data!;
  },

  // Eliminar equipo
  async delete(id: number): Promise<void> {
    await api.delete(`/equipos/${id}`);
  },

  // Buscar equipo por patente
  async findByPatente(patente: string): Promise<Equipo> {
    const response = await api.get<Equipo>(`/equipos/buscar/patente/${patente}`);
    return response.data!;
  },

  // Obtener equipos disponibles
  async getEquiposDisponibles(): Promise<Equipo[]> {
    const response = await api.get<Equipo[]>('/equipos/disponibles');
    return response.data!;
  },

  // Obtener equipos por tipo
  async getEquiposPorTipo(tipo: string): Promise<Equipo[]> {
    const response = await api.get<Equipo[]>(`/equipos/tipo/${tipo}`);
    return response.data!;
  },

  // Obtener estadísticas de equipos
  async getEstadisticas(): Promise<EquipoEstadisticas> {
    const response = await api.get<EquipoEstadisticas>('/equipos/estadisticas');
    return response.data!;
  }
}; 