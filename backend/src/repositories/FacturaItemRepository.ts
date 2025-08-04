import { PrismaClient } from '@prisma/client';
import { IBaseRepository } from './interfaces/IBaseRepository';
import { FacturaItem, CreateFacturaItemDto, UpdateFacturaItemDto, PaginatedResponse } from '@/types';

export class FacturaItemRepository implements IBaseRepository<FacturaItem, CreateFacturaItemDto, UpdateFacturaItemDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private convertPrismaFacturaItem(prismaFacturaItem: any): FacturaItem {
    return {
      id: prismaFacturaItem.id,
      facturaId: prismaFacturaItem.facturaId,
      numero: prismaFacturaItem.numero,
      descripcion: prismaFacturaItem.descripcion,
      cantidad: Number(prismaFacturaItem.cantidad),
      unidad: prismaFacturaItem.unidad,
      precioUnitario: Number(prismaFacturaItem.precioUnitario),
      precioTotal: Number(prismaFacturaItem.precioTotal),
      observaciones: prismaFacturaItem.observaciones,
      creadoEn: prismaFacturaItem.creadoEn,
    };
  }

  async findAll(filters?: any): Promise<PaginatedResponse<FacturaItem>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.facturaId) {
      where.facturaId = filters.facturaId;
    }

    const [data, total] = await Promise.all([
      this.prisma.facturaItem.findMany({
        where,
        orderBy: { numero: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.facturaItem.count({ where }),
    ]);

    return {
      data: data.map((facturaItem: any) => this.convertPrismaFacturaItem(facturaItem)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<FacturaItem | null> {
    const facturaItem = await this.prisma.facturaItem.findUnique({
      where: { id },
    });

    return facturaItem ? this.convertPrismaFacturaItem(facturaItem) : null;
  }

  async create(data: CreateFacturaItemDto): Promise<FacturaItem> {
    const facturaItem = await this.prisma.facturaItem.create({
      data: {
        facturaId: data.facturaId,
        numero: data.numero,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        unidad: data.unidad,
        precioUnitario: data.precioUnitario,
        precioTotal: data.precioTotal,
        observaciones: data.observaciones || null,
      },
    });

    return this.convertPrismaFacturaItem(facturaItem);
  }

  async update(id: number, data: UpdateFacturaItemDto): Promise<FacturaItem | null> {
    const updateData: any = {};

    if (data.numero !== undefined) updateData.numero = data.numero;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.cantidad !== undefined) updateData.cantidad = data.cantidad;
    if (data.unidad !== undefined) updateData.unidad = data.unidad;
    if (data.precioUnitario !== undefined) updateData.precioUnitario = data.precioUnitario;
    if (data.precioTotal !== undefined) updateData.precioTotal = data.precioTotal;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

    const facturaItem = await this.prisma.facturaItem.update({
      where: { id },
      data: updateData,
    });

    return this.convertPrismaFacturaItem(facturaItem);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.facturaItem.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.facturaItem.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: any): Promise<number> {
    const where: any = {};
    if (filters?.facturaId) {
      where.facturaId = filters.facturaId;
    }

    return this.prisma.facturaItem.count({ where });
  }

  async findByFactura(facturaId: number): Promise<FacturaItem[]> {
    const facturaItems = await this.prisma.facturaItem.findMany({
      where: { facturaId },
      orderBy: { numero: 'asc' },
    });

    return facturaItems.map((facturaItem: any) => this.convertPrismaFacturaItem(facturaItem));
  }

  async createMany(items: CreateFacturaItemDto[]): Promise<FacturaItem[]> {
    if (items.length === 0) {
      return [];
    }

    await this.prisma.facturaItem.createMany({
      data: items.map(item => ({
        facturaId: item.facturaId,
        numero: item.numero,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidad: item.unidad,
        precioUnitario: item.precioUnitario,
        precioTotal: item.precioTotal,
        observaciones: item.observaciones || null,
      })),
    });

    // Retornar los items creados
    return this.findByFactura(items[0]!.facturaId);
  }
} 