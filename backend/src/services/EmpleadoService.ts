import { EmpleadoRepository } from '../repositories/EmpleadoRepository';
import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../types';

export class EmpleadoService {
  private empleadoRepository: EmpleadoRepository;

  constructor(empleadoRepository: EmpleadoRepository) {
    this.empleadoRepository = empleadoRepository;
  }

  async getAllEmpleados(): Promise<Empleado[]> {
    return this.empleadoRepository.findAll();
  }

  async getEmpleadoById(id: number): Promise<Empleado | null> {
    return this.empleadoRepository.findById(id);
  }

  async getEmpleadoByDni(dni: string): Promise<Empleado | null> {
    return this.empleadoRepository.findByDni(dni);
  }

  async getEmpleadosByTipo(tipoEmpleadoId: number): Promise<Empleado[]> {
    return this.empleadoRepository.findByTipoEmpleado(tipoEmpleadoId);
  }

  async createEmpleado(data: CreateEmpleadoDto): Promise<Empleado> {
    // Verificar si ya existe un empleado con el mismo DNI
    const existingEmpleado = await this.empleadoRepository.findByDni(data.dni);
    if (existingEmpleado) {
      throw new Error(`Ya existe un empleado con el DNI "${data.dni}"`);
    }

    return this.empleadoRepository.create(data);
  }

  async updateEmpleado(id: number, data: UpdateEmpleadoDto): Promise<Empleado | null> {
    // Verificar si el empleado existe
    const existingEmpleado = await this.empleadoRepository.findById(id);
    if (!existingEmpleado) {
      throw new Error(`No se encontró el empleado con ID ${id}`);
    }

    // Si se está cambiando el DNI, verificar que no exista otro con el mismo DNI
    if (data.dni && data.dni !== existingEmpleado.dni) {
      const empleadoConMismoDni = await this.empleadoRepository.findByDni(data.dni);
      if (empleadoConMismoDni) {
        throw new Error(`Ya existe un empleado con el DNI "${data.dni}"`);
      }
    }

    return this.empleadoRepository.update(id, data);
  }

  async deleteEmpleado(id: number): Promise<boolean> {
    // Verificar si el empleado existe
    const existingEmpleado = await this.empleadoRepository.findById(id);
    if (!existingEmpleado) {
      throw new Error(`No se encontró el empleado con ID ${id}`);
    }

    // Intentar soft delete primero
    const softDeleted = await this.empleadoRepository.softDelete(id);
    if (!softDeleted) {
      // Si falla el soft delete, intentar delete físico
      return this.empleadoRepository.delete(id);
    }

    return true;
  }

  async getEmpleadosActivos(): Promise<Empleado[]> {
    return this.empleadoRepository.getEmpleadosActivos();
  }

  async getConductores(): Promise<Empleado[]> {
    return this.empleadoRepository.getConductores();
  }

  async getTotalEmpleados(): Promise<number> {
    return this.empleadoRepository.count();
  }
} 