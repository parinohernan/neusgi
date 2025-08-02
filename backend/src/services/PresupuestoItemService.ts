import { PresupuestoItem, CreatePresupuestoItemDto, UpdatePresupuestoItemDto, ValidationResult, ValidationError, PaginationQuery, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';
import { PresupuestoItemRepository } from '@/repositories/PresupuestoItemRepository';
import Joi from 'joi';

export class PresupuestoItemService implements IBaseService<PresupuestoItem, CreatePresupuestoItemDto, UpdatePresupuestoItemDto> {
  private presupuestoItemRepository: PresupuestoItemRepository;

  constructor(presupuestoItemRepository: PresupuestoItemRepository) {
    this.presupuestoItemRepository = presupuestoItemRepository;
  }

  async getAll(_filters?: PaginationQuery): Promise<PaginatedResponse<PresupuestoItem>> {
    const response = await this.presupuestoItemRepository.findAll();
    return response;
  }

  async getById(id: number): Promise<PresupuestoItem | null> {
    return this.presupuestoItemRepository.findById(id);
  }

  async create(data: CreatePresupuestoItemDto): Promise<PresupuestoItem> {
    // Validar datos antes de crear
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Obtener el siguiente número de item
    const numero = await this.presupuestoItemRepository.getNextNumero(data.presupuestoId);
    
    // Calcular el precio total si no se proporciona
    const precioTotal = data.precioTotal || (data.cantidad * data.precioUnitario);

    const itemData = {
      ...data,
      numero,
      precioTotal,
    };

    return this.presupuestoItemRepository.create(itemData);
  }

  async update(id: number, data: UpdatePresupuestoItemDto): Promise<PresupuestoItem | null> {
    // Validar datos antes de actualizar
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar si el item existe
    const existingItem = await this.presupuestoItemRepository.findById(id);
    if (!existingItem) {
      throw new Error('Item de presupuesto no encontrado');
    }

    // Calcular el precio total si se actualizan cantidad o precio unitario
    let precioTotal = data.precioTotal;
    if (data.cantidad !== undefined || data.precioUnitario !== undefined) {
      const cantidad = data.cantidad ?? existingItem.cantidad;
      const precioUnitario = data.precioUnitario ?? existingItem.precioUnitario;
      precioTotal = cantidad * precioUnitario;
    }

    const updateData: UpdatePresupuestoItemDto = {
      ...data,
      ...(precioTotal !== undefined && { precioTotal }),
    };

    return this.presupuestoItemRepository.update(id, updateData);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si el item existe
    const existingItem = await this.presupuestoItemRepository.findById(id);
    if (!existingItem) {
      throw new Error('Item de presupuesto no encontrado');
    }

    return this.presupuestoItemRepository.delete(id);
  }

  async findByPresupuestoId(presupuestoId: number): Promise<PresupuestoItem[]> {
    return this.presupuestoItemRepository.findByPresupuestoId(presupuestoId);
  }

  async deleteByPresupuestoId(presupuestoId: number): Promise<boolean> {
    return this.presupuestoItemRepository.deleteByPresupuestoId(presupuestoId);
  }

  async exists(id: number): Promise<boolean> {
    return this.presupuestoItemRepository.exists(id);
  }

  validateCreate(data: CreatePresupuestoItemDto): ValidationResult {
    const schema = Joi.object({
      presupuestoId: Joi.number().positive().required().messages({
        'number.base': 'El ID del presupuesto debe ser un número',
        'number.positive': 'El ID del presupuesto debe ser positivo',
        'any.required': 'El ID del presupuesto es requerido',
      }),
      numero: Joi.number().positive().required().messages({
        'number.base': 'El número debe ser un número',
        'number.positive': 'El número debe ser positivo',
        'any.required': 'El número es requerido',
      }),
      descripcion: Joi.string().min(1).max(500).required().messages({
        'string.min': 'La descripción debe tener al menos 1 carácter',
        'string.max': 'La descripción no puede exceder 500 caracteres',
        'any.required': 'La descripción es requerida',
      }),
      cantidad: Joi.number().positive().required().messages({
        'number.base': 'La cantidad debe ser un número',
        'number.positive': 'La cantidad debe ser positiva',
        'any.required': 'La cantidad es requerida',
      }),
      unidad: Joi.string().min(1).max(20).required().messages({
        'string.min': 'La unidad debe tener al menos 1 carácter',
        'string.max': 'La unidad no puede exceder 20 caracteres',
        'any.required': 'La unidad es requerida',
      }),
      precioUnitario: Joi.number().positive().required().messages({
        'number.base': 'El precio unitario debe ser un número',
        'number.positive': 'El precio unitario debe ser positivo',
        'any.required': 'El precio unitario es requerido',
      }),
      precioTotal: Joi.number().positive().required().messages({
        'number.base': 'El precio total debe ser un número',
        'number.positive': 'El precio total debe ser positivo',
        'any.required': 'El precio total es requerido',
      }),
      observaciones: Joi.string().max(1000).optional().messages({
        'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
      }),
    });

    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path[0] as string,
        message: detail.message,
      }));
      
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  validateUpdate(data: UpdatePresupuestoItemDto): ValidationResult {
    const schema = Joi.object({
      numero: Joi.number().positive().optional().messages({
        'number.base': 'El número debe ser un número',
        'number.positive': 'El número debe ser positivo',
      }),
      descripcion: Joi.string().min(1).max(500).optional().messages({
        'string.min': 'La descripción debe tener al menos 1 carácter',
        'string.max': 'La descripción no puede exceder 500 caracteres',
      }),
      cantidad: Joi.number().positive().optional().messages({
        'number.base': 'La cantidad debe ser un número',
        'number.positive': 'La cantidad debe ser positiva',
      }),
      unidad: Joi.string().min(1).max(20).optional().messages({
        'string.min': 'La unidad debe tener al menos 1 carácter',
        'string.max': 'La unidad no puede exceder 20 caracteres',
      }),
      precioUnitario: Joi.number().positive().optional().messages({
        'number.base': 'El precio unitario debe ser un número',
        'number.positive': 'El precio unitario debe ser positivo',
      }),
      precioTotal: Joi.number().positive().optional().messages({
        'number.base': 'El precio total debe ser un número',
        'number.positive': 'El precio total debe ser positivo',
      }),
      observaciones: Joi.string().max(1000).optional().messages({
        'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
      }),
    });

    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path[0] as string,
        message: detail.message,
      }));
      
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }
} 