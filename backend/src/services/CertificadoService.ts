import Joi from 'joi';
import { CertificadoRepository } from '@/repositories/CertificadoRepository';
import { Certificado, CreateCertificadoDto, UpdateCertificadoDto, CertificadoFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class CertificadoService implements IBaseService<Certificado, CreateCertificadoDto, UpdateCertificadoDto> {
  private certificadoRepository: CertificadoRepository;

  constructor(certificadoRepository: CertificadoRepository) {
    this.certificadoRepository = certificadoRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
      'any.required': 'El ID de la orden de compra es requerido',
    }),
    tipo: Joi.string().valid('seguro', 'habilitacion', 'otros').required().messages({
      'string.base': 'El tipo debe ser una cadena de texto',
      'any.only': 'El tipo debe ser seguro, habilitacion u otros',
      'any.required': 'El tipo es requerido',
    }),
    codigo: Joi.string().max(50).required().messages({
      'string.base': 'El código debe ser una cadena de texto',
      'string.max': 'El código no puede exceder 50 caracteres',
      'any.required': 'El código es requerido',
    }),
    descripcion: Joi.string().required().messages({
      'string.base': 'La descripción debe ser una cadena de texto',
      'any.required': 'La descripción es requerida',
    }),
    fechaVencimiento: Joi.date().greater('now').required().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
      'date.greater': 'La fecha de vencimiento debe ser posterior a la fecha actual',
      'any.required': 'La fecha de vencimiento es requerida',
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
    estado: Joi.string().valid('activo', 'vencido', 'cancelado').optional().messages({
      'any.only': 'El estado debe ser activo, vencido o cancelado',
    }),
  });

  private updateSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
    }),
    tipo: Joi.string().valid('seguro', 'habilitacion', 'otros').optional().messages({
      'string.base': 'El tipo debe ser una cadena de texto',
      'any.only': 'El tipo debe ser seguro, habilitacion u otros',
    }),
    codigo: Joi.string().max(50).optional().messages({
      'string.base': 'El código debe ser una cadena de texto',
      'string.max': 'El código no puede exceder 50 caracteres',
    }),
    descripcion: Joi.string().optional().messages({
      'string.base': 'La descripción debe ser una cadena de texto',
    }),
    fechaVencimiento: Joi.date().optional().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
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
    estado: Joi.string().valid('activo', 'vencido', 'cancelado').optional().messages({
      'any.only': 'El estado debe ser activo, vencido o cancelado',
    }),
  });

  async getAll(filters?: CertificadoFilters): Promise<PaginatedResponse<Certificado>> {
    return this.certificadoRepository.findAll(filters);
  }

  async getById(id: number): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }
    return this.certificadoRepository.findById(id);
  }

  async create(data: CreateCertificadoDto): Promise<Certificado> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que la orden de compra existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de órdenes de compra

    // Verificar que el código no existe
    const certificadoExistente = await this.certificadoRepository.findByCodigo(data.codigo);
    if (certificadoExistente) {
      throw new Error('Ya existe un certificado con este código');
    }

    // Generar código automáticamente si no se proporciona
    if (!data.codigo) {
      data.codigo = await this.certificadoRepository.generarCodigoCertificadoPorTipo(data.tipo);
    }

    return this.certificadoRepository.create(data);
  }

  async update(id: number, data: UpdateCertificadoDto): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si el certificado existe
    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    // Si se está cambiando el código, verificar que no existe
    if (data.codigo && data.codigo !== certificadoExistente.codigo) {
      const certificadoConCodigo = await this.certificadoRepository.findByCodigo(data.codigo);
      if (certificadoConCodigo) {
        throw new Error('Ya existe un certificado con este código');
      }
    }

    return this.certificadoRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    // Verificar si el certificado existe
    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    // Verificar que no esté activo
    if (certificadoExistente.estado === 'activo') {
      throw new Error('No se puede eliminar un certificado activo');
    }

    return this.certificadoRepository.delete(id);
  }

  validateCreate(data: CreateCertificadoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdateCertificadoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return this.certificadoRepository.exists(id);
  }

  // Métodos específicos para certificados
  async findByOrdenCompra(ordenCompraId: number): Promise<Certificado[]> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.certificadoRepository.findByOrdenCompra(ordenCompraId);
  }

  async findByTipo(tipo: 'seguro' | 'habilitacion' | 'otros'): Promise<Certificado[]> {
    if (!tipo || !['seguro', 'habilitacion', 'otros'].includes(tipo)) {
      throw new Error('Tipo de certificado inválido');
    }
    return this.certificadoRepository.findByTipo(tipo);
  }

  async findByCodigo(codigo: string): Promise<Certificado | null> {
    if (!codigo || !codigo.trim()) {
      throw new Error('Código de certificado requerido');
    }
    return this.certificadoRepository.findByCodigo(codigo);
  }

  async findByEstado(estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado[]> {
    if (!estado || !['activo', 'vencido', 'cancelado'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.certificadoRepository.findByEstado(estado);
  }

  async getCertificadosActivos(): Promise<Certificado[]> {
    return this.certificadoRepository.getCertificadosActivos();
  }

  async getCertificadosVencidos(): Promise<Certificado[]> {
    return this.certificadoRepository.getCertificadosVencidos();
  }

  async getCertificadosCancelados(): Promise<Certificado[]> {
    return this.certificadoRepository.getCertificadosCancelados();
  }

  async cambiarEstado(id: number, estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    if (!estado || !['activo', 'vencido', 'cancelado'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    // Validaciones de estado
    if (estado === 'cancelado' && certificadoExistente.estado === 'vencido') {
      throw new Error('No se puede cancelar un certificado que ya está vencido');
    }

    return this.certificadoRepository.cambiarEstado(id, estado);
  }

  async marcarComoVencido(id: number): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    if (certificadoExistente.estado === 'cancelado') {
      throw new Error('No se puede marcar como vencido un certificado cancelado');
    }

    if (certificadoExistente.estado === 'vencido') {
      throw new Error('El certificado ya está vencido');
    }

    return this.certificadoRepository.marcarComoVencido(id);
  }

  async cancelarCertificado(id: number): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    if (certificadoExistente.estado === 'vencido') {
      throw new Error('No se puede cancelar un certificado que ya está vencido');
    }

    if (certificadoExistente.estado === 'cancelado') {
      throw new Error('El certificado ya está cancelado');
    }

    return this.certificadoRepository.cancelarCertificado(id);
  }

  async reactivarCertificado(id: number): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    if (certificadoExistente.estado !== 'cancelado') {
      throw new Error('Solo se pueden reactivar certificados cancelados');
    }

    return this.certificadoRepository.reactivarCertificado(id);
  }

  async getCertificadosPorVencer(dias: number = 30): Promise<Certificado[]> {
    if (!dias || dias < 1) {
      throw new Error('El número de días debe ser mayor a 0');
    }
    return this.certificadoRepository.getCertificadosPorVencer(dias);
  }

  async getCertificadosVencidosRecientes(dias: number = 30): Promise<Certificado[]> {
    if (!dias || dias < 1) {
      throw new Error('El número de días debe ser mayor a 0');
    }
    return this.certificadoRepository.getCertificadosVencidosRecientes(dias);
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalCertificados: number;
    activos: number;
    vencidos: number;
    cancelados: number;
    porVencer: number;
  }> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.certificadoRepository.getEstadisticasPorOrdenCompra(ordenCompraId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalCertificados: number;
    activos: number;
    vencidos: number;
    cancelados: number;
    porVencer: number;
    promedioCertificadosPorOrden: number;
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
    return this.certificadoRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  // Métodos de negocio específicos
  async generarCodigoCertificado(tipo: 'seguro' | 'habilitacion' | 'otros'): Promise<string> {
    if (!tipo || !['seguro', 'habilitacion', 'otros'].includes(tipo)) {
      throw new Error('Tipo de certificado inválido');
    }
    return this.certificadoRepository.generarCodigoCertificadoPorTipo(tipo);
  }

  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
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

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    const archivosAdjuntos = certificadoExistente.archivosAdjuntos || [];
    archivosAdjuntos.push(urlArchivo);

    return this.certificadoRepository.update(id, { archivosAdjuntos });
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    const archivosAdjuntos = certificadoExistente.archivosAdjuntos || [];
    const archivosFiltrados = archivosAdjuntos.filter(url => url !== urlArchivo);

    if (archivosFiltrados.length === archivosAdjuntos.length) {
      throw new Error('El archivo especificado no existe en este certificado');
    }

    return this.certificadoRepository.update(id, { archivosAdjuntos: archivosFiltrados });
  }

  async actualizarPdfPath(id: number, pdfPath: string): Promise<Certificado | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
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

    const certificadoExistente = await this.certificadoRepository.findById(id);
    if (!certificadoExistente) {
      throw new Error('Certificado no encontrado');
    }

    return this.certificadoRepository.update(id, { pdfPath });
  }

  async actualizarEstadosAutomaticamente(): Promise<{
    actualizados: number;
    vencidos: number;
  }> {
    return this.certificadoRepository.actualizarEstadosAutomaticamente();
  }

  async verificarVencimiento(id: number): Promise<{
    estaVencido: boolean;
    diasRestantes: number;
    diasVencido: number;
  }> {
    if (!id || isNaN(id)) {
      throw new Error('ID de certificado inválido');
    }

    const certificado = await this.certificadoRepository.findById(id);
    if (!certificado) {
      throw new Error('Certificado no encontrado');
    }

    const ahora = new Date();
    const fechaVencimiento = new Date(certificado.fechaVencimiento);
    const diferenciaMs = fechaVencimiento.getTime() - ahora.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    return {
      estaVencido: diferenciaDias < 0,
      diasRestantes: diferenciaDias > 0 ? diferenciaDias : 0,
      diasVencido: diferenciaDias < 0 ? Math.abs(diferenciaDias) : 0,
    };
  }
} 