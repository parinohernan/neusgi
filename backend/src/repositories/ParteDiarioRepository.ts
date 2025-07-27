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
      archivosAdjuntos: prismaParteDiario.archivosAdjuntos ? (prismaParteDiario.archivosAdjuntos as string[]) : undefined,
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
      if (equipoId) where.ordenCompra.presupuesto.equipoId = equipoId;
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
      orderBy: { fecha: 'desc' },
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

    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }

  async findByRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<ParteDiario[]> {
    const partesDiario = await this.prisma.parteDiario.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
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
      orderBy: { fecha: 'asc' },
    });

    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }

  async create(data: CreateParteDiarioDto): Promise<ParteDiario> {
    const createData: any = {
      ordenCompraId: data.ordenCompraId,
      fecha: data.fecha,
      kmInicial: data.kmInicial,
      kmFinal: data.kmFinal,
      horasTrabajadas: data.horasTrabajadas,
    };

    // Calcular km recorridos si no se proporciona
    if (data.kmRecorridos !== undefined) {
      createData.kmRecorridos = data.kmRecorridos;
    } else {
      createData.kmRecorridos = data.kmFinal - data.kmInicial;
    }

    // Campos opcionales
    if (data.combustibleConsumido !== undefined) {
      createData.combustibleConsumido = data.combustibleConsumido;
    }
    if (data.incidencias !== undefined) {
      createData.incidencias = data.incidencias;
    }
    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }
    if (data.archivosAdjuntos !== undefined) {
      createData.archivosAdjuntos = data.archivosAdjuntos;
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

    return this.convertPrismaParteDiario(parteDiario);
  }

  async update(id: number, data: UpdateParteDiarioDto): Promise<ParteDiario | null> {
    const updateData: any = {};

    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.fecha !== undefined) updateData.fecha = data.fecha;
    if (data.kmInicial !== undefined) updateData.kmInicial = data.kmInicial;
    if (data.kmFinal !== undefined) updateData.kmFinal = data.kmFinal;
    if (data.horasTrabajadas !== undefined) updateData.horasTrabajadas = data.horasTrabajadas;
    if (data.combustibleConsumido !== undefined) updateData.combustibleConsumido = data.combustibleConsumido;
    // Campo estado no existe en ParteDiario
    
    // Manejar campos opcionales
    if (data.incidencias !== undefined) {
      updateData.incidencias = data.incidencias;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones;
    }
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos;
    }

    // Recalcular km recorridos si se actualizan km inicial o final
    if (data.kmInicial !== undefined || data.kmFinal !== undefined) {
      const parteExistente = await this.prisma.parteDiario.findUnique({
        where: { id },
        select: { kmInicial: true, kmFinal: true, kmRecorridos: true },
      });
      
      if (parteExistente) {
        const kmInicial = data.kmInicial ?? parteExistente.kmInicial;
        const kmFinal = data.kmFinal ?? parteExistente.kmFinal;
        updateData.kmRecorridos = kmFinal - kmInicial;
      }
    } else if (data.kmRecorridos !== undefined) {
      updateData.kmRecorridos = data.kmRecorridos;
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
    const where: any = {};
    
    if (filters?.ordenCompraId) where.ordenCompraId = filters.ordenCompraId;
    
    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fecha = {};
      if (filters.fechaDesde) where.fecha.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.fecha.lte = new Date(filters.fechaHasta);
    }

    if (filters?.kmRecorridosMin !== undefined || filters?.kmRecorridosMax !== undefined) {
      where.kmRecorridos = {};
      if (filters.kmRecorridosMin !== undefined) where.kmRecorridos.gte = filters.kmRecorridosMin;
      if (filters.kmRecorridosMax !== undefined) where.kmRecorridos.lte = filters.kmRecorridosMax;
    }

    if (filters?.horasTrabajadasMin !== undefined || filters?.horasTrabajadasMax !== undefined) {
      where.horasTrabajadas = {};
      if (filters.horasTrabajadasMin !== undefined) where.horasTrabajadas.gte = filters.horasTrabajadasMin;
      if (filters.horasTrabajadasMax !== undefined) where.horasTrabajadas.lte = filters.horasTrabajadasMax;
    }

    if (filters?.presupuestoId || filters?.clienteId || filters?.equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (filters.presupuestoId) where.ordenCompra.presupuesto.presupuestoId = filters.presupuestoId;
      if (filters.clienteId) where.ordenCompra.presupuesto.clienteId = filters.clienteId;
      if (filters.equipoId) where.ordenCompra.presupuesto.equipoId = filters.equipoId;
    }

    return this.prisma.parteDiario.count({ where });
  }

  // Métodos específicos para partes diarios
  async getPartesDiarioPorMes(anio: number, mes: number): Promise<ParteDiario[]> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    return this.findByRangoFechas(fechaInicio, fechaFin);
  }

  async getPartesDiarioPorSemana(fecha: Date): Promise<ParteDiario[]> {
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - fecha.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return this.findByRangoFechas(inicioSemana, finSemana);
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalPartes: number;
    totalKmRecorridos: number;
    totalHorasTrabajadas: number;
    totalCombustible: number;
    promedioKmPorDia: number;
    promedioHorasPorDia: number;
  }> {
    const partesDiario = await this.findByOrdenCompra(ordenCompraId);
    
    const totalPartes = partesDiario.length;
    const totalKmRecorridos = partesDiario.reduce((sum, parte) => sum + parte.kmRecorridos, 0);
    const totalHorasTrabajadas = partesDiario.reduce((sum, parte) => sum + parte.horasTrabajadas, 0);
    const totalCombustible = partesDiario.reduce((sum, parte) => sum + (parte.combustibleConsumido || 0), 0);
    
    const promedioKmPorDia = totalPartes > 0 ? totalKmRecorridos / totalPartes : 0;
    const promedioHorasPorDia = totalPartes > 0 ? totalHorasTrabajadas / totalPartes : 0;

    return {
      totalPartes,
      totalKmRecorridos,
      totalHorasTrabajadas,
      totalCombustible,
      promedioKmPorDia,
      promedioHorasPorDia,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalPartes: number;
    totalKmRecorridos: number;
    totalHorasTrabajadas: number;
    totalCombustible: number;
    promedioKmPorParte: number;
    promedioHorasPorParte: number;
  }> {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = fechaInicio;
      if (fechaFin) where.fecha.lte = fechaFin;
    }

    const [totalPartes, totalKmRecorridos, totalHorasTrabajadas, totalCombustible] = await Promise.all([
      this.prisma.parteDiario.count({ where }),
      this.prisma.parteDiario.aggregate({
        where,
        _sum: { kmRecorridos: true },
      }),
      this.prisma.parteDiario.aggregate({
        where,
        _sum: { horasTrabajadas: true },
      }),
      this.prisma.parteDiario.aggregate({
        where,
        _sum: { combustibleConsumido: true },
      }),
    ]);

    const kmTotal = Number(totalKmRecorridos._sum?.kmRecorridos) || 0;
    const horasTotal = Number(totalHorasTrabajadas._sum?.horasTrabajadas) || 0;
    const combustibleTotal = Number(totalCombustible._sum?.combustibleConsumido) || 0;

    return {
      totalPartes,
      totalKmRecorridos: kmTotal,
      totalHorasTrabajadas: horasTotal,
      totalCombustible: combustibleTotal,
      promedioKmPorParte: totalPartes > 0 ? kmTotal / totalPartes : 0,
      promedioHorasPorParte: totalPartes > 0 ? horasTotal / totalPartes : 0,
    };
  }
} 