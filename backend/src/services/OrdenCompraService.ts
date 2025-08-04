import Joi from 'joi';
import { OrdenCompraRepository } from '@/repositories/OrdenCompraRepository';
import { OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class OrdenCompraService implements IBaseService<OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto> {
  private ordenCompraRepository: OrdenCompraRepository;

  constructor(ordenCompraRepository: OrdenCompraRepository) {
    this.ordenCompraRepository = ordenCompraRepository;
  }

  private createSchema = Joi.object({
    presupuestoId: Joi.number().integer().positive().required(),
    fechaInicio: Joi.date().required(),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).required(),
    origen: Joi.string().max(100).required(),
    destino: Joi.string().max(100).required(),
    observaciones: Joi.string().optional().allow('', null),
    documentos: Joi.array().items(Joi.string().uri()).optional(),
    imagenes: Joi.array().items(Joi.string().uri()).optional(),
    estado: Joi.string().valid('activa', 'completada', 'cancelada').default('activa')
  });

  private updateSchema = Joi.object({
    presupuestoId: Joi.number().integer().positive().optional(),
    fechaInicio: Joi.date().optional(),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).optional(),
    origen: Joi.string().max(100).optional(),
    destino: Joi.string().max(100).optional(),
    observaciones: Joi.string().optional().allow('', null),
    documentos: Joi.array().items(Joi.string().uri()).optional(),
    imagenes: Joi.array().items(Joi.string().uri()).optional(),
    estado: Joi.string().valid('activa', 'completada', 'cancelada').optional()
  });

  async getAll(filters?: any): Promise<PaginatedResponse<OrdenCompra>> {
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
    const ordenCompraExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenCompraExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    return this.ordenCompraRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }

    // Verificar si la orden de compra existe
    const ordenCompraExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenCompraExistente) {
      throw new Error('Orden de compra no encontrada');
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

  async cambiarEstado(id: number, estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de orden de compra inválido');
    }

    if (!['activa', 'completada', 'cancelada'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Verificar si la orden de compra existe
    const ordenCompraExistente = await this.ordenCompraRepository.findById(id);
    if (!ordenCompraExistente) {
      throw new Error('Orden de compra no encontrada');
    }

    return this.ordenCompraRepository.cambiarEstado(id, estado);
  }
} 