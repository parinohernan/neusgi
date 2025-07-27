import { PrismaClient } from '@prisma/client';
import { Remito, CreateRemitoDto, UpdateRemitoDto, PaginatedResponse, RemitoFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class RemitoRepository implements IBaseRepository<Remito, CreateRemitoDto, UpdateRemitoDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaRemito(prismaRemito: any): Remito {
    return {
      ...prismaRemito,
      archivosAdjuntos: prismaRemito.archivosAdjuntos ? (prismaRemito.archivosAdjuntos as string[]) : undefined,
    };
  }

  async findAll(filters?: RemitoFilters): Promise<PaginatedResponse<Remito>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', ordenCompraId, presupuestoId, clienteId, equipoId, codigo, estado, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (codigo) where.codigo = { contains: codigo, mode: 'insensitive' };
    if (estado) where.estado = estado;
    
    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.creadoEn = {};
      if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
      if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta);
    }

    // Filtros por presupuesto, cliente y equipo a través de la orden de compra
    if (presupuestoId || clienteId || equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (presupuestoId) where.ordenCompra.presupuesto.presupuestoId = presupuestoId;
      if (clienteId) where.ordenCompra.presupuesto.clienteId = clienteId;
      if (equipoId) where.ordenCompra.presupuesto.equipoId = equipoId;
    }

    const [data, total] = await Promise.all([
      this.prisma.remito.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          ordenCompra: {
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
                  equipo: {
                    select: {
                      id: true,
                      patente: true,
                      modelo: true,
                      capacidadKg: true,
                      estado: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.remito.count({ where }),
    ]);

    return {
      data: data.map((remito: any) => this.convertPrismaRemito(remito)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Remito | null> {
    const remito = await this.prisma.remito.findUnique({
      where: { id },
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return remito ? this.convertPrismaRemito(remito) : null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<Remito[]> {
    const remitos = await this.prisma.remito.findMany({
      where: { ordenCompraId },
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return remitos.map((remito: any) => this.convertPrismaRemito(remito));
  }

  async findByCodigo(codigo: string): Promise<Remito | null> {
    const remito = await this.prisma.remito.findUnique({
      where: { codigo },
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return remito ? this.convertPrismaRemito(remito) : null;
  }

  async findByEstado(estado: 'pendiente' | 'entregado' | 'cancelado'): Promise<Remito[]> {
    const remitos = await this.prisma.remito.findMany({
      where: { estado },
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return remitos.map((remito: any) => this.convertPrismaRemito(remito));
  }

  async create(data: CreateRemitoDto): Promise<Remito> {
    const createData: any = {
      ordenCompraId: data.ordenCompraId,
      codigo: data.codigo,
      contenido: data.contenido,
      estado: data.estado || 'pendiente',
    };

    // Campos opcionales
    if (data.pdfPath !== undefined) {
      createData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      createData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }

    const remito = await this.prisma.remito.create({
      data: createData,
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.convertPrismaRemito(remito);
  }

  async update(id: number, data: UpdateRemitoDto): Promise<Remito | null> {
    const updateData: any = {};

    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.codigo !== undefined) updateData.codigo = data.codigo;
    if (data.contenido !== undefined) updateData.contenido = data.contenido;
    if (data.estado !== undefined) updateData.estado = data.estado;
    
    // Manejar campos opcionales
    if (data.pdfPath !== undefined) {
      updateData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones;
    }

    const remito = await this.prisma.remito.update({
      where: { id },
      data: updateData,
      include: {
        ordenCompra: {
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
                equipo: {
                  select: {
                    id: true,
                    patente: true,
                    modelo: true,
                    capacidadKg: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.convertPrismaRemito(remito);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.remito.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.remito.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: RemitoFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.ordenCompraId) where.ordenCompraId = filters.ordenCompraId;
    if (filters?.codigo) where.codigo = { contains: filters.codigo, mode: 'insensitive' };
    if (filters?.estado) where.estado = filters.estado;
    
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.creadoEn = {};
      if (filters.fechaDesde) where.creadoEn.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.creadoEn.lte = new Date(filters.fechaHasta);
    }

    if (filters?.presupuestoId || filters?.clienteId || filters?.equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (filters.presupuestoId) where.ordenCompra.presupuesto.presupuestoId = filters.presupuestoId;
      if (filters.clienteId) where.ordenCompra.presupuesto.clienteId = filters.clienteId;
      if (filters.equipoId) where.ordenCompra.presupuesto.equipoId = filters.equipoId;
    }

    return this.prisma.remito.count({ where });
  }

  // Métodos específicos para remitos
  async getRemitosPendientes(): Promise<Remito[]> {
    return this.findByEstado('pendiente');
  }

  async getRemitosEntregados(): Promise<Remito[]> {
    return this.findByEstado('entregado');
  }

  async getRemitosCancelados(): Promise<Remito[]> {
    return this.findByEstado('cancelado');
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'entregado' | 'cancelado'): Promise<Remito | null> {
    return this.update(id, { estado });
  }

  async marcarComoEntregado(id: number): Promise<Remito | null> {
    return this.cambiarEstado(id, 'entregado');
  }

  async cancelarRemito(id: number): Promise<Remito | null> {
    return this.cambiarEstado(id, 'cancelado');
  }

  async reactivarRemito(id: number): Promise<Remito | null> {
    return this.cambiarEstado(id, 'pendiente');
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalRemitos: number;
    pendientes: number;
    entregados: number;
    cancelados: number;
  }> {
    const remitos = await this.findByOrdenCompra(ordenCompraId);
    
    const totalRemitos = remitos.length;
    const pendientes = remitos.filter(r => r.estado === 'pendiente').length;
    const entregados = remitos.filter(r => r.estado === 'entregado').length;
    const cancelados = remitos.filter(r => r.estado === 'cancelado').length;

    return {
      totalRemitos,
      pendientes,
      entregados,
      cancelados,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalRemitos: number;
    pendientes: number;
    entregados: number;
    cancelados: number;
    promedioRemitosPorOrden: number;
  }> {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.creadoEn = {};
      if (fechaInicio) where.creadoEn.gte = fechaInicio;
      if (fechaFin) where.creadoEn.lte = fechaFin;
    }

    const [totalRemitos, pendientes, entregados, cancelados, totalOrdenes] = await Promise.all([
      this.prisma.remito.count({ where }),
      this.prisma.remito.count({ where: { ...where, estado: 'pendiente' } }),
      this.prisma.remito.count({ where: { ...where, estado: 'entregado' } }),
      this.prisma.remito.count({ where: { ...where, estado: 'cancelado' } }),
      this.prisma.ordenCompra.count(),
    ]);

    return {
      totalRemitos,
      pendientes,
      entregados,
      cancelados,
      promedioRemitosPorOrden: totalOrdenes > 0 ? totalRemitos / totalOrdenes : 0,
    };
  }

  async generarCodigoRemito(): Promise<string> {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Contar remitos del día para generar secuencial
    const inicioDia = new Date(anio, fecha.getMonth(), fecha.getDate());
    const finDia = new Date(anio, fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    
    const remitosDelDia = await this.prisma.remito.count({
      where: {
        creadoEn: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    const secuencial = String(remitosDelDia + 1).padStart(3, '0');
    return `REM-${anio}${mes}${dia}-${secuencial}`;
  }
} 