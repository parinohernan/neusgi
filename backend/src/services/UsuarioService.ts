import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, PaginationQuery, PaginatedResponse, ValidationResult, ValidationError } from '@/types';
import { IBaseService } from './interfaces/IBaseService';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import Joi from 'joi';

export class UsuarioService implements IBaseService<Usuario, CreateUsuarioDto, UpdateUsuarioDto> {
  private usuarioRepository: UsuarioRepository;

  constructor(usuarioRepository: UsuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async getAll(filters?: PaginationQuery): Promise<PaginatedResponse<Usuario>> {
    return this.usuarioRepository.findAll(filters);
  }

  async getById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findById(id);
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    // Validar datos antes de crear
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar si el email ya existe
    const existingUser = await this.usuarioRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    return this.usuarioRepository.create(data);
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario | null> {
    // Validar datos antes de actualizar
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Verificar si el usuario existe
    const existingUser = await this.usuarioRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await this.usuarioRepository.findByEmail(data.email);
      if (userWithEmail) {
        throw new Error('El email ya está registrado por otro usuario');
      }
    }

    return this.usuarioRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si el usuario existe
    const existingUser = await this.usuarioRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    return this.usuarioRepository.delete(id);
  }

  validateCreate(data: CreateUsuarioDto): ValidationResult {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre es requerido',
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida',
      }),
      rol: Joi.string().valid('admin', 'logistica', 'cliente_externo').required().messages({
        'any.only': 'El rol debe ser admin, logistica o cliente_externo',
        'any.required': 'El rol es requerido',
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

  validateUpdate(data: UpdateUsuarioDto): ValidationResult {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
      }),
      email: Joi.string().email().optional().messages({
        'string.email': 'El email debe tener un formato válido',
      }),
      password: Joi.string().min(6).optional().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
      }),
      rol: Joi.string().valid('admin', 'logistica', 'cliente_externo').optional().messages({
        'any.only': 'El rol debe ser admin, logistica o cliente_externo',
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
    return this.usuarioRepository.exists(id);
  }

  // Métodos específicos del servicio de usuarios
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findByEmail(email);
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    return this.usuarioRepository.validatePassword(email, password);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const isValidCurrentPassword = await this.usuarioRepository.validatePassword(usuario.email, currentPassword);
    if (!isValidCurrentPassword) {
      throw new Error('La contraseña actual es incorrecta');
    }

    await this.usuarioRepository.update(id, { password: newPassword });
    return true;
  }
} 