import Joi from 'joi';
import { OrdenCompraRepository } from '@/repositories/OrdenCompraRepository';
import { OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto, OrdenCompraFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class OrdenCompraService implements IBaseService<OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto> {
  private ordenCompraRepository: OrdenCompraRepository;

  constructor(ordenCompraRepository: OrdenCompraRepository) {
    this.ordenCompraRepository = ordenCompraRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    presupuestoId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del presupuesto debe ser un número',
      'number.integer': 'El ID del presupuesto debe ser un número entero',
      'number.positive': 'El ID del presupuesto debe ser positivo',
      'any.required': 'El ID del presupuesto es requerido',
    }),
    fechaInicio: Joi.date().required().messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'any.required': 'La fecha de inicio es requerida',
    }),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).required().messages({
      'date.base': 'La fecha de fin debe ser una fecha válida',
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
      'any.required': 'La fecha de fin es requerida',
    }),
    origen: Joi.string().min(3).max(200).required().messages({
      'string.min': 'El origen debe tener al menos 3 caracteres',
      'string.max': 'El origen no puede exceder 200 caracteres',
      'any.required': 'El origen es requerido',
    }),
    destino: Joi.string().min(3).max(200).required().messages({
      'string.min': 'El destino debe tener al menos 3 caracteres',
      'string.max': 'El destino no puede exceder 200 caracteres',
      'any.required': 'El destino es requerido',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    estado: Joi.string().valid('activa', 'completada', 'cancelada').optional().messages({
      'string.valid': 'El estado debe ser: activa, completada o cancelada',
    }),
  });

  private updateSchema = Joi.object({
    presupuestoId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del presupuesto debe ser un número',
      'number.integer': 'El ID del presupuesto debe ser un número entero',
      'number.positive': 'El ID del presupuesto debe ser positivo',
    }),
    fechaInicio: Joi.date().optional().messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
    }),
    fechaFin: Joi.date().optional().messages({
      'date.base': 'La fecha de fin debe ser una fecha válida',
    }),
    origen: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'El origen debe tener al menos 3 caracteres',
      'string.max': 'El origen no puede exceder 200 caracteres',
    }),
    destino: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'El destino debe tener al menos 3 caracteres',
      'string.max': 'El destino no puede exceder 200 caracteres',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    estado: Joi.string().valid('activa', 'completada', 'cancelada').optional().messages({
      'string.valid': 'El estado debe ser: activa, completada o cancelada',
    }),
  });

  async getAll(filters?: OrdenCompraFilters): Promise<PaginatedResponse<OrdenCompra>> {
    return this.ordenCompraRepository.findAll(filters);
  }

  async getById(id: number): Promise<OrdenCompra | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.ordenCompraRepository.findById(id);
  }

  async create(data: CreateOrdenCompraDto): Promise<OrdenCompra> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que el presupuesto existe y está aceptado
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de presupuestos

    // Verificar que no hay otra OC activa para el mismo presupuesto
    const ordenesExistentes = await this.ordenCompraRepository.findByPresupuesto(data.presupuestoId);
    const ordenActiva = ordenesExistentes.find(oc => oc.estado === 'activa');
    if (ordenActiva) {
      throw new Error('Ya existe una orden de compra activa para este presupuesto');
    }

    // Verificar que las fechas no se solapan con otras OC del mismo equipo
    // TODO: Implementar verificación de solapamiento de fechas

    return this.ordenCompraRepository.create(data);
  }

  async update(id: number, data: UpdateOrdenCompraDto): Promise<OrdenCompra | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si la orden de compra existe
    const ordenExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    // Si se está cambiando el estado a 'completada', verificar que se puede completar
    if (data.estado === 'completada') {
      if (ordenExistente.estado !== 'activa') {
        throw new Error('Solo se pueden completar órdenes de compra activas');
      }
      
      // Verificar que la fecha de fin ya pasó
      if (new Date() < ordenExistente.fechaFin) {
        throw new Error('No se puede completar una orden de compra antes de su fecha de fin');
      }
    }

    // Si se está cambiando el estado a 'cancelada', verificar que se puede cancelar
    if (data.estado === 'cancelada') {
      if (ordenExistente.estado === 'completada') {
        throw new Error('No se puede cancelar una orden de compra ya completada');
      }
    }

    return this.ordenCompraRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }

    // Verificar si la orden de compra existe
    const ordenExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    // Verificar si la orden de compra está activa (no se puede eliminar)
    if (ordenExistente.estado === 'activa') {
      throw new Error('No se puede eliminar una orden de compra activa');
    }

    return this.ordenCompraRepository.delete(id);
  }

  validateCreate(data: CreateOrdenCompraDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdateOrdenCompraDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return this.ordenCompraRepository.exists(id);
  }

  // Métodos específicos para órdenes de compra
  async findByPresupuesto(presupuestoId: number): Promise<OrdenCompra[]> {
    if (!presupuestoId || isNaN(presupuestoId)) {
      throw new Error('ID de presupuesto inválido');
    }
    return this.ordenCompraRepository.findByPresupuesto(presupuestoId);
  }

  async findByEstado(estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra[]> {
    if (!['activa', 'completada', 'cancelada'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.ordenCompraRepository.findByEstado(estado);
  }

  async findByCliente(clienteId: number): Promise<OrdenCompra[]> {
    if (!clienteId || isNaN(clienteId)) {
      throw new Error('ID de cliente inválido');
    }
    return this.ordenCompraRepository.findByCliente(clienteId);
  }

  async findByEquipo(equipoId: number): Promise<OrdenCompra[]> {
    if (!equipoId || isNaN(equipoId)) {
      throw new Error('ID de equipo inválido');
    }
    return this.ordenCompraRepository.findByEquipo(equipoId);
  }

  async cambiarEstado(id: number, estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }

    if (!['activa', 'completada', 'cancelada'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Verificar si la orden de compra existe
    const ordenExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    // Validaciones específicas por estado
    if (estado === 'completada') {
      if (ordenExistente.estado !== 'activa') {
        throw new Error('Solo se pueden completar órdenes de compra activas');
      }
      
      if (new Date() < ordenExistente.fechaFin) {
        throw new Error('No se puede completar una orden de compra antes de su fecha de fin');
      }
    }

    if (estado === 'cancelada') {
      if (ordenExistente.estado === 'completada') {
        throw new Error('No se puede cancelar una orden de compra ya completada');
      }
    }

    return this.ordenCompraRepository.cambiarEstado(id, estado);
  }

  async getOrdenesActivas(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.getOrdenesActivas();
  }

  async getOrdenesCompletadas(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.getOrdenesCompletadas();
  }

  async getOrdenesCanceladas(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.getOrdenesCanceladas();
  }

  async getOrdenesEnCurso(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.getOrdenesEnCurso();
  }

  async getOrdenesVencidas(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.getOrdenesVencidas();
  }

  async getEstadisticas(): Promise<{
    total: number;
    activas: number;
    completadas: number;
    canceladas: number;
    enCurso: number;
    vencidas: number;
  }> {
    return this.ordenCompraRepository.getEstadisticas();
  }

  // Métodos de negocio específicos
  async completarOrden(id: number): Promise<OrdenCompra | null> {
    return this.cambiarEstado(id, 'completada');
  }

  async cancelarOrden(id: number): Promise<OrdenCompra | null> {
    return this.cambiarEstado(id, 'cancelada');
  }

  async reactivarOrden(id: number): Promise<OrdenCompra | null> {
    const ordenExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    if (ordenExistente.estado !== 'cancelada') {
      throw new Error('Solo se pueden reactivar órdenes de compra canceladas');
    }

    return this.cambiarEstado(id, 'activa');
  }
} 