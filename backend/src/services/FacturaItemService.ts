import Joi from 'joi';
import { IBaseService } from './interfaces/IBaseService';
import { FacturaItemRepository } from '@/repositories/FacturaItemRepository';
import { FacturaItem, CreateFacturaItemDto, UpdateFacturaItemDto, PaginatedResponse, ValidationResult } from '@/types';

export class FacturaItemService implements IBaseService<FacturaItem, CreateFacturaItemDto, UpdateFacturaItemDto> {
  private facturaItemRepository: FacturaItemRepository;

  constructor(facturaItemRepository: FacturaItemRepository) {
    this.facturaItemRepository = facturaItemRepository;
  }

  private createSchema = Joi.object({
    facturaId: Joi.number().required(),
    numero: Joi.number().integer().min(1).required(),
    descripcion: Joi.string().min(1).max(1000).required(),
    cantidad: Joi.number().precision(2).min(0).required(),
    unidad: Joi.string().max(20).required(),
    precioUnitario: Joi.number().precision(2).min(0).required(),
    precioTotal: Joi.number().precision(2).min(0).required(),
    observaciones: Joi.string().max(1000).optional(),
  });

  private updateSchema = Joi.object({
    numero: Joi.number().integer().min(1).optional(),
    descripcion: Joi.string().min(1).max(1000).optional(),
    cantidad: Joi.number().precision(2).min(0).optional(),
    unidad: Joi.string().max(20).optional(),
    precioUnitario: Joi.number().precision(2).min(0).optional(),
    precioTotal: Joi.number().precision(2).min(0).optional(),
    observaciones: Joi.string().max(1000).optional(),
  });

  async getAll(filters?: any): Promise<PaginatedResponse<FacturaItem>> {
    return this.facturaItemRepository.findAll(filters);
  }

  async getById(id: number): Promise<FacturaItem | null> {
    return this.facturaItemRepository.findById(id);
  }

  validateCreate(data: CreateFacturaItemDto): ValidationResult {
    const { error } = this.createSchema.validate(data);
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }

    // Validar que el precio total sea igual a cantidad * precio unitario
    const precioCalculado = Number(data.cantidad) * Number(data.precioUnitario);
    if (Math.abs(precioCalculado - Number(data.precioTotal)) > 0.01) {
      return {
        isValid: false,
        errors: [{
          field: 'precioTotal',
          message: 'El precio total debe ser igual a cantidad × precio unitario'
        }]
      };
    }

    return { isValid: true, errors: [] };
  }

  validateUpdate(data: UpdateFacturaItemDto): ValidationResult {
    const { error } = this.updateSchema.validate(data);
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }

    return { isValid: true, errors: [] };
  }

  async create(data: CreateFacturaItemDto): Promise<FacturaItem> {
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Error de validación: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    return this.facturaItemRepository.create(data);
  }

  async update(id: number, data: UpdateFacturaItemDto): Promise<FacturaItem | null> {
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Error de validación: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Si se actualizan cantidad o precio unitario, recalcular precio total
    if (data.cantidad !== undefined || data.precioUnitario !== undefined) {
      const existingItem = await this.facturaItemRepository.findById(id);
      if (!existingItem) {
        throw new Error('Item de factura no encontrado');
      }

      const nuevaCantidad = data.cantidad ?? existingItem.cantidad;
      const nuevoPrecioUnitario = data.precioUnitario ?? existingItem.precioUnitario;
      data.precioTotal = Number(nuevaCantidad) * Number(nuevoPrecioUnitario);
    }

    return this.facturaItemRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.facturaItemRepository.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.facturaItemRepository.exists(id);
  }

  async count(filters?: any): Promise<number> {
    return this.facturaItemRepository.count(filters);
  }

  async findByFactura(facturaId: number): Promise<FacturaItem[]> {
    return this.facturaItemRepository.findByFactura(facturaId);
  }

  async createMany(items: CreateFacturaItemDto[]): Promise<FacturaItem[]> {
    // Validar todos los items
    for (const item of items) {
      const validation = this.validateCreate(item);
      if (!validation.isValid) {
        throw new Error(`Error de validación en item ${item.numero}: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    return this.facturaItemRepository.createMany(items);
  }

  async calcularTotalFactura(facturaId: number): Promise<number> {
    const items = await this.facturaItemRepository.findByFactura(facturaId);
    return items.reduce((total, item) => total + Number(item.precioTotal), 0);
  }
} 