import Joi from 'joi';
import { RemitoRepository } from '@/repositories/RemitoRepository';
import { Remito, CreateRemitoDto, UpdateRemitoDto, RemitoFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class RemitoService implements IBaseService<Remito, CreateRemitoDto, UpdateRemitoDto> {
  private remitoRepository: RemitoRepository;

  constructor(remitoRepository: RemitoRepository) {
    this.remitoRepository = remitoRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
      'any.required': 'El ID de la orden de compra es requerido',
    }),
    codigo: Joi.string().max(50).required().messages({
      'string.base': 'El código debe ser una cadena de texto',
      'string.max': 'El código no puede exceder 50 caracteres',
      'any.required': 'El código es requerido',
    }),
    contenido: Joi.string().required().messages({
      'string.base': 'El contenido debe ser una cadena de texto',
      'any.required': 'El contenido es requerido',
    }),
    pdfPath: Joi.string().uri().optional().messages({
      'string.uri': 'El PDF debe ser una URL válida',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    estado: Joi.string().valid('pendiente', 'entregado', 'cancelado').optional().messages({
      'any.only': 'El estado debe ser pendiente, entregado o cancelado',
    }),
  });

  private updateSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
    }),
    codigo: Joi.string().max(50).optional().messages({
      'string.base': 'El código debe ser una cadena de texto',
      'string.max': 'El código no puede exceder 50 caracteres',
    }),
    contenido: Joi.string().optional().messages({
      'string.base': 'El contenido debe ser una cadena de texto',
    }),
    pdfPath: Joi.string().uri().optional().messages({
      'string.uri': 'El PDF debe ser una URL válida',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    estado: Joi.string().valid('pendiente', 'entregado', 'cancelado').optional().messages({
      'any.only': 'El estado debe ser pendiente, entregado o cancelado',
    }),
  });

  async getAll(filters?: RemitoFilters): Promise<PaginatedResponse<Remito>> {
    return this.remitoRepository.findAll(filters);
  }

  async getById(id: number): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }
    return this.remitoRepository.findById(id);
  }

  async create(data: CreateRemitoDto): Promise<Remito> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que la orden de compra existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de órdenes de compra

    // Verificar que el código no existe
    const remitoExistente = await this.remitoRepository.findByCodigo(data.codigo);
    if (remitoExistente) {
      throw new Error('Ya existe un remito con este código');
    }

    // Generar código automáticamente si no se proporciona
    if (!data.codigo) {
      data.codigo = await this.remitoRepository.generarCodigoRemito();
    }

    return this.remitoRepository.create(data);
  }

  async update(id: number, data: UpdateRemitoDto): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si el remito existe
    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    // Si se está cambiando el código, verificar que no existe
    if (data.codigo && data.codigo !== remitoExistente.codigo) {
      const remitoConCodigo = await this.remitoRepository.findByCodigo(data.codigo);
      if (remitoConCodigo) {
        throw new Error('Ya existe un remito con este código');
      }
    }

    return this.remitoRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    // Verificar si el remito existe
    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    // Verificar que no esté entregado
    if (remitoExistente.estado === 'entregado') {
      throw new Error('No se puede eliminar un remito que ya fue entregado');
    }

    return this.remitoRepository.delete(id);
  }

  validateCreate(data: CreateRemitoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const { error } = this.createSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }

    return { isValid: true, errors: [] };
  }

  validateUpdate(data: UpdateRemitoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const { error } = this.updateSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }

    return { isValid: true, errors: [] };
  }

  async exists(id: number): Promise<boolean> {
    return this.remitoRepository.exists(id);
  }

  // Métodos específicos para remitos
  async findByOrdenCompra(ordenCompraId: number): Promise<Remito[]> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.remitoRepository.findByOrdenCompra(ordenCompraId);
  }

  async findByCodigo(codigo: string): Promise<Remito | null> {
    if (!codigo || !codigo.trim()) {
      throw new Error('Código de remito requerido');
    }
    return this.remitoRepository.findByCodigo(codigo);
  }

  async findByEstado(estado: 'pendiente' | 'entregado' | 'cancelado'): Promise<Remito[]> {
    if (!estado || !['pendiente', 'entregado', 'cancelado'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.remitoRepository.findByEstado(estado);
  }

  async getRemitosPendientes(): Promise<Remito[]> {
    return this.remitoRepository.getRemitosPendientes();
  }

  async getRemitosEntregados(): Promise<Remito[]> {
    return this.remitoRepository.getRemitosEntregados();
  }

  async getRemitosCancelados(): Promise<Remito[]> {
    return this.remitoRepository.getRemitosCancelados();
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'entregado' | 'cancelado'): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    if (!estado || !['pendiente', 'entregado', 'cancelado'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    // Validaciones de estado
    if (estado === 'cancelado' && remitoExistente.estado === 'entregado') {
      throw new Error('No se puede cancelar un remito que ya fue entregado');
    }

    return this.remitoRepository.cambiarEstado(id, estado);
  }

  async marcarComoEntregado(id: number): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    if (remitoExistente.estado === 'cancelado') {
      throw new Error('No se puede entregar un remito cancelado');
    }

    if (remitoExistente.estado === 'entregado') {
      throw new Error('El remito ya fue entregado');
    }

    return this.remitoRepository.marcarComoEntregado(id);
  }

  async cancelarRemito(id: number): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    if (remitoExistente.estado === 'entregado') {
      throw new Error('No se puede cancelar un remito que ya fue entregado');
    }

    if (remitoExistente.estado === 'cancelado') {
      throw new Error('El remito ya está cancelado');
    }

    return this.remitoRepository.cancelarRemito(id);
  }

  async reactivarRemito(id: number): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    if (remitoExistente.estado !== 'cancelado') {
      throw new Error('Solo se pueden reactivar remitos cancelados');
    }

    return this.remitoRepository.reactivarRemito(id);
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalRemitos: number;
    pendientes: number;
    entregados: number;
    cancelados: number;
  }> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.remitoRepository.getEstadisticasPorOrdenCompra(ordenCompraId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalRemitos: number;
    pendientes: number;
    entregados: number;
    cancelados: number;
    promedioRemitosPorOrden: number;
  }> {
    if (fechaInicio && isNaN(fechaInicio.getTime())) {
      throw new Error('Fecha de inicio inválida');
    }
    if (fechaFin && isNaN(fechaFin.getTime())) {
      throw new Error('Fecha de fin inválida');
    }
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    return this.remitoRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  // Métodos de negocio específicos
  async generarCodigoRemito(): Promise<string> {
    return this.remitoRepository.generarCodigoRemito();
  }

  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    // Validar que es una URL válida
    try {
      new URL(urlArchivo);
    } catch {
      throw new Error('URL del archivo inválida');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    const archivosAdjuntos = remitoExistente.archivosAdjuntos || [];
    archivosAdjuntos.push(urlArchivo);

    return this.remitoRepository.update(id, { archivosAdjuntos });
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    const archivosAdjuntos = remitoExistente.archivosAdjuntos || [];
    const archivosFiltrados = archivosAdjuntos.filter(url => url !== urlArchivo);

    if (archivosFiltrados.length === archivosAdjuntos.length) {
      throw new Error('El archivo especificado no existe en este remito');
    }

    return this.remitoRepository.update(id, { archivosAdjuntos: archivosFiltrados });
  }

  async actualizarPdfPath(id: number, pdfPath: string): Promise<Remito | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de remito inválido');
    }

    if (!pdfPath || !pdfPath.trim()) {
      throw new Error('Ruta del PDF es requerida');
    }

    // Validar que es una URL válida
    try {
      new URL(pdfPath);
    } catch {
      throw new Error('Ruta del PDF inválida');
    }

    const remitoExistente = await this.remitoRepository.findById(id);
    if (!remitoExistente) {
      throw new Error('Remito no encontrado');
    }

    return this.remitoRepository.update(id, { pdfPath });
  }
} 