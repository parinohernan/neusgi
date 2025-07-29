import { Equipo, CreateEquipoDto, UpdateEquipoDto, EquipoFilters, PaginatedResponse, ValidationResult, ValidationError } from '@/types';
import { IBaseService } from './interfaces/IBaseService';
import { EquipoRepository } from '@/repositories/EquipoRepository';
import Joi from 'joi';

export class EquipoService implements IBaseService<Equipo, CreateEquipoDto, UpdateEquipoDto> {
  private equipoRepository: EquipoRepository;

  constructor(equipoRepository: EquipoRepository) {
    this.equipoRepository = equipoRepository;
  }

  async getAll(filters?: EquipoFilters): Promise<PaginatedResponse<Equipo>> {
    return this.equipoRepository.findAll(filters);
  }

  async getById(id: number): Promise<Equipo | null> {
    return this.equipoRepository.findById(id);
  }

  async create(data: CreateEquipoDto): Promise<Equipo> {
    // Validar datos antes de crear
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar si la patente ya existe
    const existingEquipo = await this.equipoRepository.findByPatente(data.patente);
    if (existingEquipo) {
      throw new Error('Ya existe un equipo con esa patente');
    }

    return this.equipoRepository.create(data);
  }

  async update(id: number, data: UpdateEquipoDto): Promise<Equipo | null> {
    // Validar datos antes de actualizar
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar si el equipo existe
    const existingEquipo = await this.equipoRepository.findById(id);
    if (!existingEquipo) {
      throw new Error('Equipo no encontrado');
    }

    // Si se está actualizando la patente, verificar que no exista otro equipo con esa patente
    if (data.patente && data.patente !== existingEquipo.patente) {
      const equipoConPatente = await this.equipoRepository.findByPatente(data.patente);
      if (equipoConPatente) {
        throw new Error('Ya existe otro equipo con esa patente');
      }
    }

    return this.equipoRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si el equipo existe
    const existingEquipo = await this.equipoRepository.findById(id);
    if (!existingEquipo) {
      throw new Error('Equipo no encontrado');
    }

    // Verificar que el equipo no esté en uso
    if (existingEquipo.estado === 'ocupado') {
      throw new Error('No se puede eliminar un equipo que está en uso');
    }

    return this.equipoRepository.delete(id);
  }

  validateCreate(data: CreateEquipoDto): ValidationResult {
    const schema = Joi.object({
      patente: Joi.string().min(3).max(20).required().messages({
        'string.min': 'La patente debe tener al menos 3 caracteres',
        'string.max': 'La patente no puede exceder 20 caracteres',
        'any.required': 'La patente es requerida',
      }),
      modelo: Joi.string().min(2).max(50).required().messages({
        'string.min': 'El modelo debe tener al menos 2 caracteres',
        'string.max': 'El modelo no puede exceder 50 caracteres',
        'any.required': 'El modelo es requerido',
      }),
      capacidadKg: Joi.number().positive().required().messages({
        'number.base': 'La capacidad debe ser un número',
        'number.positive': 'La capacidad debe ser positiva',
        'any.required': 'La capacidad es requerida',
      }),
      estado: Joi.string().valid('disponible', 'mantenimiento', 'ocupado').optional().messages({
        'any.only': 'El estado debe ser disponible, mantenimiento u ocupado',
      }),
      fechaUltimoMantenimiento: Joi.date().optional().messages({
        'date.base': 'La fecha de mantenimiento debe ser válida',
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

  validateUpdate(data: UpdateEquipoDto): ValidationResult {
    const schema = Joi.object({
      patente: Joi.string().min(3).max(20).optional().messages({
        'string.min': 'La patente debe tener al menos 3 caracteres',
        'string.max': 'La patente no puede exceder 20 caracteres',
      }),
      modelo: Joi.string().min(2).max(50).optional().messages({
        'string.min': 'El modelo debe tener al menos 2 caracteres',
        'string.max': 'El modelo no puede exceder 50 caracteres',
      }),
      capacidadKg: Joi.number().positive().optional().messages({
        'number.base': 'La capacidad debe ser un número',
        'number.positive': 'La capacidad debe ser positiva',
      }),
      estado: Joi.string().valid('disponible', 'mantenimiento', 'ocupado').optional().messages({
        'any.only': 'El estado debe ser disponible, mantenimiento u ocupado',
      }),
      fechaUltimoMantenimiento: Joi.date().optional().messages({
        'date.base': 'La fecha de mantenimiento debe ser válida',
      }),
      imagenes: Joi.array().items(
        Joi.object({
          descripcion: Joi.string().min(1).max(200).required().messages({
            'string.min': 'La descripción debe tener al menos 1 carácter',
            'string.max': 'La descripción no puede exceder 200 caracteres',
            'any.required': 'La descripción es requerida',
          }),
          url: Joi.string().uri().required().messages({
            'string.uri': 'La URL debe ser válida',
            'any.required': 'La URL es requerida',
          }),
          destacada: Joi.boolean().required().messages({
            'boolean.base': 'El campo destacada debe ser un booleano',
            'any.required': 'El campo destacada es requerido',
          }),
        })
      ).max(10).optional().messages({
        'array.max': 'No se pueden agregar más de 10 imágenes',
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

  async exists(id: number): Promise<boolean> {
    return this.equipoRepository.exists(id);
  }

  // Métodos específicos del servicio de equipos
  async findDisponibles(): Promise<Equipo[]> {
    return this.equipoRepository.findDisponibles();
  }

  async findByPatente(patente: string): Promise<Equipo | null> {
    return this.equipoRepository.findByPatente(patente);
  }

  async cambiarEstado(id: number, estado: 'disponible' | 'mantenimiento' | 'ocupado'): Promise<Equipo | null> {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    return this.equipoRepository.cambiarEstado(id, estado);
  }

  async registrarMantenimiento(id: number, fechaMantenimiento: Date): Promise<Equipo | null> {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    return this.equipoRepository.registrarMantenimiento(id, fechaMantenimiento);
  }

  async verificarDisponibilidad(id: number, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    return this.equipoRepository.verificarDisponibilidad(id, fechaInicio, fechaFin);
  }

  async getEstadisticas(): Promise<{
    total: number;
    disponibles: number;
    enMantenimiento: number;
    ocupados: number;
  }> {
    const equipos = await this.equipoRepository.findAll({ limit: 1000 });
    
    const total = equipos.total;
    const disponibles = equipos.data.filter(e => e.estado === 'disponible').length;
    const enMantenimiento = equipos.data.filter(e => e.estado === 'mantenimiento').length;
    const ocupados = equipos.data.filter(e => e.estado === 'ocupado').length;

    return {
      total,
      disponibles,
      enMantenimiento,
      ocupados,
    };
  }
} 