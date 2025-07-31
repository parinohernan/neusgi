import { TipoEmpleadoRepository } from '../repositories/TipoEmpleadoRepository';
import { TipoEmpleado, CreateTipoEmpleadoDto, UpdateTipoEmpleadoDto } from '../types';

export class TipoEmpleadoService {
  private tipoEmpleadoRepository: TipoEmpleadoRepository;

  constructor(tipoEmpleadoRepository: TipoEmpleadoRepository) {
    this.tipoEmpleadoRepository = tipoEmpleadoRepository;
  }

  async getAllTiposEmpleado(): Promise<TipoEmpleado[]> {
    return this.tipoEmpleadoRepository.findAll();
  }

  async getTipoEmpleadoById(id: number): Promise<TipoEmpleado | null> {
    return this.tipoEmpleadoRepository.findById(id);
  }

  async getTipoEmpleadoByNombre(nombre: string): Promise<TipoEmpleado | null> {
    return this.tipoEmpleadoRepository.findByNombre(nombre);
  }

  async createTipoEmpleado(data: CreateTipoEmpleadoDto): Promise<TipoEmpleado> {
    // Verificar si ya existe un tipo de empleado con el mismo nombre
    const existingTipoEmpleado = await this.tipoEmpleadoRepository.findByNombre(data.nombre);
    if (existingTipoEmpleado) {
      throw new Error(`Ya existe un tipo de empleado con el nombre "${data.nombre}"`);
    }

    return this.tipoEmpleadoRepository.create(data);
  }

  async updateTipoEmpleado(id: number, data: UpdateTipoEmpleadoDto): Promise<TipoEmpleado | null> {
    // Verificar si el tipo de empleado existe
    const existingTipoEmpleado = await this.tipoEmpleadoRepository.findById(id);
    if (!existingTipoEmpleado) {
      throw new Error(`No se encontró el tipo de empleado con ID ${id}`);
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (data.nombre && data.nombre !== existingTipoEmpleado.nombre) {
      const tipoEmpleadoConMismoNombre = await this.tipoEmpleadoRepository.findByNombre(data.nombre);
      if (tipoEmpleadoConMismoNombre) {
        throw new Error(`Ya existe un tipo de empleado con el nombre "${data.nombre}"`);
      }
    }

    return this.tipoEmpleadoRepository.update(id, data);
  }

  async deleteTipoEmpleado(id: number): Promise<boolean> {
    // Verificar si el tipo de empleado existe
    const existingTipoEmpleado = await this.tipoEmpleadoRepository.findById(id);
    if (!existingTipoEmpleado) {
      throw new Error(`No se encontró el tipo de empleado con ID ${id}`);
    }

    // Intentar soft delete primero
    const softDeleted = await this.tipoEmpleadoRepository.softDelete(id);
    if (!softDeleted) {
      // Si falla el soft delete, intentar delete físico
      return this.tipoEmpleadoRepository.delete(id);
    }

    return true;
  }

  async getTiposEmpleadoActivos(): Promise<TipoEmpleado[]> {
    return this.tipoEmpleadoRepository.getTiposEmpleadoActivos();
  }

  async getTotalTiposEmpleado(): Promise<number> {
    return this.tipoEmpleadoRepository.count();
  }
} 