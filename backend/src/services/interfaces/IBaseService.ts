import { PaginationQuery, PaginatedResponse, ValidationResult } from '@/types';

// Interfaz base para todos los servicios
export interface IBaseService<T, CreateDto, UpdateDto> {
  // Operaciones CRUD básicas
  getAll(filters?: PaginationQuery): Promise<PaginatedResponse<T>>;
  getById(id: number): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: number, data: UpdateDto): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  
  // Validaciones
  validateCreate(data: CreateDto): ValidationResult;
  validateUpdate(data: UpdateDto): ValidationResult;
  
  // Operaciones de negocio
  exists(id: number): Promise<boolean>;
} 