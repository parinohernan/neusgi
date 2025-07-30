import Joi from 'joi';
import { PresupuestoRepository } from '@/repositories/PresupuestoRepository';
import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto, PresupuestoFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class PresupuestoService implements IBaseService<Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto> {
  private presupuestoRepository: PresupuestoRepository;

  constructor(presupuestoRepository: PresupuestoRepository) {
    this.presupuestoRepository = presupuestoRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    clienteId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del cliente debe ser un número',
      'number.integer': 'El ID del cliente debe ser un número entero',
      'number.positive': 'El ID del cliente debe ser positivo',
      'any.required': 'El ID del cliente es requerido',
    }),
    equipoId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del equipo debe ser un número',
      'number.integer': 'El ID del equipo debe ser un número entero',
      'number.positive': 'El ID del equipo debe ser positivo',
      'any.required': 'El ID del equipo es requerido',
    }),
    usuarioId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
      'any.required': 'El ID del usuario es requerido',
    }),
    descripcion: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
      'any.required': 'La descripción es requerida',
    }),
    costo: Joi.number().positive().precision(2).required().messages({
      'number.base': 'El costo debe ser un número',
      'number.positive': 'El costo debe ser positivo',
      'number.precision': 'El costo debe tener máximo 2 decimales',
      'any.required': 'El costo es requerido',
    }),
    validoHasta: Joi.date().greater('now').required().messages({
      'date.base': 'La fecha de validez debe ser una fecha válida',
      'date.greater': 'La fecha de validez debe ser posterior a la fecha actual',
      'any.required': 'La fecha de validez es requerida',
    }),
    estado: Joi.string().valid('pendiente', 'aceptado', 'rechazado').optional().messages({
      'string.valid': 'El estado debe ser: pendiente, aceptado o rechazado',
    }),
  });

  private updateSchema = Joi.object({
    clienteId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del cliente debe ser un número',
      'number.integer': 'El ID del cliente debe ser un número entero',
      'number.positive': 'El ID del cliente debe ser positivo',
    }),
    equipoId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del equipo debe ser un número',
      'number.integer': 'El ID del equipo debe ser un número entero',
      'number.positive': 'El ID del equipo debe ser positivo',
    }),
    usuarioId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
    }),
    descripcion: Joi.string().min(10).max(500).optional().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
    }),
    costo: Joi.number().positive().precision(2).optional().messages({
      'number.base': 'El costo debe ser un número',
      'number.positive': 'El costo debe ser positivo',
      'number.precision': 'El costo debe tener máximo 2 decimales',
    }),
    validoHasta: Joi.date().optional().messages({
      'date.base': 'La fecha de validez debe ser una fecha válida',
    }),
    estado: Joi.string().valid('pendiente', 'aceptado', 'rechazado').optional().messages({
      'string.valid': 'El estado debe ser: pendiente, aceptado o rechazado',
    }),
  });

  async getAll(filters?: PresupuestoFilters): Promise<PaginatedResponse<Presupuesto>> {
    return this.presupuestoRepository.findAll(filters);
  }

  async getById(id: number): Promise<Presupuesto | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }
    return this.presupuestoRepository.findById(id);
  }

  async create(data: CreatePresupuestoDto): Promise<Presupuesto> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que el cliente existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de clientes

    // Verificar que el equipo existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de equipos

    // Verificar que el usuario existe
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de usuarios

    return this.presupuestoRepository.create(data);
  }

  async update(id: number, data: UpdatePresupuestoDto): Promise<Presupuesto | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si el presupuesto existe
    const presupuestoExistente = await this.presupuestoRepository.findById(id);
    if (!presupuestoExistente) {
      throw new Error('Presupuesto no encontrado');
    }

    // Si se está cambiando el estado a 'aceptado', verificar que no haya otros presupuestos aceptados para el mismo equipo en el mismo período
    if (data.estado === 'aceptado') {
      // Obtener el primer equipo del presupuesto para verificar conflictos
      const presupuestosAceptados = await this.presupuestoRepository.findByEquipo(presupuestoExistente.equipos?.[0]?.id || 0);
      const presupuestosEnConflicto = presupuestosAceptados.filter(p => 
        p.id !== id && 
        p.estado === 'aceptado' &&
        new Date(p.validoHasta) >= new Date()
      );
      
      if (presupuestosEnConflicto.length > 0) {
        throw new Error('Ya existe un presupuesto aceptado para este equipo en el período especificado');
      }
    }

    return this.presupuestoRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    // Verificar si el presupuesto existe
    const presupuestoExistente = await this.presupuestoRepository.findById(id);
    if (!presupuestoExistente) {
      throw new Error('Presupuesto no encontrado');
    }

    // Verificar si el presupuesto está aceptado (no se puede eliminar)
    if (presupuestoExistente.estado === 'aceptado') {
      throw new Error('No se puede eliminar un presupuesto aceptado');
    }

    return this.presupuestoRepository.delete(id);
  }

  validateCreate(data: CreatePresupuestoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdatePresupuestoDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return this.presupuestoRepository.exists(id);
  }

  // Métodos específicos para presupuestos
  async findByCliente(clienteId: number): Promise<Presupuesto[]> {
    if (!clienteId || isNaN(clienteId)) {
      throw new Error('ID de cliente inválido');
    }
    return this.presupuestoRepository.findByCliente(clienteId);
  }

  async findByEquipo(equipoId: number): Promise<Presupuesto[]> {
    if (!equipoId || isNaN(equipoId)) {
      throw new Error('ID de equipo inválido');
    }
    return this.presupuestoRepository.findByEquipo(equipoId);
  }

  async findByEstado(estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto[]> {
    if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.presupuestoRepository.findByEstado(estado);
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Verificar si el presupuesto existe
    const presupuestoExistente = await this.presupuestoRepository.findById(id);
    if (!presupuestoExistente) {
      throw new Error('Presupuesto no encontrado');
    }

    // Si se está cambiando a 'aceptado', verificar conflictos
    if (estado === 'aceptado') {
      const presupuestosAceptados = await this.presupuestoRepository.findByEquipo(presupuestoExistente.equipos?.[0]?.id || 0);
      const presupuestosEnConflicto = presupuestosAceptados.filter(p => 
        p.id !== id && 
        p.estado === 'aceptado' &&
        new Date(p.validoHasta) >= new Date()
      );
      
      if (presupuestosEnConflicto.length > 0) {
        throw new Error('Ya existe un presupuesto aceptado para este equipo en el período especificado');
      }
    }

    return this.presupuestoRepository.cambiarEstado(id, estado);
  }

  async getPresupuestosVencidos(): Promise<Presupuesto[]> {
    return this.presupuestoRepository.getPresupuestosVencidos();
  }

  async getPresupuestosPorVencer(dias: number = 7): Promise<Presupuesto[]> {
    if (dias < 1 || dias > 30) {
      throw new Error('Los días deben estar entre 1 y 30');
    }
    return this.presupuestoRepository.getPresupuestosPorVencer(dias);
  }

  async getEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    aceptados: number;
    rechazados: number;
    vencidos: number;
    valorTotal: number;
  }> {
    return this.presupuestoRepository.getEstadisticas();
  }
} 