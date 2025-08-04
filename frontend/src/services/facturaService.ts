import { api } from './api';
import type { 
  Factura, 
  CreateFacturaDto, 
  UpdateFacturaDto, 
  PaginatedResponse 
} from '../types';

export const facturaService = {
  // Obtener todas las facturas con paginación
  async getAll(page = 1, limit = 10, filters?: any): Promise<PaginatedResponse<Factura>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/facturas?${params}`);
    return response.data as PaginatedResponse<Factura>;
  },

  // Obtener factura por ID
  async getById(id: number): Promise<Factura> {
    const response = await api.get(`/facturas/${id}`);
    return response.data as Factura;
  },

  // Crear nueva factura
  async create(facturaData: CreateFacturaDto): Promise<Factura> {
    const response = await api.post('/facturas', facturaData);
    return response.data as Factura;
  },

  // Actualizar factura
  async update(id: number, facturaData: UpdateFacturaDto): Promise<Factura> {
    const response = await api.put(`/facturas/${id}`, facturaData);
    return response.data as Factura;
  },

  // Eliminar factura
  async delete(id: number): Promise<void> {
    await api.delete(`/facturas/${id}`);
  },

  // Obtener facturas por orden de compra
  async getByOrdenCompra(ordenCompraId: number): Promise<Factura[]> {
    const response = await api.get(`/facturas/orden-compra/${ordenCompraId}`);
    return response.data as Factura[];
  },

  // Obtener facturas por estado
  async getByEstado(estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura[]> {
    const response = await api.get(`/facturas/estado/${estado}`);
    return response.data as Factura[];
  },

  // Cambiar estado de la factura
  async cambiarEstado(id: number, estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura> {
    const response = await api.put(`/facturas/${id}/estado`, { estado });
    return response.data as Factura;
  },

  // Marcar como pagada
  async marcarComoPagada(id: number, montoPagado?: number): Promise<Factura> {
    const response = await api.put(`/facturas/${id}/pagar`, { montoPagado });
    return response.data as Factura;
  },

  // Cancelar factura
  async cancelar(id: number): Promise<Factura> {
    const response = await api.put(`/facturas/${id}/cancelar`);
    return response.data as Factura;
  },

  // Obtener facturas pendientes
  async getPendientes(): Promise<Factura[]> {
    const response = await api.get('/facturas/pendientes');
    return response.data as Factura[];
  },

  // Obtener facturas pagadas
  async getPagadas(): Promise<Factura[]> {
    const response = await api.get('/facturas/pagadas');
    return response.data as Factura[];
  },

  // Obtener facturas canceladas
  async getCanceladas(): Promise<Factura[]> {
    const response = await api.get('/facturas/canceladas');
    return response.data as Factura[];
  },

  // Obtener facturas por vencer
  async getPorVencer(dias: number = 30): Promise<Factura[]> {
    const response = await api.get(`/facturas/por-vencer/${dias}`);
    return response.data as Factura[];
  },

  // Obtener facturas vencidas
  async getVencidas(): Promise<Factura[]> {
    const response = await api.get('/facturas/vencidas');
    return response.data as Factura[];
  },

  // Generar número de factura
  async generarNumero(): Promise<string> {
    const response = await api.get('/facturas/generar-numero');
    return (response.data as any).numero;
  },

  // Generar PDF de la factura
  async generarPDF(id: number): Promise<Blob> {
    const response = await api.get(`/facturas/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  },

  // Descargar PDF de la factura
  async downloadPDF(id: number): Promise<void> {
    const blob = await this.generarPDF(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}; 