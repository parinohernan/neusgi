import Joi from 'joi';
import { ParteDiarioRepository } from '@/repositories/ParteDiarioRepository';
import { ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class ParteDiarioService implements IBaseService<ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto> {
  private parteDiarioRepository: ParteDiarioRepository;

  constructor(parteDiarioRepository: ParteDiarioRepository) {
    this.parteDiarioRepository = parteDiarioRepository;
  }

  private createSchema = Joi.object({
    ordenCompraId: Joi.number().required(),
    fecha: Joi.date().required(),
    conductorId: Joi.number().optional(),
    equipoId: Joi.number().optional(),
    observaciones: Joi.string().optional(),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional(),
    combustibleConsumido: Joi.number().min(0).optional(),
    horasTrabajadas: Joi.number().min(0).optional(),
    kmFinal: Joi.number().min(0).optional(),
    kmInicial: Joi.number().min(0).optional(),
    codigo: Joi.string().max(50).optional(),
  });

  private updateSchema = Joi.object({
    ordenCompraId: Joi.number().optional(),
    fecha: Joi.date().optional(),
    conductorId: Joi.number().optional(),
    equipoId: Joi.number().optional(),
    observaciones: Joi.string().optional(),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional(),
    combustibleConsumido: Joi.number().min(0).optional(),
    horasTrabajadas: Joi.number().min(0).optional(),
    kmFinal: Joi.number().min(0).optional(),
    kmInicial: Joi.number().min(0).optional(),
    codigo: Joi.string().max(50).optional(),
  });

  async getAll(filters?: any): Promise<PaginatedResponse<ParteDiario>> {
    return this.parteDiarioRepository.findAll(filters);
  }

  async getById(id: number): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }
    return this.parteDiarioRepository.findById(id);
  }

  async create(data: CreateParteDiarioDto): Promise<ParteDiario> {
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }
    return this.parteDiarioRepository.create(data);
  }

  async update(id: number, data: UpdateParteDiarioDto): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }
    const parteDiarioExistente = await this.parteDiarioRepository.findById(id);
    if (!parteDiarioExistente) {
      throw new Error('Parte diario no encontrado');
    }
    return this.parteDiarioRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }
    const parteDiarioExistente = await this.parteDiarioRepository.findById(id);
    if (!parteDiarioExistente) {
      throw new Error('Parte diario no encontrado');
    }
    return this.parteDiarioRepository.delete(id);
  }

  validateCreate(data: CreateParteDiarioDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdateParteDiarioDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return (await this.parteDiarioRepository.findById(id)) !== null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<ParteDiario[]> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }

    return this.parteDiarioRepository.findByOrdenCompra(ordenCompraId);
  }
} 