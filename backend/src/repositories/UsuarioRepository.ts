import { PrismaClient } from '@prisma/client';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, PaginationQuery, PaginatedResponse } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';
import bcrypt from 'bcryptjs';

export class UsuarioRepository implements IBaseRepository<Usuario, CreateUsuarioDto, UpdateUsuarioDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: PaginationQuery): Promise<PaginatedResponse<Usuario>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc' } = filters || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          nombre: true,
          email: true,
          passwordHash: true,
          rol: true,
          creadoEn: true,
        },
      }),
      this.prisma.usuario.count(),
    ]);

    return {
      data: data as Usuario[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        passwordHash: true,
        rol: true,
        creadoEn: true,
      },
    });

    return usuario as Usuario | null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        passwordHash: true,
        rol: true,
        creadoEn: true,
      },
    });

    return usuario as Usuario | null;
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash: hashedPassword,
        rol: data.rol,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        passwordHash: true,
        rol: true,
        creadoEn: true,
      },
    });

    return usuario as Usuario;
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario | null> {
    const updateData: any = {};

    if (data.nombre) updateData.nombre = data.nombre;
    if (data.email) updateData.email = data.email;
    if (data.rol) updateData.rol = data.rol;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        passwordHash: true,
        rol: true,
        creadoEn: true,
      },
    });

    return usuario as Usuario;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.usuario.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.usuario.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: Partial<CreateUsuarioDto>): Promise<number> {
    const where: any = {};
    
    if (filters?.email) where.email = filters.email;
    if (filters?.rol) where.rol = filters.rol;

    return this.prisma.usuario.count({ where });
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const usuario = await this.findByEmail(email);
    if (!usuario) return false;

    return bcrypt.compare(password, usuario.passwordHash);
  }
} 