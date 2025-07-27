import Joi from 'joi';
import { Pago, CreatePagoDto, UpdatePagoDto, PagoFilters, ValidationResult, PaginatedResponse } from '@/types';
import { PagoRepository } from '@/repositories/PagoRepository';
import { IBaseService } from './interfaces/IBaseService';

export class PagoService implements IBaseService<Pago, CreatePagoDto, UpdatePagoDto> {
  private pagoRepository: PagoRepository;

  constructor(pagoRepository: PagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    facturaId: Joi.number().required().messages({
      'number.base': 'El ID de la factura debe ser un número',
      'any.required': 'El ID de la factura es requerido',
    }),
    monto: Joi.number().positive().required().messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser mayor a 0',
      'any.required': 'El monto es requerido',
    }),
    fechaPago: Joi.date().required().messages({
      'date.base': 'La fecha de pago debe ser una fecha válida',
      'any.required': 'La fecha de pago es requerida',
    }),
    metodoPago: Joi.string().valid('efectivo', 'transferencia', 'cheque', 'tarjeta_credito', 'tarjeta_debito', 'otros').required().messages({
      'string.base': 'El método de pago debe ser una cadena de texto',
      'any.only': 'El método de pago debe ser uno de: efectivo, transferencia, cheque, tarjeta_credito, tarjeta_debito, otros',
      'any.required': 'El método de pago es requerido',
    }),
    referencia: Joi.string().max(100).optional().messages({
      'string.max': 'La referencia no puede exceder 100 caracteres',
    }),
    observaciones: Joi.string().optional().messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
    }),
    comprobante: Joi.string().max(255).optional().messages({
      'string.max': 'El comprobante no puede exceder 255 caracteres',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    estado: Joi.string().valid('pendiente', 'confirmado', 'rechazado', 'cancelado').optional().messages({
      'string.base': 'El estado debe ser una cadena de texto',
      'any.only': 'El estado debe ser uno de: pendiente, confirmado, rechazado, cancelado',
    }),
    procesadoPor: Joi.number().optional().messages({
      'number.base': 'El ID del usuario procesador debe ser un número',
    }),
  });

  private updateSchema = Joi.object({
    facturaId: Joi.number().optional().messages({
      'number.base': 'El ID de la factura debe ser un número',
    }),
    monto: Joi.number().positive().optional().messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser mayor a 0',
    }),
    fechaPago: Joi.date().optional().messages({
      'date.base': 'La fecha de pago debe ser una fecha válida',
    }),
    metodoPago: Joi.string().valid('efectivo', 'transferencia', 'cheque', 'tarjeta_credito', 'tarjeta_debito', 'otros').optional().messages({
      'string.base': 'El método de pago debe ser una cadena de texto',
      'any.only': 'El método de pago debe ser uno de: efectivo, transferencia, cheque, tarjeta_credito, tarjeta_debito, otros',
    }),
    referencia: Joi.string().max(100).optional().messages({
      'string.max': 'La referencia no puede exceder 100 caracteres',
    }),
    observaciones: Joi.string().optional().messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
    }),
    comprobante: Joi.string().max(255).optional().messages({
      'string.max': 'El comprobante no puede exceder 255 caracteres',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
    estado: Joi.string().valid('pendiente', 'confirmado', 'rechazado', 'cancelado').optional().messages({
      'string.base': 'El estado debe ser una cadena de texto',
      'any.only': 'El estado debe ser uno de: pendiente, confirmado, rechazado, cancelado',
    }),
    procesadoPor: Joi.number().optional().messages({
      'number.base': 'El ID del usuario procesador debe ser un número',
    }),
  });

  // Métodos de la interfaz IBaseService
  async getAll(filters?: PagoFilters): Promise<PaginatedResponse<Pago>> {
    return this.pagoRepository.findAll(filters);
  }

  async getById(id: number): Promise<Pago | null> {
    return this.pagoRepository.findById(id);
  }

  async create(data: CreatePagoDto): Promise<Pago> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar que la factura existe
    const facturaExiste = await this.pagoRepository.exists(data.facturaId);
    if (!facturaExiste) {
      throw new Error('La factura especificada no existe');
    }

    // Crear el pago
    const pago = await this.pagoRepository.create(data);

    // Actualizar el estado de la factura si es necesario
    await this.actualizarEstadoFactura(data.facturaId);

    return pago;
  }

  async update(id: number, data: UpdatePagoDto): Promise<Pago | null> {
    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    // Si se está cambiando la factura, verificar que existe
    if (data.facturaId) {
      const facturaExiste = await this.pagoRepository.exists(data.facturaId);
      if (!facturaExiste) {
        throw new Error('La factura especificada no existe');
      }
    }

    // Actualizar el pago
    const pago = await this.pagoRepository.update(id, data);

    // Actualizar el estado de la factura si es necesario
    if (pago) {
      await this.actualizarEstadoFactura(pago.facturaId);
    }

    return pago;
  }

  async delete(id: number): Promise<boolean> {
    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    // Obtener la factura antes de eliminar
    const pago = await this.pagoRepository.findById(id);
    const facturaId = pago?.facturaId;

    // Eliminar el pago
    const eliminado = await this.pagoRepository.delete(id);

    // Actualizar el estado de la factura si se eliminó correctamente
    if (eliminado && facturaId) {
      await this.actualizarEstadoFactura(facturaId);
    }

    return eliminado;
  }

  validateCreate(data: CreatePagoDto): ValidationResult {
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

  validateUpdate(data: UpdatePagoDto): ValidationResult {
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
    return this.pagoRepository.exists(id);
  }

  // Métodos específicos para pagos
  async findByFactura(facturaId: number): Promise<Pago[]> {
    return this.pagoRepository.findByFactura(facturaId);
  }

  async findByMetodoPago(metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros'): Promise<Pago[]> {
    return this.pagoRepository.findByMetodoPago(metodoPago);
  }

  async findByEstado(estado: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado'): Promise<Pago[]> {
    return this.pagoRepository.findByEstado(estado);
  }

  async getPagosPendientes(): Promise<Pago[]> {
    return this.pagoRepository.getPagosPendientes();
  }

  async getPagosConfirmados(): Promise<Pago[]> {
    return this.pagoRepository.getPagosConfirmados();
  }

  async getPagosRechazados(): Promise<Pago[]> {
    return this.pagoRepository.getPagosRechazados();
  }

  async getPagosCancelados(): Promise<Pago[]> {
    return this.pagoRepository.getPagosCancelados();
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado', procesadoPor?: number): Promise<Pago | null> {
    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    // Cambiar el estado
    const pago = await this.pagoRepository.cambiarEstado(id, estado);

    // Si se está confirmando, rechazando o cancelando, agregar el procesador
    if (pago && (estado === 'confirmado' || estado === 'rechazado' || estado === 'cancelado') && procesadoPor) {
      await this.pagoRepository.update(id, { procesadoPor });
    }

    // Actualizar el estado de la factura
    if (pago) {
      await this.actualizarEstadoFactura(pago.facturaId);
    }

    return pago;
  }

  async confirmarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    return this.cambiarEstado(id, 'confirmado', procesadoPor);
  }

  async rechazarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    return this.cambiarEstado(id, 'rechazado', procesadoPor);
  }

  async cancelarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    return this.cambiarEstado(id, 'cancelado', procesadoPor);
  }

  async reactivarPago(id: number): Promise<Pago | null> {
    return this.cambiarEstado(id, 'pendiente');
  }

  async getPagosPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<Pago[]> {
    if (fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    return this.pagoRepository.getPagosPorPeriodo(fechaInicio, fechaFin);
  }

  async getEstadisticasPorFactura(facturaId: number): Promise<{
    totalPagos: number;
    pendientes: number;
    confirmados: number;
    rechazados: number;
    cancelados: number;
    montoTotal: number;
    montoConfirmado: number;
    montoPendiente: number;
  }> {
    return this.pagoRepository.getEstadisticasPorFactura(facturaId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalPagos: number;
    pendientes: number;
    confirmados: number;
    rechazados: number;
    cancelados: number;
    montoTotal: number;
    montoConfirmado: number;
    montoPendiente: number;
    promedioPagosPorFactura: number;
    pagosPorMetodo: Record<string, number>;
  }> {
    return this.pagoRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  async actualizarComprobante(id: number, comprobante: string): Promise<Pago | null> {
    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    return this.pagoRepository.actualizarComprobante(id, comprobante);
  }

  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<Pago | null> {
    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    // Validar URL
    try {
      new URL(urlArchivo);
    } catch {
      throw new Error('La URL del archivo no es válida');
    }

    return this.pagoRepository.agregarArchivoAdjunto(id, urlArchivo);
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<Pago | null> {
    // Verificar que el pago existe
    const pagoExiste = await this.pagoRepository.exists(id);
    if (!pagoExiste) {
      throw new Error('El pago especificado no existe');
    }

    return this.pagoRepository.removerArchivoAdjunto(id, urlArchivo);
  }

  // Método privado para actualizar el estado de la factura
  private async actualizarEstadoFactura(facturaId: number): Promise<void> {
    try {
      // Obtener estadísticas de pagos de la factura
      const estadisticas = await this.getEstadisticasPorFactura(facturaId);
      
      // Importar el servicio de facturas dinámicamente para evitar dependencias circulares
      const { FacturaService } = await import('./FacturaService');
      const { FacturaRepository } = await import('@/repositories/FacturaRepository');
      const Database = (await import('@/config/database')).default;
      
      const facturaRepository = new FacturaRepository(Database.getInstance());
      const facturaService = new FacturaService(facturaRepository);

      // Obtener la factura
      const factura = await facturaService.getById(facturaId);
      if (!factura) return;

      // Calcular el monto total pagado
      const montoPagado = estadisticas.montoConfirmado;
      const saldoPendiente = factura.monto - montoPagado;

      // Determinar el nuevo estado de la factura
      let nuevoEstado: 'pendiente' | 'pagada' | 'cancelada' = 'pendiente';
      
      if (saldoPendiente <= 0) {
        nuevoEstado = 'pagada';
      } else if (estadisticas.cancelados > 0 && estadisticas.confirmados === 0) {
        nuevoEstado = 'cancelada';
      }

      // Actualizar la factura
      await facturaService.update(facturaId, {
        montoPagado,
        saldoPendiente,
        estado: nuevoEstado,
      });
    } catch (error) {
      console.error('Error al actualizar estado de factura:', error);
    }
  }
} 