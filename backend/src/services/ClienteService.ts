import Joi from 'joi';
import { ClienteRepository } from '@/repositories/ClienteRepository';
import { Cliente, CreateClienteDto, UpdateClienteDto, PaginationQuery, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class ClienteService implements IBaseService<Cliente, CreateClienteDto, UpdateClienteDto> {
  private clienteRepository: ClienteRepository;

  constructor(clienteRepository: ClienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    nombreEmpresa: Joi.string().min(2).max(100).required().messages({
      'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
      'string.max': 'El nombre de la empresa no puede exceder 100 caracteres',
      'any.required': 'El nombre de la empresa es requerido',
    }),
    rutCuit: Joi.string().min(8).max(20).required().messages({
      'string.min': 'El RUT/CUIT debe tener al menos 8 caracteres',
      'string.max': 'El RUT/CUIT no puede exceder 20 caracteres',
      'any.required': 'El RUT/CUIT es requerido',
    }),
    direccion: Joi.string().max(200).optional().allow('').messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
    }),
    telefono: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres',
    }),
    email: Joi.string().email().optional().allow('').messages({
      'string.email': 'El email debe tener un formato válido',
    }),
    usuarioId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de usuario debe ser un número',
      'number.integer': 'El ID de usuario debe ser un número entero',
      'number.positive': 'El ID de usuario debe ser positivo',
    }),
  });

  private updateSchema = Joi.object({
    nombreEmpresa: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'El nombre de la empresa debe tener al menos 2 caracteres',
      'string.max': 'El nombre de la empresa no puede exceder 100 caracteres',
    }),
    rutCuit: Joi.string().min(8).max(20).optional().messages({
      'string.min': 'El RUT/CUIT debe tener al menos 8 caracteres',
      'string.max': 'El RUT/CUIT no puede exceder 20 caracteres',
    }),
    direccion: Joi.string().max(200).optional().allow('').messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
    }),
    telefono: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres',
    }),
    email: Joi.string().email().optional().allow('').messages({
      'string.email': 'El email debe tener un formato válido',
    }),
    usuarioId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de usuario debe ser un número',
      'number.integer': 'El ID de usuario debe ser un número entero',
      'number.positive': 'El ID de usuario debe ser positivo',
    }),
  });

  async getAll(filters?: PaginationQuery): Promise<PaginatedResponse<Cliente>> {
    return this.clienteRepository.findAll(filters);
  }

  async getById(id: number): Promise<Cliente | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de cliente inválido');
    }
    return this.clienteRepository.findById(id);
  }

  async create(data: CreateClienteDto): Promise<Cliente> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si ya existe un cliente con el mismo RUT/CUIT
    const clienteExistente = await this.clienteRepository.findByRutCuit(data.rutCuit);
    if (clienteExistente) {
      throw new Error('Ya existe un cliente con ese RUT/CUIT');
    }

    // Verificar si ya existe un cliente con el mismo email (si se proporciona)
    if (data.email) {
      const clienteConEmail = await this.clienteRepository.findByEmail(data.email);
      if (clienteConEmail) {
        throw new Error('Ya existe un cliente con ese email');
      }
    }

    return this.clienteRepository.create(data);
  }

  async update(id: number, data: UpdateClienteDto): Promise<Cliente | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de cliente inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si el cliente existe
    const clienteExistente = await this.clienteRepository.findById(id);
    if (!clienteExistente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar si el nuevo RUT/CUIT ya existe en otro cliente
    if (data.rutCuit && data.rutCuit !== clienteExistente.rutCuit) {
      const clienteConRut = await this.clienteRepository.findByRutCuit(data.rutCuit);
      if (clienteConRut) {
        throw new Error('Ya existe un cliente con ese RUT/CUIT');
      }
    }

    // Verificar si el nuevo email ya existe en otro cliente
    if (data.email && data.email !== clienteExistente.email) {
      const clienteConEmail = await this.clienteRepository.findByEmail(data.email);
      if (clienteConEmail) {
        throw new Error('Ya existe un cliente con ese email');
      }
    }

    return this.clienteRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de cliente inválido');
    }

    // Verificar si el cliente existe
    const clienteExistente = await this.clienteRepository.findById(id);
    if (!clienteExistente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar si el cliente tiene presupuestos asociados
    // TODO: Implementar verificación de presupuestos cuando se implemente el módulo

    return this.clienteRepository.delete(id);
  }

  validateCreate(data: CreateClienteDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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

  validateUpdate(data: UpdateClienteDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
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
    return this.clienteRepository.exists(id);
  }

  // Métodos específicos para clientes
  async findByRutCuit(rutCuit: string): Promise<Cliente | null> {
    if (!rutCuit || rutCuit.trim().length === 0) {
      throw new Error('RUT/CUIT es requerido');
    }
    return this.clienteRepository.findByRutCuit(rutCuit);
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    if (!email || email.trim().length === 0) {
      throw new Error('Email es requerido');
    }
    return this.clienteRepository.findByEmail(email);
  }

  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('Nombre es requerido');
    }
    return this.clienteRepository.buscarPorNombre(nombre);
  }

  async getClientesActivos(): Promise<Cliente[]> {
    return this.clienteRepository.getClientesActivos();
  }

  async getEstadisticas(): Promise<{
    total: number;
    conUsuario: number;
    sinUsuario: number;
    activos: number;
  }> {
    return this.clienteRepository.getEstadisticas();
  }
} 