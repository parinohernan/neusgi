import { api } from './api';
import type { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../types';

export const empleadoService = {
  // Obtener todos los empleados
  getAll: async (): Promise<Empleado[]> => {
    const response = await api.get('/empleados');
    
    // Si response.data es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si tiene la estructura { success: true, data: [...] }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data;
    }
    
    // Fallback: devolver response.data directamente
    return response.data as Empleado[];
  },

  // Obtener empleados activos
  getActivos: async (): Promise<Empleado[]> => {
    const response = await api.get('/empleados/activos');
    
    // Si response.data es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si tiene la estructura { success: true, data: [...] }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data;
    }
    
    // Fallback: devolver response.data directamente
    return response.data as Empleado[];
  },

  // Obtener conductores
  getConductores: async (): Promise<Empleado[]> => {
    const response = await api.get('/empleados/conductores');
    
    // Si response.data es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si tiene la estructura { success: true, data: [...] }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data;
    }
    
    // Fallback: devolver response.data directamente
    return response.data as Empleado[];
  },

  // Obtener empleado por ID
  getById: async (id: number): Promise<Empleado> => {
    const response = await api.get(`/empleados/${id}`);
    return (response.data as any).data;
  },

  // Crear nuevo empleado
  create: async (data: CreateEmpleadoDto): Promise<Empleado> => {
    const response = await api.post('/empleados', data);
    return (response.data as any).data;
  },

  // Actualizar empleado
  update: async (id: number, data: UpdateEmpleadoDto): Promise<Empleado> => {
    const response = await api.put(`/empleados/${id}`, data);
    return (response.data as any).data;
  },

  // Eliminar empleado
  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete(`/empleados/${id}`);
    return (response.data as any).success;
  }
}; 