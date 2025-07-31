import { PrismaClient } from '@prisma/client';
import { ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto, PaginatedResponse, ParteDiarioFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class ParteDiarioRepository implements IBaseRepository<ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaParteDiario(prismaParteDiario: any): ParteDiario {
    return {
      ...prismaParteDiario,
      kmRecorridos: Number(prismaParteDiario.kmRecorridos),
      horasTrabajadas: Number(prismaParteDiario.horasTrabajadas),
      combustibleConsumido: prismaParteDiario.combustibleConsumido ? Number(prismaParteDiario.combustibleConsumido) : undefined,
      archivosAdjuntos: prismaParteDiario.archivosAdjuntos ? JSON.parse(prismaParteDiario.archivosAdjuntos) : undefined,
    };
  }

  async findAll(filters?: ParteDiarioFilters): Promise<PaginatedResponse<ParteDiario>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', ordenCompraId, presupuestoId, clienteId, equipoId, fechaDesde, fechaHasta, kmRecorridosMin, kmRecorridosMax, horasTrabajadasMin, horasTrabajadasMax } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    
    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }

    // Filtros de km recorridos
    if (kmRecorridosMin !== undefined || kmRecorridosMax !== undefined) {
      where.kmRecorridos = {};
      if (kmRecorridosMin !== undefined) where.kmRecorridos.gte = kmRecorridosMin;
      if (kmRecorridosMax !== undefined) where.kmRecorridos.lte = kmRecorridosMax;
    }

    // Filtros de horas trabajadas
    if (horasTrabajadasMin !== undefined || horasTrabajadasMax !== undefined) {
      where.horasTrabajadas = {};
      if (horasTrabajadasMin !== undefined) where.horasTrabajadas.gte = horasTrabajadasMin;
      if (horasTrabajadasMax !== undefined) where.horasTrabajadas.lte = horasTrabajadasMax;
    }

    // Filtros por presupuesto, cliente y equipo a través de la orden de compra
    if (presupuestoId || clienteId || equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (presupuestoId) where.ordenCompra.presupuesto.presupuestoId = presupuestoId;
      if (clienteId) where.ordenCompra.presupuesto.clienteId = clienteId;
      if (equipoId) {
        where.ordenCompra.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.parteDiario.findMany({
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
          },
        },
      }),
      this.prisma.parteDiario.count({ where }),
    ]);

    return {
      data: data.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<ParteDiario | null> {
    const parteDiario = await this.prisma.parteDiario.findUnique({
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
        },
      },
    });

    return parteDiario ? this.convertPrismaParteDiario(parteDiario) : null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<ParteDiario[]> {
    const partesDiario = await this.prisma.parteDiario.findMany({
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
        },
      },
    });

    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }

  async findByFecha(fecha: Date): Promise<ParteDiario[]> {
    const partesDiario = await this.prisma.parteDiario.findMany({
      where: { fecha },
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
        },
      },
    });

    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }

  async create(data: CreateParteDiarioDto): Promise<ParteDiario> {
    const createData: any = {
      ordenCompraId: data.ordenCompraId,
      fecha: data.fecha,
      kmInicial: data.kmInicial,
      kmFinal: data.kmFinal,
      kmRecorridos: data.kmRecorridos || (data.kmFinal - data.kmInicial),
      horasTrabajadas: data.horasTrabajadas,
      incidencias: data.incidencias,
      observaciones: data.observaciones,
    };

    if (data.combustibleConsumido !== undefined) {
      createData.combustibleConsumido = data.combustibleConsumido;
    }

    if (data.archivosAdjuntos && data.archivosAdjuntos.length > 0) {
      createData.archivosAdjuntos = JSON.stringify(data.archivosAdjuntos);
    }

    const parteDiario = await this.prisma.parteDiario.create({
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
        },
      },
    });

    return this.convertPrismaParteDiario(parteDiario);
  }

  async update(id: number, data: UpdateParteDiarioDto): Promise<ParteDiario | null> {
    const updateData: any = {};

    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.fecha !== undefined) updateData.fecha = data.fecha;
    if (data.kmInicial !== undefined) updateData.kmInicial = data.kmInicial;
    if (data.kmFinal !== undefined) updateData.kmFinal = data.kmFinal;
    if (data.kmRecorridos !== undefined) updateData.kmRecorridos = data.kmRecorridos;
    if (data.horasTrabajadas !== undefined) updateData.horasTrabajadas = data.horasTrabajadas;
    if (data.combustibleConsumido !== undefined) updateData.combustibleConsumido = data.combustibleConsumido;
    if (data.incidencias !== undefined) updateData.incidencias = data.incidencias;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos ? JSON.stringify(data.archivosAdjuntos) : null;
    }

    const parteDiario = await this.prisma.parteDiario.update({
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
        },
      },
    });

    return this.convertPrismaParteDiario(parteDiario);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.parteDiario.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.parteDiario.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: ParteDiarioFilters): Promise<number> {
    const { ordenCompraId, presupuestoId, clienteId, equipoId, fechaDesde, fechaHasta, kmRecorridosMin, kmRecorridosMax, horasTrabajadasMin, horasTrabajadasMax } = filters || {};

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    
    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }

    // Filtros de km recorridos
    if (kmRecorridosMin !== undefined || kmRecorridosMax !== undefined) {
      where.kmRecorridos = {};
      if (kmRecorridosMin !== undefined) where.kmRecorridos.gte = kmRecorridosMin;
      if (kmRecorridosMax !== undefined) where.kmRecorridos.lte = kmRecorridosMax;
    }

    // Filtros de horas trabajadas
    if (horasTrabajadasMin !== undefined || horasTrabajadasMax !== undefined) {
      where.horasTrabajadas = {};
      if (horasTrabajadasMin !== undefined) where.horasTrabajadas.gte = horasTrabajadasMin;
      if (horasTrabajadasMax !== undefined) where.horasTrabajadas.lte = horasTrabajadasMax;
    }

    // Filtros por presupuesto, cliente y equipo a través de la orden de compra
    if (presupuestoId || clienteId || equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (presupuestoId) where.ordenCompra.presupuesto.presupuestoId = presupuestoId;
      if (clienteId) where.ordenCompra.presupuesto.clienteId = clienteId;
      if (equipoId) {
        where.ordenCompra.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
    }

    return this.prisma.parteDiario.count({ where });
  }

  async getPartesDiarioPorFecha(fechaDesde: Date, fechaHasta: Date): Promise<ParteDiario[]> {
    const partesDiario = await this.prisma.parteDiario.findMany({
      where: {
        fecha: {
          gte: fechaDesde,
          lte: fechaHasta,
        },
      },
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
        },
      },
    });

    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }

  async getEstadisticas(): Promise<{
    total: number;
    totalKmRecorridos: number;
    totalHorasTrabajadas: number;
    totalCombustibleConsumido: number;
    promedioKmPorDia: number;
    promedioHorasPorDia: number;
  }> {
    const [total, totalKmRecorridos, totalHorasTrabajadas, totalCombustibleConsumido] = await Promise.all([
      this.prisma.parteDiario.count(),
      this.prisma.parteDiario.aggregate({
        _sum: {
          kmRecorridos: true,
        },
      }),
      this.prisma.parteDiario.aggregate({
        _sum: {
          horasTrabajadas: true,
        },
      }),
      this.prisma.parteDiario.aggregate({
        _sum: {
          combustibleConsumido: true,
        },
      }),
    ]);

    const kmSum = totalKmRecorridos._sum.kmRecorridos || 0;
    const horasSum = totalHorasTrabajadas._sum.horasTrabajadas || 0;
    const combustibleSum = totalCombustibleConsumido._sum.combustibleConsumido || 0;

    return {
      total,
      totalKmRecorridos: Number(kmSum),
      totalHorasTrabajadas: Number(horasSum),
      totalCombustibleConsumido: Number(combustibleSum),
      promedioKmPorDia: total > 0 ? Number(kmSum) / total : 0,
      promedioHorasPorDia: total > 0 ? Number(horasSum) / total : 0,
    };
  }
} 