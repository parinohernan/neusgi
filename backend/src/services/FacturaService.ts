import Joi from 'joi';
import { FacturaRepository } from '@/repositories/FacturaRepository';
import { Factura, CreateFacturaDto, UpdateFacturaDto, FacturaFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class FacturaService implements IBaseService<Factura, CreateFacturaDto, UpdateFacturaDto> {
  private facturaRepository: FacturaRepository;

  constructor(facturaRepository: FacturaRepository) {
    this.facturaRepository = facturaRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
      'any.required': 'El ID de la orden de compra es requerido',
    }),
    numeroFactura: Joi.string().max(50).required().messages({
      'string.base': 'El número de factura debe ser una cadena de texto',
      'string.max': 'El número de factura no puede exceder 50 caracteres',
      'any.required': 'El número de factura es requerido',
    }),
    fechaEmision: Joi.date().required().messages({
      'date.base': 'La fecha de emisión debe ser una fecha válida',
      'any.required': 'La fecha de emisión es requerida',
    }),
    fechaVencimiento: Joi.date().greater(Joi.ref('fechaEmision')).required().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
      'date.greater': 'La fecha de vencimiento debe ser posterior a la fecha de emisión',
      'any.required': 'La fecha de vencimiento es requerida',
    }),
    monto: Joi.number().positive().precision(2).required().messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser positivo',
      'number.precision': 'El monto debe tener máximo 2 decimales',
      'any.required': 'El monto es requerido',
    }),
    montoPagado: Joi.number().min(0).precision(2).optional().messages({
      'number.base': 'El monto pagado debe ser un número',
      'number.min': 'El monto pagado no puede ser negativo',
      'number.precision': 'El monto pagado debe tener máximo 2 decimales',
    }),
    saldoPendiente: Joi.number().min(0).precision(2).optional().messages({
      'number.base': 'El saldo pendiente debe ser un número',
      'number.min': 'El saldo pendiente no puede ser negativo',
      'number.precision': 'El saldo pendiente debe tener máximo 2 decimales',
    }),
    concepto: Joi.string().required().messages({
      'string.base': 'El concepto debe ser una cadena de texto',
      'any.required': 'El concepto es requerido',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    pdfPath: Joi.string().uri().optional().messages({
      'string.uri': 'El PDF debe ser una URL válida',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    estado: Joi.string().valid('pendiente', 'pagada', 'cancelada').optional().messages({
      'any.only': 'El estado debe ser pendiente, pagada o cancelada',
    }),
  });

  private updateSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
    }),
    numeroFactura: Joi.string().max(50).optional().messages({
      'string.base': 'El número de factura debe ser una cadena de texto',
      'string.max': 'El número de factura no puede exceder 50 caracteres',
    }),
    fechaEmision: Joi.date().optional().messages({
      'date.base': 'La fecha de emisión debe ser una fecha válida',
    }),
    fechaVencimiento: Joi.date().optional().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
    }),
    monto: Joi.number().positive().precision(2).optional().messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser positivo',
      'number.precision': 'El monto debe tener máximo 2 decimales',
    }),
    montoPagado: Joi.number().min(0).precision(2).optional().messages({
      'number.base': 'El monto pagado debe ser un número',
      'number.min': 'El monto pagado no puede ser negativo',
      'number.precision': 'El monto pagado debe tener máximo 2 decimales',
    }),
    saldoPendiente: Joi.number().min(0).precision(2).optional().messages({
      'number.base': 'El saldo pendiente debe ser un número',
      'number.min': 'El saldo pendiente no puede ser negativo',
      'number.precision': 'El saldo pendiente debe tener máximo 2 decimales',
    }),
    concepto: Joi.string().optional().messages({
      'string.base': 'El concepto debe ser una cadena de texto',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    pdfPath: Joi.string().uri().optional().messages({
      'string.uri': 'El PDF debe ser una URL válida',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    estado: Joi.string().valid('pendiente', 'pagada', 'cancelada').optional().messages({
      'any.only': 'El estado debe ser pendiente, pagada o cancelada',
    }),
  });

  async getAll(filters?: FacturaFilters): Promise<PaginatedResponse<Factura>> {
    return this.facturaRepository.findAll(filters);
  }

  async getById(id: number): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }
    return this.facturaRepository.findById(id);
  }

  async create(data: CreateFacturaDto): Promise<Factura> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que la orden de compra existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de órdenes de compra

    // Verificar que el número de factura no existe
    const facturaExistente = await this.facturaRepository.findByNumeroFactura(data.numeroFactura);
    if (facturaExistente) {
      throw new Error('Ya existe una factura con este número');
    }

    // Generar número de factura automáticamente si no se proporciona
    if (!data.numeroFactura) {
      data.numeroFactura = await this.facturaRepository.generarNumeroFactura();
    }

    // Validar que el monto pagado no exceda el monto total
    if (data.montoPagado && data.montoPagado > data.monto) {
      throw new Error('El monto pagado no puede exceder el monto total de la factura');
    }

    return this.facturaRepository.create(data);
  }

  async update(id: number, data: UpdateFacturaDto): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si la factura existe
    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    // Si se está cambiando el número de factura, verificar que no existe
    if (data.numeroFactura && data.numeroFactura !== facturaExistente.numeroFactura) {
      const facturaConNumero = await this.facturaRepository.findByNumeroFactura(data.numeroFactura);
      if (facturaConNumero) {
        throw new Error('Ya existe una factura con este número');
      }
    }

    // Validar fechas si se están actualizando
    if (data.fechaEmision && data.fechaVencimiento) {
      if (data.fechaVencimiento <= data.fechaEmision) {
        throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión');
      }
    }

    // Validar montos
    if (data.monto && data.montoPagado && data.montoPagado > data.monto) {
      throw new Error('El monto pagado no puede exceder el monto total de la factura');
    }

    return this.facturaRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    // Verificar si la factura existe
    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    // Verificar que no esté pagada
    if (facturaExistente.estado === 'pagada') {
      throw new Error('No se puede eliminar una factura pagada');
    }

    return this.facturaRepository.delete(id);
  }

  validateCreate(data: CreateFacturaDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdateFacturaDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return this.facturaRepository.exists(id);
  }

  // Métodos específicos para facturas
  async findByOrdenCompra(ordenCompraId: number): Promise<Factura[]> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.facturaRepository.findByOrdenCompra(ordenCompraId);
  }

  async findByNumeroFactura(numeroFactura: string): Promise<Factura | null> {
    if (!numeroFactura || !numeroFactura.trim()) {
      throw new Error('Número de factura requerido');
    }
    return this.facturaRepository.findByNumeroFactura(numeroFactura);
  }

  async findByEstado(estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura[]> {
    if (!estado || !['pendiente', 'pagada', 'cancelada'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.facturaRepository.findByEstado(estado);
  }

  async getFacturasPendientes(): Promise<Factura[]> {
    return this.facturaRepository.getFacturasPendientes();
  }

  async getFacturasPagadas(): Promise<Factura[]> {
    return this.facturaRepository.getFacturasPagadas();
  }

  async getFacturasCanceladas(): Promise<Factura[]> {
    return this.facturaRepository.getFacturasCanceladas();
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    if (!estado || !['pendiente', 'pagada', 'cancelada'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    // Validaciones de estado
    if (estado === 'cancelada' && facturaExistente.estado === 'pagada') {
      throw new Error('No se puede cancelar una factura que ya está pagada');
    }

    return this.facturaRepository.cambiarEstado(id, estado);
  }

  async marcarComoPagada(id: number, montoPagado?: number): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    if (facturaExistente.estado === 'cancelada') {
      throw new Error('No se puede marcar como pagada una factura cancelada');
    }

    if (facturaExistente.estado === 'pagada') {
      throw new Error('La factura ya está pagada');
    }

    if (montoPagado && montoPagado > facturaExistente.monto) {
      throw new Error('El monto pagado no puede exceder el monto total de la factura');
    }

    return this.facturaRepository.marcarComoPagadaConMonto(id, montoPagado);
  }

  async cancelarFactura(id: number): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    if (facturaExistente.estado === 'pagada') {
      throw new Error('No se puede cancelar una factura que ya está pagada');
    }

    if (facturaExistente.estado === 'cancelada') {
      throw new Error('La factura ya está cancelada');
    }

    return this.facturaRepository.cancelarFactura(id);
  }

  async reactivarFactura(id: number): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    if (facturaExistente.estado !== 'cancelada') {
      throw new Error('Solo se pueden reactivar facturas canceladas');
    }

    return this.facturaRepository.reactivarFactura(id);
  }

  async getFacturasPorVencer(dias: number = 30): Promise<Factura[]> {
    if (!dias || dias < 1) {
      throw new Error('El número de días debe ser mayor a 0');
    }
    return this.facturaRepository.getFacturasPorVencer(dias);
  }

  async getFacturasVencidas(): Promise<Factura[]> {
    return this.facturaRepository.getFacturasVencidas();
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalFacturas: number;
    pendientes: number;
    pagadas: number;
    canceladas: number;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
  }> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.facturaRepository.getEstadisticasPorOrdenCompra(ordenCompraId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalFacturas: number;
    pendientes: number;
    pagadas: number;
    canceladas: number;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
    promedioFacturasPorOrden: number;
    facturasVencidas: number;
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
    return this.facturaRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  // Métodos de negocio específicos
  async generarNumeroFactura(): Promise<string> {
    return this.facturaRepository.generarNumeroFactura();
  }

  async registrarPago(id: number, montoPagado: number): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    if (!montoPagado || montoPagado <= 0) {
      throw new Error('El monto del pago debe ser mayor a 0');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    if (facturaExistente.estado === 'cancelada') {
      throw new Error('No se puede registrar un pago en una factura cancelada');
    }

    const saldoPendiente = facturaExistente.saldoPendiente || facturaExistente.monto;
    if (montoPagado > saldoPendiente) {
      throw new Error('El monto del pago no puede exceder el saldo pendiente');
    }

    return this.facturaRepository.registrarPago(id, montoPagado);
  }

  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
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

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    const archivosAdjuntos = facturaExistente.archivosAdjuntos || [];
    archivosAdjuntos.push(urlArchivo);

    return this.facturaRepository.update(id, { archivosAdjuntos });
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    const archivosAdjuntos = facturaExistente.archivosAdjuntos || [];
    const archivosFiltrados = archivosAdjuntos.filter(url => url !== urlArchivo);

    if (archivosFiltrados.length === archivosAdjuntos.length) {
      throw new Error('El archivo especificado no existe en esta factura');
    }

    return this.facturaRepository.update(id, { archivosAdjuntos: archivosFiltrados });
  }

  async actualizarPdfPath(id: number, pdfPath: string): Promise<Factura | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
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

    const facturaExistente = await this.facturaRepository.findById(id);
    if (!facturaExistente) {
      throw new Error('Factura no encontrada');
    }

    return this.facturaRepository.actualizarPdfPath(id, pdfPath);
  }

  async calcularSaldoPendiente(id: number): Promise<{
    saldoPendiente: number;
    porcentajePagado: number;
  }> {
    if (!id || isNaN(id)) {
      throw new Error('ID de factura inválido');
    }

    const factura = await this.facturaRepository.findById(id);
    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    const saldoPendiente = factura.saldoPendiente || factura.monto;
    const porcentajePagado = factura.monto > 0 ? ((factura.monto - saldoPendiente) / factura.monto) * 100 : 0;

    return {
      saldoPendiente,
      porcentajePagado: Math.round(porcentajePagado * 100) / 100, // Redondear a 2 decimales
    };
  }
} 