import { PrismaClient } from '@prisma/client';
import { Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '@/types';

export class EmpresaRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Empresa[]> {
    const empresas = await this.prisma.empresa.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });

    return empresas;
  }

  async findById(id: number): Promise<Empresa | null> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id }
    });

    return empresa;
  }

  async findByNombre(nombre: string): Promise<Empresa | null> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { nombre }
    });

    return empresa;
  }

  async findByCuit(cuit: string): Promise<Empresa | null> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { cuit }
    });

    return empresa;
  }

  async findActiva(): Promise<Empresa | null> {
    const empresa = await this.prisma.empresa.findFirst({
      where: { activa: true }
    });

    return empresa;
  }

  async create(data: CreateEmpresaDto): Promise<Empresa> {
    const empresa = await this.prisma.empresa.create({
      data: {
        ...data,
        activa: data.activa ?? true
      }
    });

    return empresa;
  }

  async update(id: number, data: UpdateEmpresaDto): Promise<Empresa | null> {
    const empresa = await this.prisma.empresa.update({
      where: { id },
      data
    });

    return empresa;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.empresa.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      select: { id: true }
    });

    return !!empresa;
  }

  async count(): Promise<number> {
    return await this.prisma.empresa.count({
      where: { activa: true }
    });
  }
} 