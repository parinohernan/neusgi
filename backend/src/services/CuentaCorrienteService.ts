import Joi from 'joi';
import { CuentaCorriente, CreateCuentaCorrienteDto, UpdateCuentaCorrienteDto, CuentaCorrienteFilters, ValidationResult, PaginatedResponse } from '@/types';
import { CuentaCorrienteRepository } from '@/repositories/CuentaCorrienteRepository';
import { IBaseService } from './interfaces/IBaseService';

export class CuentaCorrienteService implements IBaseService<CuentaCorriente, CreateCuentaCorrienteDto, UpdateCuentaCorrienteDto> {
  private cuentaCorrienteRepository: CuentaCorrienteRepository;

  constructor(cuentaCorrienteRepository: CuentaCorrienteRepository) {
    this.cuentaCorrienteRepository = cuentaCorrienteRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    clienteId: Joi.number().required().messages({
      'number.base': 'El ID del cliente debe ser un número',
      'any.required': 'El ID del cliente es requerido',
    }),
    tipoMovimiento: Joi.string().valid('factura', 'pago', 'ajuste', 'nota_credito', 'nota_debito', 'otros').required().messages({
      'string.base': 'El tipo de movimiento debe ser una cadena de texto',
      'any.only': 'El tipo de movimiento debe ser uno de: factura, pago, ajuste, nota_credito, nota_debito, otros',
      'any.required': 'El tipo de movimiento es requerido',
    }),
    referencia: Joi.string().max(100).required().messages({
      'string.base': 'La referencia debe ser una cadena de texto',
      'string.max': 'La referencia no puede exceder 100 caracteres',
      'any.required': 'La referencia es requerida',
    }),
    descripcion: Joi.string().required().messages({
      'string.base': 'La descripción debe ser una cadena de texto',
      'any.required': 'La descripción es requerida',
    }),
    monto: Joi.number().required().messages({
      'number.base': 'El monto debe ser un número',
      'any.required': 'El monto es requerido',
    }),
    saldoAnterior: Joi.number().optional().messages({
      'number.base': 'El saldo anterior debe ser un número',
    }),
    saldoNuevo: Joi.number().optional().messages({
      'number.base': 'El saldo nuevo debe ser un número',
    }),
    fechaMovimiento: Joi.date().required().messages({
      'date.base': 'La fecha de movimiento debe ser una fecha válida',
      'any.required': 'La fecha de movimiento es requerida',
    }),
    fechaVencimiento: Joi.date().optional().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
    }),
    facturaId: Joi.number().optional().messages({
      'number.base': 'El ID de la factura debe ser un número',
    }),
    pagoId: Joi.number().optional().messages({
      'number.base': 'El ID del pago debe ser un número',
    }),
    ordenCompraId: Joi.number().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
    }),
    observaciones: Joi.string().optional().messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
    }),
    estado: Joi.string().valid('activo', 'cancelado', 'vencido').optional().messages({
      'string.base': 'El estado debe ser una cadena de texto',
      'any.only': 'El estado debe ser uno de: activo, cancelado, vencido',
    }),
    procesadoPor: Joi.number().optional().messages({
      'number.base': 'El ID del usuario procesador debe ser un número',
    }),
  });

  private updateSchema = Joi.object({
    clienteId: Joi.number().optional().messages({
      'number.base': 'El ID del cliente debe ser un número',
    }),
    tipoMovimiento: Joi.string().valid('factura', 'pago', 'ajuste', 'nota_credito', 'nota_debito', 'otros').optional().messages({
      'string.base': 'El tipo de movimiento debe ser una cadena de texto',
      'any.only': 'El tipo de movimiento debe ser uno de: factura, pago, ajuste, nota_credito, nota_debito, otros',
    }),
    referencia: Joi.string().max(100).optional().messages({
      'string.base': 'La referencia debe ser una cadena de texto',
      'string.max': 'La referencia no puede exceder 100 caracteres',
    }),
    descripcion: Joi.string().optional().messages({
      'string.base': 'La descripción debe ser una cadena de texto',
    }),
    monto: Joi.number().optional().messages({
      'number.base': 'El monto debe ser un número',
    }),
    saldoAnterior: Joi.number().optional().messages({
      'number.base': 'El saldo anterior debe ser un número',
    }),
    saldoNuevo: Joi.number().optional().messages({
      'number.base': 'El saldo nuevo debe ser un número',
    }),
    fechaMovimiento: Joi.date().optional().messages({
      'date.base': 'La fecha de movimiento debe ser una fecha válida',
    }),
    fechaVencimiento: Joi.date().optional().messages({
      'date.base': 'La fecha de vencimiento debe ser una fecha válida',
    }),
    facturaId: Joi.number().optional().messages({
      'number.base': 'El ID de la factura debe ser un número',
    }),
    pagoId: Joi.number().optional().messages({
      'number.base': 'El ID del pago debe ser un número',
    }),
    ordenCompraId: Joi.number().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
    }),
    observaciones: Joi.string().optional().messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
    }),
    estado: Joi.string().valid('activo', 'cancelado', 'vencido').optional().messages({
      'string.base': 'El estado debe ser una cadena de texto',
      'any.only': 'El estado debe ser uno de: activo, cancelado, vencido',
    }),
    procesadoPor: Joi.number().optional().messages({
      'number.base': 'El ID del usuario procesador debe ser un número',
    }),
  });

  // Métodos de la interfaz IBaseService
  async getAll(filters?: CuentaCorrienteFilters): Promise<PaginatedResponse<CuentaCorriente>> {
    return this.cuentaCorrienteRepository.findAll(filters);
  }

  async getById(id: number): Promise<CuentaCorriente | null> {
    return this.cuentaCorrienteRepository.findById(id);
  }

  async create(data: CreateCuentaCorrienteDto): Promise<CuentaCorriente> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar que el cliente existe
    const clienteExiste = await this.cuentaCorrienteRepository.exists(data.clienteId);
    if (!clienteExiste) {
      throw new Error('El cliente especificado no existe');
    }

    // Verificar referencias si se proporcionan
    if (data.facturaId) {
      const facturaExiste = await this.cuentaCorrienteRepository.exists(data.facturaId);
      if (!facturaExiste) {
        throw new Error('La factura especificada no existe');
      }
    }

    if (data.pagoId) {
      const pagoExiste = await this.cuentaCorrienteRepository.exists(data.pagoId);
      if (!pagoExiste) {
        throw new Error('El pago especificado no existe');
      }
    }

    if (data.ordenCompraId) {
      const ordenCompraExiste = await this.cuentaCorrienteRepository.exists(data.ordenCompraId);
      if (!ordenCompraExiste) {
        throw new Error('La orden de compra especificada no existe');
      }
    }

    // Crear el movimiento de cuenta corriente
    const cuentaCorriente = await this.cuentaCorrienteRepository.create(data);

    return cuentaCorriente;
  }

  async update(id: number, data: UpdateCuentaCorrienteDto): Promise<CuentaCorriente | null> {
    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar que el movimiento existe
    const movimientoExiste = await this.cuentaCorrienteRepository.exists(id);
    if (!movimientoExiste) {
      throw new Error('El movimiento de cuenta corriente especificado no existe');
    }

    // Verificar referencias si se están cambiando
    if (data.clienteId) {
      const clienteExiste = await this.cuentaCorrienteRepository.exists(data.clienteId);
      if (!clienteExiste) {
        throw new Error('El cliente especificado no existe');
      }
    }

    if (data.facturaId) {
      const facturaExiste = await this.cuentaCorrienteRepository.exists(data.facturaId);
      if (!facturaExiste) {
        throw new Error('La factura especificada no existe');
      }
    }

    if (data.pagoId) {
      const pagoExiste = await this.cuentaCorrienteRepository.exists(data.pagoId);
      if (!pagoExiste) {
        throw new Error('El pago especificado no existe');
      }
    }

    if (data.ordenCompraId) {
      const ordenCompraExiste = await this.cuentaCorrienteRepository.exists(data.ordenCompraId);
      if (!ordenCompraExiste) {
        throw new Error('La orden de compra especificada no existe');
      }
    }

    // Actualizar el movimiento
    const cuentaCorriente = await this.cuentaCorrienteRepository.update(id, data);

    return cuentaCorriente;
  }

  async delete(id: number): Promise<boolean> {
    // Verificar que el movimiento existe
    const movimientoExiste = await this.cuentaCorrienteRepository.exists(id);
    if (!movimientoExiste) {
      throw new Error('El movimiento de cuenta corriente especificado no existe');
    }

    // Eliminar el movimiento
    return this.cuentaCorrienteRepository.delete(id);
  }

  validateCreate(data: CreateCuentaCorrienteDto): ValidationResult {
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

  validateUpdate(data: UpdateCuentaCorrienteDto): ValidationResult {
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
    return this.cuentaCorrienteRepository.exists(id);
  }

  // Métodos específicos para Cuenta Corriente
  async findByCliente(clienteId: number): Promise<CuentaCorriente[]> {
    return this.cuentaCorrienteRepository.findByCliente(clienteId);
  }

  async findByTipoMovimiento(tipoMovimiento: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros'): Promise<CuentaCorriente[]> {
    return this.cuentaCorrienteRepository.findByTipoMovimiento(tipoMovimiento);
  }

  async findByEstado(estado: 'activo' | 'cancelado' | 'vencido'): Promise<CuentaCorriente[]> {
    return this.cuentaCorrienteRepository.findByEstado(estado);
  }

  async getSaldoCliente(clienteId: number): Promise<number> {
    return this.cuentaCorrienteRepository.getSaldoCliente(clienteId);
  }

  async getMovimientosVencidos(fechaActual: Date = new Date()): Promise<CuentaCorriente[]> {
    return this.cuentaCorrienteRepository.getMovimientosVencidos(fechaActual);
  }

  async getMovimientosPorPeriodo(clienteId: number, fechaInicio: Date, fechaFin: Date): Promise<CuentaCorriente[]> {
    return this.cuentaCorrienteRepository.getMovimientosPorPeriodo(clienteId, fechaInicio, fechaFin);
  }

  async getEstadisticasPorCliente(clienteId: number): Promise<{
    saldoActual: number;
    totalFacturas: number;
    totalPagos: number;
    totalAjustes: number;
    montoTotalFacturas: number;
    montoTotalPagos: number;
    montoTotalAjustes: number;
    movimientosVencidos: number;
    montoVencido: number;
  }> {
    return this.cuentaCorrienteRepository.getEstadisticasPorCliente(clienteId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalClientes: number;
    totalMovimientos: number;
    saldoTotal: number;
    montoTotalFacturas: number;
    montoTotalPagos: number;
    montoTotalAjustes: number;
    movimientosVencidos: number;
    montoVencido: number;
    promedioSaldoPorCliente: number;
    clientesConSaldo: number;
  }> {
    return this.cuentaCorrienteRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  async actualizarEstadosVencidos(): Promise<void> {
    await this.cuentaCorrienteRepository.actualizarEstadosVencidos();
  }

  async cancelarMovimiento(id: number, procesadoPor?: number): Promise<CuentaCorriente | null> {
    // Verificar que el movimiento existe
    const movimientoExiste = await this.cuentaCorrienteRepository.exists(id);
    if (!movimientoExiste) {
      throw new Error('El movimiento de cuenta corriente especificado no existe');
    }

    return this.cuentaCorrienteRepository.cancelarMovimiento(id, procesadoPor);
  }

  async reactivarMovimiento(id: number, procesadoPor?: number): Promise<CuentaCorriente | null> {
    // Verificar que el movimiento existe
    const movimientoExiste = await this.cuentaCorrienteRepository.exists(id);
    if (!movimientoExiste) {
      throw new Error('El movimiento de cuenta corriente especificado no existe');
    }

    return this.cuentaCorrienteRepository.reactivarMovimiento(id, procesadoPor);
  }

  // Métodos de negocio específicos
  async crearMovimientoAutomatico(data: {
    clienteId: number;
    tipoMovimiento: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros';
    referencia: string;
    descripcion: string;
    monto: number;
    fechaMovimiento: Date;
    fechaVencimiento?: Date;
    facturaId?: number;
    pagoId?: number;
    ordenCompraId?: number;
    observaciones?: string;
    procesadoPor?: number;
  }): Promise<CuentaCorriente> {
    // Obtener el saldo actual del cliente
    const saldoAnterior = await this.getSaldoCliente(data.clienteId);
    
    // Calcular el nuevo saldo según el tipo de movimiento
    let saldoNuevo = saldoAnterior;
    if (data.tipoMovimiento === 'factura' || data.tipoMovimiento === 'nota_debito') {
      saldoNuevo += data.monto; // Aumenta el saldo (deuda)
    } else if (data.tipoMovimiento === 'pago' || data.tipoMovimiento === 'nota_credito') {
      saldoNuevo -= data.monto; // Disminuye el saldo (pago)
    } else if (data.tipoMovimiento === 'ajuste') {
      saldoNuevo += data.monto; // Los ajustes pueden ser positivos o negativos
    }

    const createData: CreateCuentaCorrienteDto = {
      ...data,
      saldoAnterior,
      saldoNuevo,
      estado: 'activo',
    };

    return this.create(createData);
  }

  async generarEstadoCuenta(clienteId: number, fechaInicio: Date, fechaFin: Date): Promise<{
    cliente: any;
    saldoInicial: number;
    saldoFinal: number;
    movimientos: CuentaCorriente[];
    resumen: {
      totalFacturas: number;
      totalPagos: number;
      totalAjustes: number;
      montoTotalFacturas: number;
      montoTotalPagos: number;
      montoTotalAjustes: number;
    };
  }> {
    // Obtener el saldo inicial (antes de la fecha de inicio)
    const movimientosAnteriores = await this.getMovimientosPorPeriodo(
      clienteId,
      new Date(0), // Desde el inicio de los tiempos
      new Date(fechaInicio.getTime() - 1) // Hasta un día antes de la fecha de inicio
    );
    
    const saldoInicial = movimientosAnteriores.length > 0 
      ? movimientosAnteriores[movimientosAnteriores.length - 1]?.saldoNuevo || 0
      : 0;

    // Obtener los movimientos del período
    const movimientos = await this.getMovimientosPorPeriodo(clienteId, fechaInicio, fechaFin);
    
    // Calcular el saldo final
    const saldoFinal = movimientos.length > 0 
      ? movimientos[movimientos.length - 1]?.saldoNuevo || saldoInicial
      : saldoInicial;

    // Calcular resumen
    const facturas = movimientos.filter(m => m.tipoMovimiento === 'factura');
    const pagos = movimientos.filter(m => m.tipoMovimiento === 'pago');
    const ajustes = movimientos.filter(m => m.tipoMovimiento === 'ajuste');

    const montoTotalFacturas = facturas.reduce((sum, f) => sum + f.monto, 0);
    const montoTotalPagos = pagos.reduce((sum, p) => sum + p.monto, 0);
    const montoTotalAjustes = ajustes.reduce((sum, a) => sum + a.monto, 0);

    return {
      cliente: null, // Se puede obtener del repositorio de clientes
      saldoInicial,
      saldoFinal,
      movimientos,
      resumen: {
        totalFacturas: facturas.length,
        totalPagos: pagos.length,
        totalAjustes: ajustes.length,
        montoTotalFacturas,
        montoTotalPagos,
        montoTotalAjustes,
      },
    };
  }

  async obtenerAlertasCobranza(): Promise<{
    movimientosVencidos: CuentaCorriente[];
    clientesConSaldoAlto: Array<{ clienteId: number; saldo: number }>;
    resumen: {
      totalVencido: number;
      montoTotalVencido: number;
      clientesConSaldoAlto: number;
    };
  }> {
    const movimientosVencidos = await this.getMovimientosVencidos();
    
    // Aquí se podría implementar lógica para identificar clientes con saldo alto
    // Por ahora retornamos un array vacío
    const clientesConSaldoAlto: Array<{ clienteId: number; saldo: number }> = [];

    const montoTotalVencido = movimientosVencidos.reduce((sum, m) => sum + m.saldoNuevo, 0);

    return {
      movimientosVencidos,
      clientesConSaldoAlto,
      resumen: {
        totalVencido: movimientosVencidos.length,
        montoTotalVencido,
        clientesConSaldoAlto: clientesConSaldoAlto.length,
      },
    };
  }
} 