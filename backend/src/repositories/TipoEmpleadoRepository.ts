import { PrismaClient, TipoEmpleado as PrismaTipoEmpleado } from '@prisma/client';
import { TipoEmpleado, CreateTipoEmpleadoDto, UpdateTipoEmpleadoDto } from '../types';

export class TipoEmpleadoRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaTipoEmpleado(prismaTipoEmpleado: PrismaTipoEmpleado): TipoEmpleado {
    const tipoEmpleado: TipoEmpleado = {
      id: prismaTipoEmpleado.id,
      nombre: prismaTipoEmpleado.nombre,
      activo: prismaTipoEmpleado.activo,
      creadoEn: prismaTipoEmpleado.creadoEn
    };
    
    if (prismaTipoEmpleado.descripcion !== null) {
      tipoEmpleado.descripcion = prismaTipoEmpleado.descripcion;
    }
    
    return tipoEmpleado;
  }

  async findAll(): Promise<TipoEmpleado[]> {
    const tiposEmpleado = await this.prisma.tipoEmpleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    return tiposEmpleado.map(this.convertPrismaTipoEmpleado);
  }

  async findById(id: number): Promise<TipoEmpleado | null> {
    const tipoEmpleado = await this.prisma.tipoEmpleado.findUnique({
      where: { id }
    });

    return tipoEmpleado ? this.convertPrismaTipoEmpleado(tipoEmpleado) : null;
  }

  async findByNombre(nombre: string): Promise<TipoEmpleado | null> {
    const tipoEmpleado = await this.prisma.tipoEmpleado.findUnique({
      where: { nombre }
    });

    return tipoEmpleado ? this.convertPrismaTipoEmpleado(tipoEmpleado) : null;
  }

  async create(data: CreateTipoEmpleadoDto): Promise<TipoEmpleado> {
    const tipoEmpleado = await this.prisma.tipoEmpleado.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        activo: data.activo ?? true
      }
    });

    return this.convertPrismaTipoEmpleado(tipoEmpleado);
  }

  async update(id: number, data: UpdateTipoEmpleadoDto): Promise<TipoEmpleado | null> {
    const updateData: any = {};
    
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion ?? null;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const tipoEmpleado = await this.prisma.tipoEmpleado.update({
      where: { id },
      data: updateData
    });

    return this.convertPrismaTipoEmpleado(tipoEmpleado);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.tipoEmpleado.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await this.prisma.tipoEmpleado.update({
        where: { id },
        data: { activo: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.prisma.tipoEmpleado.count({
      where: { activo: true }
    });
  }

  async getTiposEmpleadoActivos(): Promise<TipoEmpleado[]> {
    const tiposEmpleado = await this.prisma.tipoEmpleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    return tiposEmpleado.map(this.convertPrismaTipoEmpleado);
  }
} 