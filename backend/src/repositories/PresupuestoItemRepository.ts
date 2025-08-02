import { PrismaClient } from '@prisma/client';
import { PresupuestoItem, CreatePresupuestoItemDto, UpdatePresupuestoItemDto, PaginationQuery, PaginatedResponse } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class PresupuestoItemRepository implements IBaseRepository<PresupuestoItem, CreatePresupuestoItemDto, UpdatePresupuestoItemDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(_filters?: PaginationQuery): Promise<PaginatedResponse<PresupuestoItem>> {
    const items = await this.prisma.presupuestoItem.findMany({
      orderBy: { numero: 'asc' },
    });

    const convertedItems = items.map(this.convertPrismaPresupuestoItem);
    
    return {
      data: convertedItems,
      total: convertedItems.length,
      page: 1,
      limit: convertedItems.length,
      totalPages: 1,
    };
  }

  async count(_filters?: Partial<CreatePresupuestoItemDto>): Promise<number> {
    return this.prisma.presupuestoItem.count();
  }

  async findById(id: number): Promise<PresupuestoItem | null> {
    const item = await this.prisma.presupuestoItem.findUnique({
      where: { id },
    });

    return item ? this.convertPrismaPresupuestoItem(item) : null;
  }

  async create(data: CreatePresupuestoItemDto): Promise<PresupuestoItem> {
    const item = await this.prisma.presupuestoItem.create({
      data: {
        presupuestoId: data.presupuestoId,
        numero: data.numero,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        unidad: data.unidad,
        precioUnitario: data.precioUnitario,
        precioTotal: data.precioTotal,
        observaciones: data.observaciones || null,
      },
    });

    return this.convertPrismaPresupuestoItem(item);
  }

  async update(id: number, data: UpdatePresupuestoItemDto): Promise<PresupuestoItem | null> {
    // Filtrar propiedades undefined
    const updateData: any = {};
    if (data.numero !== undefined) updateData.numero = data.numero;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.cantidad !== undefined) updateData.cantidad = data.cantidad;
    if (data.unidad !== undefined) updateData.unidad = data.unidad;
    if (data.precioUnitario !== undefined) updateData.precioUnitario = data.precioUnitario;
    if (data.precioTotal !== undefined) updateData.precioTotal = data.precioTotal;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    const item = await this.prisma.presupuestoItem.update({
      where: { id },
      data: updateData,
    });

    return this.convertPrismaPresupuestoItem(item);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.presupuestoItem.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.presupuestoItem.count({
      where: { id },
    });
    return count > 0;
  }

  async findByPresupuestoId(presupuestoId: number): Promise<PresupuestoItem[]> {
    const items = await this.prisma.presupuestoItem.findMany({
      where: { presupuestoId },
      orderBy: { numero: 'asc' },
    });

    return items.map(this.convertPrismaPresupuestoItem);
  }

  async deleteByPresupuestoId(presupuestoId: number): Promise<boolean> {
    try {
      await this.prisma.presupuestoItem.deleteMany({
        where: { presupuestoId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getNextNumero(presupuestoId: number): Promise<number> {
    const lastItem = await this.prisma.presupuestoItem.findFirst({
      where: { presupuestoId },
      orderBy: { numero: 'desc' },
    });

    return lastItem ? lastItem.numero + 1 : 1;
  }

  private convertPrismaPresupuestoItem(prismaItem: any): PresupuestoItem {
    return {
      id: prismaItem.id,
      presupuestoId: prismaItem.presupuestoId,
      numero: prismaItem.numero,
      descripcion: prismaItem.descripcion,
      cantidad: Number(prismaItem.cantidad),
      unidad: prismaItem.unidad,
      precioUnitario: Number(prismaItem.precioUnitario),
      precioTotal: Number(prismaItem.precioTotal),
      observaciones: prismaItem.observaciones,
    };
  }
} 