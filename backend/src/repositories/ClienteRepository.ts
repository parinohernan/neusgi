import { PrismaClient } from '@prisma/client';
import { Cliente, CreateClienteDto, UpdateClienteDto, PaginatedResponse, PaginationQuery } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class ClienteRepository implements IBaseRepository<Cliente, CreateClienteDto, UpdateClienteDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: PaginationQuery): Promise<PaginatedResponse<Cliente>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc' } = filters || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
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
      this.prisma.cliente.count(),
    ]);

    return {
      data: data as Cliente[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
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

    return cliente as Cliente | null;
  }

  async findByRutCuit(rutCuit: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { rutCuit },
      include: {
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

    return cliente as Cliente | null;
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { email },
      include: {
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

    return cliente as Cliente | null;
  }

  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    const clientes = await this.prisma.cliente.findMany({
      where: {
        nombreEmpresa: {
          contains: nombre,
        },
      },
      include: {
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

    return clientes as Cliente[];
  }

  async create(data: CreateClienteDto): Promise<Cliente> {
    const createData: any = {
      nombreEmpresa: data.nombreEmpresa,
      rutCuit: data.rutCuit,
    };
    
    if (data.direccion !== undefined) createData.direccion = data.direccion;
    if (data.telefono !== undefined) createData.telefono = data.telefono;
    if (data.email !== undefined) createData.email = data.email;
    if (data.usuarioId !== undefined) createData.usuarioId = data.usuarioId;

    const cliente = await this.prisma.cliente.create({
      data: createData,
      include: {
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

    return cliente as Cliente;
  }

  async update(id: number, data: UpdateClienteDto): Promise<Cliente | null> {
    const updateData: any = {};

    if (data.nombreEmpresa) updateData.nombreEmpresa = data.nombreEmpresa;
    if (data.rutCuit) updateData.rutCuit = data.rutCuit;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.usuarioId !== undefined) updateData.usuarioId = data.usuarioId;

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: {
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

    return cliente as Cliente;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cliente.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.cliente.count({
      where: { id },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.prisma.cliente.count();
  }

  // Métodos específicos para clientes
  async getClientesActivos(): Promise<Cliente[]> {
    const clientes = await this.prisma.cliente.findMany({
      where: {
        presupuestos: {
          some: {
            estado: 'aceptado',
          },
        },
      },
      include: {
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

    return clientes as Cliente[];
  }

  async getEstadisticas(): Promise<{
    total: number;
    conUsuario: number;
    sinUsuario: number;
    activos: number;
  }> {
    const [total, conUsuario, activos] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cliente.count({
        where: {
          usuarioId: {
            not: null,
          },
        },
      }),
      this.prisma.cliente.count({
        where: {
          presupuestos: {
            some: {
              estado: 'aceptado',
            },
          },
        },
      }),
    ]);

    return {
      total,
      conUsuario,
      sinUsuario: total - conUsuario,
      activos,
    };
  }
} 