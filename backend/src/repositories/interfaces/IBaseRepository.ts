import { PaginationQuery, PaginatedResponse } from '@/types';

// Interfaz base para todos los repositorios
export interface IBaseRepository<T, CreateDto, UpdateDto> {
  // Operaciones CRUD básicas
  findAll(filters?: PaginationQuery): Promise<PaginatedResponse<T>>;
  findById(id: number): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: number, data: UpdateDto): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  
  // Operaciones adicionales
  exists(id: number): Promise<boolean>;
  count(filters?: Partial<CreateDto>): Promise<number>;
} 