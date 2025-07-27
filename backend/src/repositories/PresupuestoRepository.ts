import { PrismaClient } from '@prisma/client';
import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto, PaginatedResponse, PresupuestoFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class PresupuestoRepository implements IBaseRepository<Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaPresupuesto(prismaPresupuesto: any): Presupuesto {
    return {
      ...prismaPresupuesto,
      costo: Number(prismaPresupuesto.costo),
    };
  }

  async findAll(filters?: PresupuestoFilters): Promise<PaginatedResponse<Presupuesto>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', estado, clienteId, equipoId, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;
    if (equipoId) where.equipoId = equipoId;
    
    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.validoHasta = {};
      if (fechaDesde) where.validoHasta.gte = new Date(fechaDesde);
      if (fechaHasta) where.validoHasta.lte = new Date(fechaHasta);
    }

    const [data, total] = await Promise.all([
      this.prisma.presupuesto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          cliente: {
            select: {
              id: true,
              nombreEmpresa: true,
              rutCuit: true,
              email: true,
            },
          },
          equipo: {
            select: {
              id: true,
              patente: true,
              modelo: true,
              capacidadKg: true,
              estado: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true,
            },
          },
        },
      }),
      this.prisma.presupuesto.count({ where }),
    ]);

    return {
      data: data.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Presupuesto | null> {
    const presupuesto = await this.prisma.presupuesto.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return presupuesto ? this.convertPrismaPresupuesto(presupuesto) : null;
  }

  async findByCliente(clienteId: number): Promise<Presupuesto[]> {
    const presupuestos = await this.prisma.presupuesto.findMany({
      where: { clienteId },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return presupuestos.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto));
  }

  async findByEquipo(equipoId: number): Promise<Presupuesto[]> {
    const presupuestos = await this.prisma.presupuesto.findMany({
      where: { equipoId },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return presupuestos.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto));
  }

  async findByEstado(estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto[]> {
    const presupuestos = await this.prisma.presupuesto.findMany({
      where: { estado },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return presupuestos.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto));
  }

  async create(data: CreatePresupuestoDto): Promise<Presupuesto> {
    const presupuesto = await this.prisma.presupuesto.create({
      data: {
        clienteId: data.clienteId,
        equipoId: data.equipoId,
        usuarioId: data.usuarioId,
        descripcion: data.descripcion,
        costo: data.costo,
        validoHasta: data.validoHasta,
        estado: data.estado || 'pendiente',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return this.convertPrismaPresupuesto(presupuesto);
  }

  async update(id: number, data: UpdatePresupuestoDto): Promise<Presupuesto | null> {
    const updateData: any = {};

    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.equipoId !== undefined) updateData.equipoId = data.equipoId;
    if (data.usuarioId !== undefined) updateData.usuarioId = data.usuarioId;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.costo !== undefined) updateData.costo = data.costo;
    if (data.validoHasta !== undefined) updateData.validoHasta = data.validoHasta;
    if (data.estado !== undefined) updateData.estado = data.estado;

    const presupuesto = await this.prisma.presupuesto.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return this.convertPrismaPresupuesto(presupuesto);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.presupuesto.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.presupuesto.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: PresupuestoFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.clienteId) where.clienteId = filters.clienteId;
    if (filters?.equipoId) where.equipoId = filters.equipoId;
    
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.validoHasta = {};
      if (filters.fechaDesde) where.validoHasta.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.validoHasta.lte = new Date(filters.fechaHasta);
    }

    return this.prisma.presupuesto.count({ where });
  }

  // Métodos específicos para presupuestos
  async cambiarEstado(id: number, estado: 'pendiente' | 'aceptado' | 'rechazado'): Promise<Presupuesto | null> {
    return this.update(id, { estado });
  }

  async getPresupuestosVencidos(): Promise<Presupuesto[]> {
    const presupuestos = await this.prisma.presupuesto.findMany({
      where: {
        validoHasta: {
          lt: new Date(),
        },
        estado: 'pendiente',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { validoHasta: 'asc' },
    });

    return presupuestos.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto));
  }

  async getPresupuestosPorVencer(dias: number = 7): Promise<Presupuesto[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const presupuestos = await this.prisma.presupuesto.findMany({
      where: {
        validoHasta: {
          gte: new Date(),
          lte: fechaLimite,
        },
        estado: 'pendiente',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombreEmpresa: true,
            rutCuit: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            patente: true,
            modelo: true,
            capacidadKg: true,
            estado: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { validoHasta: 'asc' },
    });

    return presupuestos.map((presupuesto: any) => this.convertPrismaPresupuesto(presupuesto));
  }

  async getEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    aceptados: number;
    rechazados: number;
    vencidos: number;
    valorTotal: number;
  }> {
    const [total, pendientes, aceptados, rechazados, vencidos, valorTotal] = await Promise.all([
      this.prisma.presupuesto.count(),
      this.prisma.presupuesto.count({ where: { estado: 'pendiente' } }),
      this.prisma.presupuesto.count({ where: { estado: 'aceptado' } }),
      this.prisma.presupuesto.count({ where: { estado: 'rechazado' } }),
      this.prisma.presupuesto.count({
        where: {
          validoHasta: { lt: new Date() },
          estado: 'pendiente',
        },
      }),
      this.prisma.presupuesto.aggregate({
        _sum: { costo: true },
      }),
    ]);

    return {
      total,
      pendientes,
      aceptados,
      rechazados,
      vencidos,
      valorTotal: Number(valorTotal._sum.costo) || 0,
    };
  }
} 