import { PrismaClient } from '@prisma/client';
import { Certificado, CreateCertificadoDto, UpdateCertificadoDto, PaginatedResponse, CertificadoFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class CertificadoRepository implements IBaseRepository<Certificado, CreateCertificadoDto, UpdateCertificadoDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaCertificado(prismaCertificado: any): Certificado {
    return {
      ...prismaCertificado,
      archivosAdjuntos: prismaCertificado.archivosAdjuntos ? (prismaCertificado.archivosAdjuntos as string[]) : undefined,
    };
  }

  async findAll(filters?: CertificadoFilters): Promise<PaginatedResponse<Certificado>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', ordenCompraId, presupuestoId, clienteId, equipoId, tipo, codigo, estado, fechaVencimientoDesde, fechaVencimientoHasta, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (tipo) where.tipo = tipo;
    if (codigo) where.codigo = { contains: codigo, mode: 'insensitive' };
    if (estado) where.estado = estado;
    
    // Filtros de fecha de vencimiento
    if (fechaVencimientoDesde || fechaVencimientoHasta) {
      where.fechaVencimiento = {};
      if (fechaVencimientoDesde) where.fechaVencimiento.gte = new Date(fechaVencimientoDesde);
      if (fechaVencimientoHasta) where.fechaVencimiento.lte = new Date(fechaVencimientoHasta);
    }

    // Filtros de fecha de creación
    if (fechaDesde || fechaHasta) {
      where.creadoEn = {};
      if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
      if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta);
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
      this.prisma.certificado.findMany({
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
      this.prisma.certificado.count({ where }),
    ]);

    return {
      data: data.map((certificado: any) => this.convertPrismaCertificado(certificado)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Certificado | null> {
    const certificado = await this.prisma.certificado.findUnique({
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

    return certificado ? this.convertPrismaCertificado(certificado) : null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<Certificado[]> {
    const certificados = await this.prisma.certificado.findMany({
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
      orderBy: { creadoEn: 'desc' },
    });

    return certificados.map((certificado: any) => this.convertPrismaCertificado(certificado));
  }

  async findByTipo(tipo: 'seguro' | 'habilitacion' | 'otros'): Promise<Certificado[]> {
    const certificados = await this.prisma.certificado.findMany({
      where: { tipo },
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

    return certificados.map((certificado: any) => this.convertPrismaCertificado(certificado));
  }

  async findByCodigo(codigo: string): Promise<Certificado | null> {
    const certificado = await this.prisma.certificado.findUnique({
      where: { codigo },
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

    return certificado ? this.convertPrismaCertificado(certificado) : null;
  }

  async findByEstado(estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado[]> {
    const certificados = await this.prisma.certificado.findMany({
      where: { estado },
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

    return certificados.map((certificado: any) => this.convertPrismaCertificado(certificado));
  }

  async create(data: CreateCertificadoDto): Promise<Certificado> {
    const createData: any = {
      ordenCompraId: data.ordenCompraId,
      tipo: data.tipo,
      codigo: data.codigo,
      descripcion: data.descripcion,
      fechaVencimiento: data.fechaVencimiento,
      estado: data.estado || 'activo',
    };

    // Campos opcionales
    if (data.pdfPath !== undefined) {
      createData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      createData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }

    const certificado = await this.prisma.certificado.create({
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

    return this.convertPrismaCertificado(certificado);
  }

  async update(id: number, data: UpdateCertificadoDto): Promise<Certificado | null> {
    const updateData: any = {};

    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.codigo !== undefined) updateData.codigo = data.codigo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.fechaVencimiento !== undefined) updateData.fechaVencimiento = data.fechaVencimiento;
    if (data.estado !== undefined) updateData.estado = data.estado;
    
    // Manejar campos opcionales
    if (data.pdfPath !== undefined) {
      updateData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones;
    }

    const certificado = await this.prisma.certificado.update({
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

    return this.convertPrismaCertificado(certificado);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.certificado.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.certificado.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: CertificadoFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.ordenCompraId) where.ordenCompraId = filters.ordenCompraId;
    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.codigo) where.codigo = { contains: filters.codigo, mode: 'insensitive' };
    if (filters?.estado) where.estado = filters.estado;
    
    if (filters?.fechaVencimientoDesde || filters?.fechaVencimientoHasta) {
      where.fechaVencimiento = {};
      if (filters.fechaVencimientoDesde) where.fechaVencimiento.gte = new Date(filters.fechaVencimientoDesde);
      if (filters.fechaVencimientoHasta) where.fechaVencimiento.lte = new Date(filters.fechaVencimientoHasta);
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.creadoEn = {};
      if (filters.fechaDesde) where.creadoEn.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.creadoEn.lte = new Date(filters.fechaHasta);
    }

    if (filters?.presupuestoId || filters?.clienteId || filters?.equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (filters.presupuestoId) where.ordenCompra.presupuesto.presupuestoId = filters.presupuestoId;
      if (filters.clienteId) where.ordenCompra.presupuesto.clienteId = filters.clienteId;
      if (filters.equipoId) where.ordenCompra.presupuesto.equipoId = filters.equipoId;
    }

    return this.prisma.certificado.count({ where });
  }

  // Métodos específicos para certificados
  async getCertificadosActivos(): Promise<Certificado[]> {
    return this.findByEstado('activo');
  }

  async getCertificadosVencidos(): Promise<Certificado[]> {
    return this.findByEstado('vencido');
  }

  async getCertificadosCancelados(): Promise<Certificado[]> {
    return this.findByEstado('cancelado');
  }

  async cambiarEstado(id: number, estado: 'activo' | 'vencido' | 'cancelado'): Promise<Certificado | null> {
    return this.update(id, { estado });
  }

  async marcarComoVencido(id: number): Promise<Certificado | null> {
    return this.cambiarEstado(id, 'vencido');
  }

  async cancelarCertificado(id: number): Promise<Certificado | null> {
    return this.cambiarEstado(id, 'cancelado');
  }

  async reactivarCertificado(id: number): Promise<Certificado | null> {
    return this.cambiarEstado(id, 'activo');
  }

  async getCertificadosPorVencer(dias: number = 30): Promise<Certificado[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const certificados = await this.prisma.certificado.findMany({
      where: {
        estado: 'activo',
        fechaVencimiento: {
          lte: fechaLimite,
          gte: new Date(),
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
      orderBy: { fechaVencimiento: 'asc' },
    });

    return certificados.map((certificado: any) => this.convertPrismaCertificado(certificado));
  }

  async getCertificadosVencidosRecientes(dias: number = 30): Promise<Certificado[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const certificados = await this.prisma.certificado.findMany({
      where: {
        estado: 'vencido',
        fechaVencimiento: {
          gte: fechaLimite,
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
      orderBy: { fechaVencimiento: 'desc' },
    });

    return certificados.map((certificado: any) => this.convertPrismaCertificado(certificado));
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalCertificados: number;
    activos: number;
    vencidos: number;
    cancelados: number;
    porVencer: number;
  }> {
    const certificados = await this.findByOrdenCompra(ordenCompraId);
    const ahora = new Date();
    
    const totalCertificados = certificados.length;
    const activos = certificados.filter(c => c.estado === 'activo').length;
    const vencidos = certificados.filter(c => c.estado === 'vencido').length;
    const cancelados = certificados.filter(c => c.estado === 'cancelado').length;
    const porVencer = certificados.filter(c => 
      c.estado === 'activo' && 
      c.fechaVencimiento > ahora && 
      c.fechaVencimiento <= new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalCertificados,
      activos,
      vencidos,
      cancelados,
      porVencer,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalCertificados: number;
    activos: number;
    vencidos: number;
    cancelados: number;
    porVencer: number;
    promedioCertificadosPorOrden: number;
  }> {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.creadoEn = {};
      if (fechaInicio) where.creadoEn.gte = fechaInicio;
      if (fechaFin) where.creadoEn.lte = fechaFin;
    }

    const ahora = new Date();
    const fechaLimite = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalCertificados, activos, vencidos, cancelados, porVencer, totalOrdenes] = await Promise.all([
      this.prisma.certificado.count({ where }),
      this.prisma.certificado.count({ where: { ...where, estado: 'activo' } }),
      this.prisma.certificado.count({ where: { ...where, estado: 'vencido' } }),
      this.prisma.certificado.count({ where: { ...where, estado: 'cancelado' } }),
      this.prisma.certificado.count({
        where: {
          ...where,
          estado: 'activo',
          fechaVencimiento: {
            gte: ahora,
            lte: fechaLimite,
          },
        },
      }),
      this.prisma.ordenCompra.count(),
    ]);

    return {
      totalCertificados,
      activos,
      vencidos,
      cancelados,
      porVencer,
      promedioCertificadosPorOrden: totalOrdenes > 0 ? totalCertificados / totalOrdenes : 0,
    };
  }

  async generarCodigoCertificado(tipo: 'seguro' | 'habilitacion' | 'otros'): Promise<string> {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Contar certificados del día para generar secuencial
    const inicioDia = new Date(anio, fecha.getMonth(), fecha.getDate());
    const finDia = new Date(anio, fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    
    const certificadosDelDia = await this.prisma.certificado.count({
      where: {
        tipo,
        creadoEn: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    const secuencial = String(certificadosDelDia + 1).padStart(3, '0');
    const tipoAbrev = tipo === 'seguro' ? 'SEG' : tipo === 'habilitacion' ? 'HAB' : 'OTR';
    return `${tipoAbrev}-${anio}${mes}${dia}-${secuencial}`;
  }

  async actualizarEstadosAutomaticamente(): Promise<{
    actualizados: number;
    vencidos: number;
  }> {
    const ahora = new Date();
    
    // Marcar como vencidos los certificados activos cuya fecha de vencimiento ya pasó
    const resultado = await this.prisma.certificado.updateMany({
      where: {
        estado: 'activo',
        fechaVencimiento: {
          lt: ahora,
        },
      },
      data: {
        estado: 'vencido',
      },
    });

    return {
      actualizados: resultado.count,
      vencidos: resultado.count,
    };
  }
} 