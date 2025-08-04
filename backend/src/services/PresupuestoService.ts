import Joi from 'joi';
import { PresupuestoRepository } from '@/repositories/PresupuestoRepository';
import { EquipoRepository } from '@/repositories/EquipoRepository';
import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class PresupuestoService implements IBaseService<Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto> {
  private presupuestoRepository: PresupuestoRepository;
  private equipoRepository: EquipoRepository;

  constructor(presupuestoRepository: PresupuestoRepository, equipoRepository: EquipoRepository) {
    this.presupuestoRepository = presupuestoRepository;
    this.equipoRepository = equipoRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    clienteId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del cliente debe ser un número',
      'number.integer': 'El ID del cliente debe ser un número entero',
      'number.positive': 'El ID del cliente debe ser positivo',
      'any.required': 'El ID del cliente es requerido',
    }),
    equipoIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': 'Debe seleccionar al menos un equipo',
      'any.required': 'Los equipos son requeridos',
    }),
    usuarioId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 1000 caracteres',
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
    plazoEntrega: Joi.string().max(100).optional().messages({
      'string.max': 'El plazo de entrega no puede exceder 100 caracteres',
    }),
    lugarEntrega: Joi.string().max(200).optional().messages({
      'string.max': 'El lugar de entrega no puede exceder 200 caracteres',
    }),
    formaPago: Joi.string().max(100).optional().messages({
      'string.max': 'La forma de pago no puede exceder 100 caracteres',
    }),
    validez: Joi.string().max(100).optional().messages({
      'string.max': 'La validez no puede exceder 100 caracteres',
    }),
    items: Joi.array().items(Joi.object({
      id: Joi.number().integer().optional(), // Permitir id para actualizaciones
      presupuestoId: Joi.number().integer().optional(),
      numero: Joi.number().integer().positive().required(),
      descripcion: Joi.string().required(),
      cantidad: Joi.number().min(0).required(),
      unidad: Joi.string().required(),
      precioUnitario: Joi.number().min(0).required(),
      precioTotal: Joi.number().min(0).required(),
      observaciones: Joi.string().optional().allow('', null), // Permitir null
    })).optional().messages({
      'array.base': 'Los items deben ser un array',
    }),
  });

  private updateSchema = Joi.object({
    clienteId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del cliente debe ser un número',
      'number.integer': 'El ID del cliente debe ser un número entero',
      'number.positive': 'El ID del cliente debe ser positivo',
    }),
    equipoIds: Joi.array().items(Joi.number().integer().positive()).min(1).optional().allow(null).messages({
      'array.min': 'Debe seleccionar al menos un equipo',
      'array.base': 'Los equipos deben ser un array',
    }),
    usuarioId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
    }),
    descripcion: Joi.string().min(10).max(1000).optional().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 1000 caracteres',
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
    plazoEntrega: Joi.string().max(100).optional().messages({
      'string.max': 'El plazo de entrega no puede exceder 100 caracteres',
    }),
    lugarEntrega: Joi.string().max(200).optional().messages({
      'string.max': 'El lugar de entrega no puede exceder 200 caracteres',
    }),
    formaPago: Joi.string().max(100).optional().messages({
      'string.max': 'La forma de pago no puede exceder 100 caracteres',
    }),
    validez: Joi.string().max(100).optional().messages({
      'string.max': 'La validez no puede exceder 100 caracteres',
    }),
    items: Joi.array().items(Joi.object({
      id: Joi.number().integer().optional(), // Permitir id para actualizaciones
      presupuestoId: Joi.number().integer().optional(),
      numero: Joi.number().integer().positive().required(),
      descripcion: Joi.string().required(),
      cantidad: Joi.number().min(0).required(),
      unidad: Joi.string().required(),
      precioUnitario: Joi.number().min(0).required(),
      precioTotal: Joi.number().min(0).required(),
      observaciones: Joi.string().optional().allow('', null), // Permitir null
    })).optional().messages({
      'array.base': 'Los items deben ser un array',
    }),
  });

  async getAll(filters?: any): Promise<PaginatedResponse<Presupuesto>> {
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
    console.log('=== DEBUG PRESUPUESTO SERVICE UPDATE ===');
    console.log('ID:', id);
    console.log('Data received:', JSON.stringify(data, null, 2));
    
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    // Validar datos
    console.log('=== DEBUG VALIDATION ===');
    const validation = this.validateUpdate(data);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('=== DEBUG VALIDATION FAILED ===');
      console.log('Validation errors:', validation.errors);
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    console.log('=== DEBUG VALIDATION PASSED ===');

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

    console.log('=== DEBUG CALLING REPOSITORY UPDATE ===');
    // Actualizar el presupuesto
    await this.presupuestoRepository.update(id, data);

    // Si se proporcionaron items, actualizarlos
    if (data.items && Array.isArray(data.items)) {
      console.log('=== DEBUG UPDATING ITEMS ===');
      console.log('Items to update:', data.items);
      
      // Eliminar items existentes
      await this.presupuestoRepository.deleteItemsByPresupuestoId(id);
      
      // Crear nuevos items
      if (data.items.length > 0) {
        const itemsToCreate = data.items.map(item => ({
          ...item,
          presupuestoId: id,
          precioTotal: item.cantidad * item.precioUnitario
        }));
        
        await this.presupuestoRepository.createItems(itemsToCreate);
      }
    }

    console.log('=== DEBUG RETURNING UPDATED PRESUPUESTO ===');
    // Retornar el presupuesto actualizado con items
    return this.presupuestoRepository.findById(id);
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

  async findByEstado(estado: 'pendiente' | 'aceptado' | 'rechazado' | 'activo' | 'concluido' | 'finalizado'): Promise<Presupuesto[]> {
    if (!['pendiente', 'aceptado', 'rechazado', 'activo', 'concluido', 'finalizado'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    return this.presupuestoRepository.findByEstado(estado);
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'aceptado' | 'rechazado' | 'activo' | 'concluido' | 'finalizado'): Promise<Presupuesto | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    if (!['pendiente', 'aceptado', 'rechazado', 'activo', 'concluido', 'finalizado'].includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Verificar si el presupuesto existe
    const presupuestoExistente = await this.presupuestoRepository.findById(id);
    if (!presupuestoExistente) {
      throw new Error('Presupuesto no encontrado');
    }

    return this.presupuestoRepository.cambiarEstado(id, estado);
  }

  async iniciarActividad(id: number): Promise<Presupuesto | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de presupuesto inválido');
    }

    // Verificar si el presupuesto existe
    const presupuesto = await this.presupuestoRepository.findById(id);
    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado');
    }

    // Verificar que el presupuesto esté aceptado
    if (presupuesto.estado !== 'aceptado') {
      throw new Error('Solo se puede iniciar actividad en presupuestos aceptados');
    }

    // Verificar que tenga orden de compra
    if (!presupuesto.ordenCompra) {
      throw new Error('El presupuesto debe tener una orden de compra para iniciar actividad');
    }

    // Verificar que los equipos estén disponibles
    if (presupuesto.equipos && presupuesto.equipos.length > 0) {
      for (const equipo of presupuesto.equipos) {
        if (equipo.estado !== 'disponible') {
          throw new Error(`El equipo ${equipo.patente} no está disponible (estado: ${equipo.estado})`);
        }
      }
    }

    // Cambiar estado del presupuesto a activo
    const presupuestoActualizado = await this.presupuestoRepository.cambiarEstado(id, 'activo');
    
    if (presupuestoActualizado && presupuesto.equipos) {
      // Cambiar estado de los equipos a ocupado
      for (const equipo of presupuesto.equipos) {
        await this.equipoRepository.update(equipo.id, { estado: 'ocupado' });
      }
    }

    return presupuestoActualizado;
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