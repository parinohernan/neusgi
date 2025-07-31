import { PrismaClient, Categoria as PrismaCategoria } from '@prisma/client';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export class CategoriaRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaCategoria(prismaCategoria: PrismaCategoria): Categoria {
    const categoria: Categoria = {
      id: prismaCategoria.id,
      nombre: prismaCategoria.nombre,
      activa: prismaCategoria.activa,
      creadoEn: prismaCategoria.creadoEn
    };
    
    if (prismaCategoria.descripcion !== null) {
      categoria.descripcion = prismaCategoria.descripcion;
    }
    
    return categoria;
  }

  async findAll(): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });

    return categorias.map(this.convertPrismaCategoria);
  }

  async findById(id: number): Promise<Categoria | null> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id }
    });

    return categoria ? this.convertPrismaCategoria(categoria) : null;
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { nombre }
    });

    return categoria ? this.convertPrismaCategoria(categoria) : null;
  }

  async create(data: CreateCategoriaDto): Promise<Categoria> {
    const categoria = await this.prisma.categoria.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        activa: data.activa ?? true
      }
    });

    return this.convertPrismaCategoria(categoria);
  }

  async update(id: number, data: UpdateCategoriaDto): Promise<Categoria | null> {
    const updateData: any = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion ?? null;
    if (data.activa !== undefined) updateData.activa = data.activa;
    
    const categoria = await this.prisma.categoria.update({
      where: { id },
      data: updateData
    });

    return this.convertPrismaCategoria(categoria);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.categoria.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await this.prisma.categoria.update({
        where: { id },
        data: { activa: false }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.prisma.categoria.count({
      where: { activa: true }
    });
  }

  async getCategoriasActivas(): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });

    return categorias.map(this.convertPrismaCategoria);
  }
} 