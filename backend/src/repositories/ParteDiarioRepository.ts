import { PrismaClient } from '@prisma/client';
import { ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto, PaginatedResponse } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class ParteDiarioRepository implements IBaseRepository<ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaParteDiario(prismaParteDiario: any): ParteDiario {
    return {
      id: prismaParteDiario.id,
      ordenCompraId: prismaParteDiario.ordenCompraId,
      fecha: prismaParteDiario.fecha,
      conductorId: prismaParteDiario.conductorId,
      equipoId: prismaParteDiario.equipoId,
      observaciones: prismaParteDiario.observaciones,
      archivosAdjuntos: prismaParteDiario.archivosAdjuntos ? JSON.parse(prismaParteDiario.archivosAdjuntos) : undefined,
      combustibleConsumido: prismaParteDiario.combustibleConsumido,
      horasTrabajadas: prismaParteDiario.horasTrabajadas,
      kmFinal: prismaParteDiario.kmFinal,
      kmInicial: prismaParteDiario.kmInicial,
      kmRecorridos: prismaParteDiario.kmRecorridos,
      codigo: prismaParteDiario.codigo,
      creadoEn: prismaParteDiario.creadoEn,
      ordenCompra: prismaParteDiario.ordenCompra,
      conductor: prismaParteDiario.conductor,
      equipo: prismaParteDiario.equipo,
    };
  }

  async findAll(filters?: any): Promise<PaginatedResponse<ParteDiario>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.ordenCompraId) {
      where.ordenCompraId = filters.ordenCompraId;
    }
    if (filters?.fechaDesde) {
      where.fecha = {
        ...where.fecha,
        gte: new Date(filters.fechaDesde)
      };
    }
    if (filters?.fechaHasta) {
      where.fecha = {
        ...where.fecha,
        lte: new Date(filters.fechaHasta)
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.parteDiario.findMany({
        where,
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
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { fecha: 'desc' },
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
              },
            },
          },
        },
      },
    });
    return parteDiario ? this.convertPrismaParteDiario(parteDiario) : null;
  }

  async create(data: CreateParteDiarioDto): Promise<ParteDiario> {
    try {
      // Calcular km recorridos automáticamente si se proporcionan km inicial y final
      let kmRecorridos = null;
      if (data.kmInicial !== undefined && data.kmFinal !== undefined) {
        kmRecorridos = data.kmFinal - data.kmInicial;
      }

      const prismaParteDiario = await this.prisma.parteDiario.create({
        data: {
          ordenCompraId: data.ordenCompraId,
          fecha: data.fecha,
          conductorId: data.conductorId || null,
          equipoId: data.equipoId || null,
          observaciones: data.observaciones || null,
          archivosAdjuntos: data.archivosAdjuntos ? JSON.stringify(data.archivosAdjuntos) : null,
          combustibleConsumido: data.combustibleConsumido || null,
          horasTrabajadas: data.horasTrabajadas || null,
          kmFinal: data.kmFinal || null,
          kmInicial: data.kmInicial || null,
          kmRecorridos: kmRecorridos,
          codigo: data.codigo || null,
        },
        include: {
          ordenCompra: true,
          conductor: true,
          equipo: true,
        },
      });

      return this.convertPrismaParteDiario(prismaParteDiario);
    } catch (error) {
      console.error('Error creating parte diario:', error);
      throw new Error('Error al crear el parte diario');
    }
  }

  async update(id: number, data: UpdateParteDiarioDto): Promise<ParteDiario | null> {
    try {
      // Calcular km recorridos automáticamente si se proporcionan km inicial y final
      let kmRecorridos = null;
      if (data.kmInicial !== undefined && data.kmFinal !== undefined) {
        kmRecorridos = data.kmFinal - data.kmInicial;
      }

      const updateData: any = {};
      if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
      if (data.fecha !== undefined) updateData.fecha = data.fecha;
      if (data.conductorId !== undefined) updateData.conductorId = data.conductorId;
      if (data.equipoId !== undefined) updateData.equipoId = data.equipoId;
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
      if (data.archivosAdjuntos !== undefined) updateData.archivosAdjuntos = data.archivosAdjuntos ? JSON.stringify(data.archivosAdjuntos) : null;
      if (data.combustibleConsumido !== undefined) updateData.combustibleConsumido = data.combustibleConsumido;
      if (data.horasTrabajadas !== undefined) updateData.horasTrabajadas = data.horasTrabajadas;
      if (data.kmFinal !== undefined) updateData.kmFinal = data.kmFinal;
      if (data.kmInicial !== undefined) updateData.kmInicial = data.kmInicial;
      if (kmRecorridos !== null) updateData.kmRecorridos = kmRecorridos;
      if (data.codigo !== undefined) updateData.codigo = data.codigo;

      const parteDiario = await this.prisma.parteDiario.update({
        where: { id },
        data: updateData,
        include: {
          ordenCompra: true,
          conductor: true,
          equipo: true,
        },
      });
      return this.convertPrismaParteDiario(parteDiario);
    } catch (error) {
      console.error('Error updating parte diario:', error);
      throw new Error('Error al actualizar el parte diario');
    }
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.parteDiario.delete({ where: { id } });
    return true;
  }

  async count(filters?: any): Promise<number> {
    const where: any = {};
    if (filters?.ordenCompraId) {
      where.ordenCompraId = filters.ordenCompraId;
    }
    return this.prisma.parteDiario.count({ where });
  }

  async exists(id: number): Promise<boolean> {
    return (await this.prisma.parteDiario.findUnique({ where: { id } })) !== null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<ParteDiario[]> {
    const partesDiario = await this.prisma.parteDiario.findMany({
      where: { ordenCompraId },
      include: {
        ordenCompra: true,
        conductor: true,
        equipo: true,
      },
      orderBy: { fecha: 'desc' },
    });
    return partesDiario.map((parteDiario: any) => this.convertPrismaParteDiario(parteDiario));
  }
} 