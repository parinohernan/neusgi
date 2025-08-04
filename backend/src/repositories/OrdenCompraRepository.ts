import { PrismaClient } from '@prisma/client';
import { OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto, PaginatedResponse } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class OrdenCompraRepository implements IBaseRepository<OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaOrdenCompra(prismaOrdenCompra: any): OrdenCompra {
    return {
      id: prismaOrdenCompra.id,
      presupuestoId: prismaOrdenCompra.presupuestoId,
      fechaInicio: prismaOrdenCompra.fechaInicio,
      fechaFin: prismaOrdenCompra.fechaFin,
      origen: prismaOrdenCompra.origen,
      destino: prismaOrdenCompra.destino,
      observaciones: prismaOrdenCompra.observaciones,
      documentos: prismaOrdenCompra.documentos ? JSON.parse(prismaOrdenCompra.documentos) : [],
      imagenes: prismaOrdenCompra.imagenes ? JSON.parse(prismaOrdenCompra.imagenes) : [],
      estado: prismaOrdenCompra.estado,
      creadoEn: prismaOrdenCompra.creadoEn,
    };
  }

  async findAll(filters?: any): Promise<PaginatedResponse<OrdenCompra>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.presupuestoId) {
      where.presupuestoId = filters.presupuestoId;
    }

    if (filters?.fechaInicioDesde) {
      where.fechaInicio = {
        ...where.fechaInicio,
        gte: new Date(filters.fechaInicioDesde)
      };
    }

    if (filters?.fechaInicioHasta) {
      where.fechaInicio = {
        ...where.fechaInicio,
        lte: new Date(filters.fechaInicioHasta)
      };
    }

    const [ordenesCompra, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where,
        include: {
          presupuesto: {
            include: {
              cliente: {
                select: {
                  id: true,
                  nombreEmpresa: true,
                  rutCuit: true,
                  email: true,
                },
              },
              contacto: {
                select: {
                  id: true,
                  titulo: true,
                  nombre: true,
                  sector: true,
                  email: true,
                  telefono: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: ordenesCompra.map((ordenCompra: any) => this.convertPrismaOrdenCompra(ordenCompra)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<OrdenCompra | null> {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreEmpresa: true,
                rutCuit: true,
                email: true,
              },
            },
            contacto: {
              select: {
                id: true,
                titulo: true,
                nombre: true,
                sector: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
    });

    return ordenCompra ? this.convertPrismaOrdenCompra(ordenCompra) : null;
  }

  async create(data: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const ordenCompra = await this.prisma.ordenCompra.create({
      data: {
        presupuestoId: data.presupuestoId,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        origen: data.origen,
        destino: data.destino,
        observaciones: data.observaciones || null,
        documentos: data.documentos ? JSON.stringify(data.documentos) : null,
        imagenes: data.imagenes ? JSON.stringify(data.imagenes) : null,
        estado: data.estado || 'activa',
      },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreEmpresa: true,
                rutCuit: true,
                email: true,
              },
            },
            contacto: {
              select: {
                id: true,
                titulo: true,
                nombre: true,
                sector: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
    });

    return this.convertPrismaOrdenCompra(ordenCompra);
  }

  async update(id: number, data: UpdateOrdenCompraDto): Promise<OrdenCompra | null> {
    const updateData: any = {};

    if (data.presupuestoId !== undefined) updateData.presupuestoId = data.presupuestoId;
    if (data.fechaInicio !== undefined) updateData.fechaInicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fechaFin = data.fechaFin;
    if (data.origen !== undefined) updateData.origen = data.origen;
    if (data.destino !== undefined) updateData.destino = data.destino;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.documentos !== undefined) updateData.documentos = data.documentos ? JSON.stringify(data.documentos) : null;
    if (data.imagenes !== undefined) updateData.imagenes = data.imagenes ? JSON.stringify(data.imagenes) : null;
    if (data.estado !== undefined) updateData.estado = data.estado;

    const ordenCompra = await this.prisma.ordenCompra.update({
      where: { id },
      data: updateData,
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreEmpresa: true,
                rutCuit: true,
                email: true,
              },
            },
            contacto: {
              select: {
                id: true,
                titulo: true,
                nombre: true,
                sector: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
    });

    return this.convertPrismaOrdenCompra(ordenCompra);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.ordenCompra.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.ordenCompra.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: any): Promise<number> {
    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.presupuestoId) {
      where.presupuestoId = filters.presupuestoId;
    }

    return this.prisma.ordenCompra.count({ where });
  }

  // Métodos específicos para órdenes de compra
  async findByPresupuesto(presupuestoId: number): Promise<OrdenCompra[]> {
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where: { presupuestoId },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreEmpresa: true,
                rutCuit: true,
                email: true,
              },
            },
            contacto: {
              select: {
                id: true,
                titulo: true,
                nombre: true,
                sector: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return ordenesCompra.map((ordenCompra: any) => this.convertPrismaOrdenCompra(ordenCompra));
  }

  async findByEstado(estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra[]> {
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where: { estado },
      include: {
        presupuesto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombreEmpresa: true,
                rutCuit: true,
                email: true,
              },
            },
            contacto: {
              select: {
                id: true,
                titulo: true,
                nombre: true,
                sector: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return ordenesCompra.map((ordenCompra: any) => this.convertPrismaOrdenCompra(ordenCompra));
  }

  async cambiarEstado(id: number, estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra | null> {
    return this.update(id, { estado });
  }
} 