import { PrismaClient, Empleado as PrismaEmpleado } from '@prisma/client';
import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../types';

export class EmpleadoRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaEmpleado(prismaEmpleado: PrismaEmpleado & { tipoEmpleado?: any }): Empleado {
    const empleado: Empleado = {
      id: prismaEmpleado.id,
      nombre: prismaEmpleado.nombre,
      apellido: prismaEmpleado.apellido,
      dni: prismaEmpleado.dni,
      tipoEmpleadoId: prismaEmpleado.tipoEmpleadoId,
      sexo: prismaEmpleado.sexo,
      fechaIngreso: prismaEmpleado.fechaIngreso,
      activo: prismaEmpleado.activo,
      creadoEn: prismaEmpleado.creadoEn,
      actualizadoEn: prismaEmpleado.actualizadoEn
    };
    
    if (prismaEmpleado.telefono !== null) {
      empleado.telefono = prismaEmpleado.telefono;
    }
    if (prismaEmpleado.email !== null) {
      empleado.email = prismaEmpleado.email;
    }
    if (prismaEmpleado.direccion !== null) {
      empleado.direccion = prismaEmpleado.direccion;
    }
    if (prismaEmpleado.imagen !== null) {
      empleado.imagen = prismaEmpleado.imagen;
    }
    
    if (prismaEmpleado.tipoEmpleado) {
      empleado.tipoEmpleado = {
        id: prismaEmpleado.tipoEmpleado.id,
        nombre: prismaEmpleado.tipoEmpleado.nombre,
        activo: prismaEmpleado.tipoEmpleado.activo,
        creadoEn: prismaEmpleado.tipoEmpleado.creadoEn
      };
      
      if (prismaEmpleado.tipoEmpleado.descripcion !== null) {
        empleado.tipoEmpleado.descripcion = prismaEmpleado.tipoEmpleado.descripcion;
      }
    }
    
    return empleado;
  }

  async findAll(): Promise<Empleado[]> {
    const empleados = await this.prisma.empleado.findMany({
      where: { activo: true },
      include: {
        tipoEmpleado: true
      },
      orderBy: { apellido: 'asc' }
    });

    return empleados.map(this.convertPrismaEmpleado);
  }

  async findById(id: number): Promise<Empleado | null> {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        tipoEmpleado: true
      }
    });

    return empleado ? this.convertPrismaEmpleado(empleado) : null;
  }

  async findByDni(dni: string): Promise<Empleado | null> {
    const empleado = await this.prisma.empleado.findUnique({
      where: { dni },
      include: {
        tipoEmpleado: true
      }
    });

    return empleado ? this.convertPrismaEmpleado(empleado) : null;
  }

  async findByTipoEmpleado(tipoEmpleadoId: number): Promise<Empleado[]> {
    const empleados = await this.prisma.empleado.findMany({
      where: { 
        tipoEmpleadoId,
        activo: true 
      },
      include: {
        tipoEmpleado: true
      },
      orderBy: { apellido: 'asc' }
    });

    return empleados.map(this.convertPrismaEmpleado);
  }

  async create(data: CreateEmpleadoDto): Promise<Empleado> {
    const empleado = await this.prisma.empleado.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        tipoEmpleadoId: Number(data.tipoEmpleadoId),
        sexo: data.sexo,
        telefono: data.telefono ?? null,
        email: data.email ?? null,
        direccion: data.direccion ?? null,
        fechaIngreso: data.fechaIngreso,
        imagen: data.imagen ?? null,
        activo: data.activo ?? true
      },
      include: {
        tipoEmpleado: true
      }
    });

    return this.convertPrismaEmpleado(empleado);
  }

  async update(id: number, data: UpdateEmpleadoDto): Promise<Empleado | null> {
    const updateData: any = {};
    
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.apellido !== undefined) updateData.apellido = data.apellido;
    if (data.dni !== undefined) updateData.dni = data.dni;
    if (data.tipoEmpleadoId !== undefined) updateData.tipoEmpleadoId = Number(data.tipoEmpleadoId);
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;
    if (data.fechaIngreso !== undefined) updateData.fechaIngreso = data.fechaIngreso;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const empleado = await this.prisma.empleado.update({
      where: { id },
      data: updateData,
      include: {
        tipoEmpleado: true
      }
    });

    return this.convertPrismaEmpleado(empleado);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.empleado.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await this.prisma.empleado.update({
        where: { id },
        data: { activo: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.prisma.empleado.count({
      where: { activo: true }
    });
  }

  async getEmpleadosActivos(): Promise<Empleado[]> {
    const empleados = await this.prisma.empleado.findMany({
      where: { activo: true },
      include: {
        tipoEmpleado: true
      },
      orderBy: { apellido: 'asc' }
    });

    return empleados.map(this.convertPrismaEmpleado);
  }

  async getConductores(): Promise<Empleado[]> {
    // Buscar empleados que sean conductores (tipoEmpleadoId = 1 para "Conductor")
    const empleados = await this.prisma.empleado.findMany({
      where: { 
        tipoEmpleadoId: 1, // ID del tipo "Conductor"
        activo: true 
      },
      include: {
        tipoEmpleado: true
      },
      orderBy: { apellido: 'asc' }
    });

    return empleados.map(this.convertPrismaEmpleado);
  }
} 