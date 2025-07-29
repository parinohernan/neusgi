import { api } from './api';
import type { 
  Presupuesto, 
  CreatePresupuestoDto, 
  UpdatePresupuestoDto, 
  PaginatedResponse 
} from '../types';

export const presupuestoService = {
  // Obtener todos los presupuestos con paginación
  async getAll(page = 1, limit = 10, filters?: any): Promise<PaginatedResponse<Presupuesto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/presupuestos?${params}`);
    return response.data as PaginatedResponse<Presupuesto>;
  },

  // Obtener presupuesto por ID
  async getById(id: number): Promise<Presupuesto> {
    const response = await api.get(`/presupuestos/${id}`);
    return response.data as Presupuesto;
  },

  // Crear nuevo presupuesto
  async create(presupuestoData: CreatePresupuestoDto): Promise<Presupuesto> {
    const response = await api.post('/presupuestos', presupuestoData);
    return response.data as Presupuesto;
  },

  // Actualizar presupuesto
  async update(id: number, presupuestoData: UpdatePresupuestoDto): Promise<Presupuesto> {
    const response = await api.put(`/presupuestos/${id}`, presupuestoData);
    return response.data as Presupuesto;
  },

  // Eliminar presupuesto
  async delete(id: number): Promise<void> {
    await api.delete(`/presupuestos/${id}`);
  },

  // Obtener presupuestos por cliente
  async getByCliente(clienteId: number): Promise<Presupuesto[]> {
    const response = await api.get(`/presupuestos/cliente/${clienteId}`);
    return response.data as Presupuesto[];
  },

  // Obtener presupuestos por equipo
  async getByEquipo(equipoId: number): Promise<Presupuesto[]> {
    const response = await api.get(`/presupuestos/equipo/${equipoId}`);
    return response.data as Presupuesto[];
  },

  // Obtener presupuestos por estado
  async getByEstado(estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto[]> {
    const response = await api.get(`/presupuestos/estado/${estado}`);
    return response.data as Presupuesto[];
  },

  // Cambiar estado del presupuesto
  async cambiarEstado(id: number, estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto> {
    const response = await api.patch(`/presupuestos/${id}/estado`, { estado });
    return response.data as Presupuesto;
  },

  // Generar PDF del presupuesto
  async generarPDF(id: number): Promise<Blob> {
    const response = await api.get(`/presupuestos/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  // Obtener estadísticas de presupuestos
  async getEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    aceptados: number;
    rechazados: number;
    vencidos: number;
    valorTotal: number;
  }> {
    const response = await api.get('/presupuestos/estadisticas/dashboard');
    return response.data as {
      total: number;
      pendientes: number;
      aceptados: number;
      rechazados: number;
      vencidos: number;
      valorTotal: number;
    };
  },

  // Descargar PDF del presupuesto
  async downloadPdf(id: number): Promise<void> {
    try {
      const response = await api.get(`/presupuestos/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob
      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `presupuesto-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw new Error('Error al descargar el PDF');
    }
  }
}; 