import { api } from './api';
import type { 
  Certificado, 
  CreateCertificadoDto, 
  UpdateCertificadoDto, 
  PaginatedResponse 
} from '../types';

export const certificadoService = {
  // Obtener todos los certificados con paginación
  async getAll(page = 1, limit = 10, filters?: any): Promise<PaginatedResponse<Certificado>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/certificados?${params}`);
    return response.data as PaginatedResponse<Certificado>;
  },

  // Obtener certificado por ID
  async getById(id: number): Promise<Certificado> {
    const response = await api.get(`/certificados/${id}`);
    return response.data as Certificado;
  },

  // Crear nuevo certificado
  async create(certificadoData: CreateCertificadoDto): Promise<Certificado> {
    const response = await api.post('/certificados', certificadoData);
    return response.data as Certificado;
  },

  // Actualizar certificado
  async update(id: number, certificadoData: UpdateCertificadoDto): Promise<Certificado> {
    const response = await api.put(`/certificados/${id}`, certificadoData);
    return response.data as Certificado;
  },

  // Eliminar certificado
  async delete(id: number): Promise<void> {
    await api.delete(`/certificados/${id}`);
  },

  // Obtener certificados por orden de compra
  async getByOrdenCompra(ordenCompraId: number): Promise<Certificado[]> {
    const response = await api.get(`/certificados/orden-compra/${ordenCompraId}`);
    return response.data as Certificado[];
  },

  // Obtener certificados por tipo
  async getByTipo(tipo: 'seguro' | 'habilitacion' | 'otros'): Promise<Certificado[]> {
    const response = await api.get(`/certificados/tipo/${tipo}`);
    return response.data as Certificado[];
  },

  // Obtener certificados por estado
  async getByEstado(estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado[]> {
    const response = await api.get(`/certificados/estado/${estado}`);
    return response.data as Certificado[];
  },

  // Cambiar estado del certificado
  async cambiarEstado(id: number, estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado> {
    const response = await api.put(`/certificados/${id}/estado`, { estado });
    return response.data as Certificado;
  },

  // Obtener certificados vencidos
  async getVencidos(): Promise<Certificado[]> {
    const response = await api.get('/certificados/vencidos');
    return response.data as Certificado[];
  },

  // Obtener certificados por vencer
  async getPorVencer(dias: number = 30): Promise<Certificado[]> {
    const response = await api.get(`/certificados/por-vencer/${dias}`);
    return response.data as Certificado[];
  }
}; 