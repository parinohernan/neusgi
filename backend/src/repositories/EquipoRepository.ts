import { PrismaClient } from '@prisma/client';
import { Equipo, CreateEquipoDto, UpdateEquipoDto, PaginatedResponse, EquipoFilters, EquipoImagen } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class EquipoRepository implements IBaseRepository<Equipo, CreateEquipoDto, UpdateEquipoDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaEquipo(prismaEquipo: any): Equipo {
    let imagenes: EquipoImagen[] = [];
    
    if (prismaEquipo.imagenes) {
      try {
        imagenes = JSON.parse(prismaEquipo.imagenes);
      } catch (error) {
        console.warn('Error parsing imagenes JSON:', error);
        imagenes = [];
      }
    }

    return {
      ...prismaEquipo,
      capacidadKg: Number(prismaEquipo.capacidadKg),
      imagenes,
      categoria: prismaEquipo.categoria,
      conductor: prismaEquipo.conductor,
    };
  }

  async findAll(filters?: EquipoFilters): Promise<PaginatedResponse<Equipo>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', estado, modelo } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (estado) where.estado = estado;
    if (modelo) where.modelo = { contains: modelo, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.equipo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          categoria: true,
          conductor: {
            include: {
              tipoEmpleado: true
            }
          }
        },
      }),
      this.prisma.equipo.count({ where }),
    ]);

    return {
      data: data.map((equipo: any) => this.convertPrismaEquipo(equipo)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Equipo | null> {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: {
        categoria: true,
        conductor: {
          include: {
            tipoEmpleado: true
          }
        }
      },
    });

    return equipo ? this.convertPrismaEquipo(equipo) : null;
  }

  async findByPatente(patente: string): Promise<Equipo | null> {
    const equipo = await this.prisma.equipo.findUnique({
      where: { patente },
      include: {
        categoria: true,
        conductor: {
          include: {
            tipoEmpleado: true
          }
        }
      },
    });

    return equipo ? this.convertPrismaEquipo(equipo) : null;
  }

  async findDisponibles(): Promise<Equipo[]> {
    const equipos = await this.prisma.equipo.findMany({
      where: { estado: 'disponible' },
      include: {
        categoria: true,
        conductor: {
          include: {
            tipoEmpleado: true
          }
        }
      },
    });

    return equipos.map((equipo: any) => this.convertPrismaEquipo(equipo));
  }

  async create(data: CreateEquipoDto): Promise<Equipo> {
    const createData: any = {
      patente: data.patente,
      modelo: data.modelo,
      categoriaId: data.categoriaId,
      capacidadKg: data.capacidadKg,
      estado: data.estado || 'disponible',
    };
    
    if (data.fechaUltimoMantenimiento) {
      createData.fechaUltimoMantenimiento = data.fechaUltimoMantenimiento;
    }

    if (data.conductorId) {
      createData.conductorId = data.conductorId;
    }

    if (data.imagenes && data.imagenes.length > 0) {
      createData.imagenes = JSON.stringify(data.imagenes);
    }

    const equipo = await this.prisma.equipo.create({
      data: createData,
      include: {
        categoria: true,
        conductor: {
          include: {
            tipoEmpleado: true
          }
        }
      },
    });

    return this.convertPrismaEquipo(equipo);
  }

  async update(id: number, data: UpdateEquipoDto): Promise<Equipo | null> {
    const updateData: any = {};

    if (data.patente) updateData.patente = data.patente;
    if (data.modelo) updateData.modelo = data.modelo;
    if (data.categoriaId) updateData.categoriaId = data.categoriaId;
    if (data.capacidadKg) updateData.capacidadKg = data.capacidadKg;
    if (data.estado) updateData.estado = data.estado;
    if (data.fechaUltimoMantenimiento) updateData.fechaUltimoMantenimiento = data.fechaUltimoMantenimiento;
    if (data.conductorId !== undefined) updateData.conductorId = data.conductorId;
    if (data.imagenes) updateData.imagenes = JSON.stringify(data.imagenes);

    const equipo = await this.prisma.equipo.update({
      where: { id },
      data: updateData,
      include: {
        categoria: true,
        conductor: {
          include: {
            tipoEmpleado: true
          }
        }
      },
    });

    return this.convertPrismaEquipo(equipo);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.equipo.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.equipo.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: Partial<CreateEquipoDto>): Promise<number> {
    const where: any = {};
    
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.modelo) where.modelo = filters.modelo;

    return this.prisma.equipo.count({ where });
  }

  // Métodos específicos para equipos
  async cambiarEstado(id: number, estado: 'disponible' | 'mantenimiento' | 'ocupado'): Promise<Equipo | null> {
    return this.update(id, { estado });
  }

  async registrarMantenimiento(id: number, fechaMantenimiento: Date): Promise<Equipo | null> {
    return this.update(id, { 
      estado: 'mantenimiento',
      fechaUltimoMantenimiento: fechaMantenimiento 
    });
  }

  async verificarDisponibilidad(id: number, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    // Verificar si el equipo está disponible en el rango de fechas
    const presupuestos = await this.prisma.presupuesto.findMany({
      where: {
        equipos: {
          some: {
            equipoId: id
          }
        },
        estado: 'aceptado',
        OR: [
          {
            validoHasta: {
              gte: fechaInicio,
              lte: fechaFin,
            },
          },
          {
            validoHasta: {
              gte: fechaInicio,
            },
          },
        ],
      },
    });

    return presupuestos.length === 0;
  }
} 