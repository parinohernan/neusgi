import { PrismaClient } from '@prisma/client';
import { OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto, PaginatedResponse, OrdenCompraFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class OrdenCompraRepository implements IBaseRepository<OrdenCompra, CreateOrdenCompraDto, UpdateOrdenCompraDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: OrdenCompraFilters): Promise<PaginatedResponse<OrdenCompra>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', estado, presupuestoId, clienteId, equipoId, fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (estado) where.estado = estado;
    if (presupuestoId) where.presupuestoId = presupuestoId;
    
    // Filtros de fecha de inicio
    if (fechaInicioDesde || fechaInicioHasta) {
      where.fechaInicio = {};
      if (fechaInicioDesde) where.fechaInicio.gte = new Date(fechaInicioDesde);
      if (fechaInicioHasta) where.fechaInicio.lte = new Date(fechaInicioHasta);
    }
    
    // Filtros de fecha de fin
    if (fechaFinDesde || fechaFinHasta) {
      where.fechaFin = {};
      if (fechaFinDesde) where.fechaFin.gte = new Date(fechaFinDesde);
      if (fechaFinHasta) where.fechaFin.lte = new Date(fechaFinHasta);
    }

    // Filtros por cliente y equipo a través del presupuesto
    if (clienteId || equipoId) {
      where.presupuesto = {};
      if (clienteId) where.presupuesto.clienteId = clienteId;
      if (equipoId) {
        where.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                  rol: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: data as OrdenCompra[],
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenCompra as OrdenCompra | null;
  }

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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenesCompra as OrdenCompra[];
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenesCompra as OrdenCompra[];
  }

  async create(data: CreateOrdenCompraDto): Promise<OrdenCompra> {
    const createData: any = {
      presupuestoId: data.presupuestoId,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      origen: data.origen,
      destino: data.destino,
      estado: data.estado || 'activa',
    };

    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }

    const ordenCompra = await this.prisma.ordenCompra.create({
      data: createData,
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenCompra as OrdenCompra;
  }

  async update(id: number, data: UpdateOrdenCompraDto): Promise<OrdenCompra | null> {
    const updateData: any = {};
    
    if (data.presupuestoId !== undefined) updateData.presupuestoId = data.presupuestoId;
    if (data.fechaInicio !== undefined) updateData.fechaInicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fechaFin = data.fechaFin;
    if (data.origen !== undefined) updateData.origen = data.origen;
    if (data.destino !== undefined) updateData.destino = data.destino;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenCompra as OrdenCompra;
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

  async count(filters?: OrdenCompraFilters): Promise<number> {
    const { estado, presupuestoId, clienteId, equipoId, fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta } = filters || {};

    const where: any = {};
    if (estado) where.estado = estado;
    if (presupuestoId) where.presupuestoId = presupuestoId;
    
    // Filtros de fecha de inicio
    if (fechaInicioDesde || fechaInicioHasta) {
      where.fechaInicio = {};
      if (fechaInicioDesde) where.fechaInicio.gte = new Date(fechaInicioDesde);
      if (fechaInicioHasta) where.fechaInicio.lte = new Date(fechaInicioHasta);
    }
    
    // Filtros de fecha de fin
    if (fechaFinDesde || fechaFinHasta) {
      where.fechaFin = {};
      if (fechaFinDesde) where.fechaFin.gte = new Date(fechaFinDesde);
      if (fechaFinHasta) where.fechaFin.lte = new Date(fechaFinHasta);
    }

    // Filtros por cliente y equipo a través del presupuesto
    if (clienteId || equipoId) {
      where.presupuesto = {};
      if (clienteId) where.presupuesto.clienteId = clienteId;
      if (equipoId) {
        where.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
    }

    return this.prisma.ordenCompra.count({ where });
  }

  async cambiarEstado(id: number, estado: 'activa' | 'completada' | 'cancelada'): Promise<OrdenCompra | null> {
    const ordenCompra = await this.prisma.ordenCompra.update({
      where: { id },
      data: { estado },
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenCompra as OrdenCompra;
  }

  async getOrdenesCompraActivas(): Promise<OrdenCompra[]> {
    return this.findByEstado('activa');
  }

  async getOrdenesCompraCompletadas(): Promise<OrdenCompra[]> {
    return this.findByEstado('completada');
  }

  async getOrdenesCompraCanceladas(): Promise<OrdenCompra[]> {
    return this.findByEstado('cancelada');
  }

  async getEstadisticas(): Promise<{
    total: number;
    activas: number;
    completadas: number;
    canceladas: number;
    enCurso: number;
    vencidas: number;
  }> {
    const fechaActual = new Date();
    
    const [total, activas, completadas, canceladas, enCurso, vencidas] = await Promise.all([
      this.prisma.ordenCompra.count(),
      this.prisma.ordenCompra.count({ where: { estado: 'activa' } }),
      this.prisma.ordenCompra.count({ where: { estado: 'completada' } }),
      this.prisma.ordenCompra.count({ where: { estado: 'cancelada' } }),
      this.prisma.ordenCompra.count({
        where: {
          estado: 'activa',
          fechaInicio: { lte: fechaActual },
          fechaFin: { gte: fechaActual },
        },
      }),
      this.prisma.ordenCompra.count({
        where: {
          estado: 'activa',
          fechaFin: { lt: fechaActual },
        },
      }),
    ]);

    return {
      total,
      activas,
      completadas,
      canceladas,
      enCurso,
      vencidas,
    };
  }

  // Métodos adicionales para compatibilidad con el servicio
  async findByCliente(clienteId: number): Promise<OrdenCompra[]> {
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where: {
        presupuesto: {
          clienteId,
        },
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenesCompra as OrdenCompra[];
  }

    async findByEquipo(_equipoId: number): Promise<OrdenCompra[]> {
    // Por ahora, retornamos un array vacío ya que hay problemas con la relación equipos
    // TODO: Implementar cuando se resuelva el problema de tipos de Prisma
    return [];
  }

  async getOrdenesActivas(): Promise<OrdenCompra[]> {
    return this.findByEstado('activa');
  }

  async getOrdenesCompletadas(): Promise<OrdenCompra[]> {
    return this.findByEstado('completada');
  }

  async getOrdenesCanceladas(): Promise<OrdenCompra[]> {
    return this.findByEstado('cancelada');
  }

  async getOrdenesEnCurso(): Promise<OrdenCompra[]> {
    const fechaActual = new Date();
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where: {
        estado: 'activa',
        fechaInicio: {
          lte: fechaActual,
        },
        fechaFin: {
          gte: fechaActual,
        },
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenesCompra as OrdenCompra[];
  }

  async getOrdenesVencidas(): Promise<OrdenCompra[]> {
    const fechaActual = new Date();
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      where: {
        estado: 'activa',
        fechaFin: {
          lt: fechaActual,
        },
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
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    return ordenesCompra as OrdenCompra[];
  }
} 