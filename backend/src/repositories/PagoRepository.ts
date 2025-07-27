import { PrismaClient } from '@prisma/client';
import { Pago, CreatePagoDto, UpdatePagoDto, PaginatedResponse, PagoFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class PagoRepository implements IBaseRepository<Pago, CreatePagoDto, UpdatePagoDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaPago(prismaPago: any): Pago {
    return {
      ...prismaPago,
      monto: Number(prismaPago.monto),
      archivosAdjuntos: prismaPago.archivosAdjuntos ? (prismaPago.archivosAdjuntos as string[]) : undefined,
    };
  }

  async findAll(filters?: PagoFilters): Promise<PaginatedResponse<Pago>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', facturaId, ordenCompraId, presupuestoId, clienteId, metodoPago, estado, procesadoPor, fechaPagoDesde, fechaPagoHasta, montoMin, montoMax, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (facturaId) where.facturaId = facturaId;
    if (metodoPago) where.metodoPago = metodoPago;
    if (estado) where.estado = estado;
    if (procesadoPor) where.procesadoPor = procesadoPor;
    
    // Filtros de fecha de pago
    if (fechaPagoDesde || fechaPagoHasta) {
      where.fechaPago = {};
      if (fechaPagoDesde) where.fechaPago.gte = new Date(fechaPagoDesde);
      if (fechaPagoHasta) where.fechaPago.lte = new Date(fechaPagoHasta);
    }

    // Filtros de monto
    if (montoMin !== undefined || montoMax !== undefined) {
      where.monto = {};
      if (montoMin !== undefined) where.monto.gte = montoMin;
      if (montoMax !== undefined) where.monto.lte = montoMax;
    }

    // Filtros de fecha de creación
    if (fechaDesde || fechaHasta) {
      where.creadoEn = {};
      if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
      if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta);
    }

    // Filtros por orden de compra, presupuesto y cliente a través de la factura
    if (ordenCompraId || presupuestoId || clienteId) {
      where.factura = {
        ordenCompra: {
          presupuesto: {},
        },
      };
      if (ordenCompraId) where.factura.ordenCompra.ordenCompraId = ordenCompraId;
      if (presupuestoId) where.factura.ordenCompra.presupuesto.presupuestoId = presupuestoId;
      if (clienteId) where.factura.ordenCompra.presupuesto.clienteId = clienteId;
    }

    const [data, total] = await Promise.all([
      this.prisma.pago.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          factura: {
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
          },
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
      this.prisma.pago.count({ where }),
    ]);

    return {
      data: data.map((pago: any) => this.convertPrismaPago(pago)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Pago | null> {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        factura: {
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
        },
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

    return pago ? this.convertPrismaPago(pago) : null;
  }

  async findByFactura(facturaId: number): Promise<Pago[]> {
    const pagos = await this.prisma.pago.findMany({
      where: { facturaId },
      include: {
        factura: {
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
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return pagos.map((pago: any) => this.convertPrismaPago(pago));
  }

  async findByMetodoPago(metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros'): Promise<Pago[]> {
    const pagos = await this.prisma.pago.findMany({
      where: { metodoPago },
      include: {
        factura: {
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
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return pagos.map((pago: any) => this.convertPrismaPago(pago));
  }

  async findByEstado(estado: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado'): Promise<Pago[]> {
    const pagos = await this.prisma.pago.findMany({
      where: { estado },
      include: {
        factura: {
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
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return pagos.map((pago: any) => this.convertPrismaPago(pago));
  }

  async create(data: CreatePagoDto): Promise<Pago> {
    const createData: any = {
      facturaId: data.facturaId,
      monto: data.monto,
      fechaPago: data.fechaPago,
      metodoPago: data.metodoPago,
      estado: data.estado || 'confirmado',
    };

    // Campos opcionales
    if (data.referencia !== undefined) {
      createData.referencia = data.referencia;
    }
    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }
    if (data.comprobante !== undefined) {
      createData.comprobante = data.comprobante;
    }
    if (data.archivosAdjuntos !== undefined) {
      createData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.procesadoPor !== undefined) {
      createData.procesadoPor = data.procesadoPor;
    }

    const pago = await this.prisma.pago.create({
      data: createData,
      include: {
        factura: {
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
        },
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

    return this.convertPrismaPago(pago);
  }

  async update(id: number, data: UpdatePagoDto): Promise<Pago | null> {
    const updateData: any = {};

    if (data.facturaId !== undefined) updateData.facturaId = data.facturaId;
    if (data.monto !== undefined) updateData.monto = data.monto;
    if (data.fechaPago !== undefined) updateData.fechaPago = data.fechaPago;
    if (data.metodoPago !== undefined) updateData.metodoPago = data.metodoPago;
    if (data.estado !== undefined) updateData.estado = data.estado;
    
    // Manejar campos opcionales
    if (data.referencia !== undefined) {
      updateData.referencia = data.referencia;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones;
    }
    if (data.comprobante !== undefined) {
      updateData.comprobante = data.comprobante;
    }
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.procesadoPor !== undefined) {
      updateData.procesadoPor = data.procesadoPor;
    }

    const pago = await this.prisma.pago.update({
      where: { id },
      data: updateData,
      include: {
        factura: {
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
        },
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

    return this.convertPrismaPago(pago);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.pago.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.pago.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: PagoFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.facturaId) where.facturaId = filters.facturaId;
    if (filters?.metodoPago) where.metodoPago = filters.metodoPago;
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.procesadoPor) where.procesadoPor = filters.procesadoPor;
    
    if (filters?.fechaPagoDesde || filters?.fechaPagoHasta) {
      where.fechaPago = {};
      if (filters.fechaPagoDesde) where.fechaPago.gte = new Date(filters.fechaPagoDesde);
      if (filters.fechaPagoHasta) where.fechaPago.lte = new Date(filters.fechaPagoHasta);
    }

    if (filters?.montoMin !== undefined || filters?.montoMax !== undefined) {
      where.monto = {};
      if (filters.montoMin !== undefined) where.monto.gte = filters.montoMin;
      if (filters.montoMax !== undefined) where.monto.lte = filters.montoMax;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.creadoEn = {};
      if (filters.fechaDesde) where.creadoEn.gte = new Date(filters.fechaDesde);
      if (filters.fechaHasta) where.creadoEn.lte = new Date(filters.fechaHasta);
    }

    if (filters?.ordenCompraId || filters?.presupuestoId || filters?.clienteId) {
      where.factura = {
        ordenCompra: {
          presupuesto: {},
        },
      };
      if (filters.ordenCompraId) where.factura.ordenCompra.ordenCompraId = filters.ordenCompraId;
      if (filters.presupuestoId) where.factura.ordenCompra.presupuesto.presupuestoId = filters.presupuestoId;
      if (filters.clienteId) where.factura.ordenCompra.presupuesto.clienteId = filters.clienteId;
    }

    return this.prisma.pago.count({ where });
  }

  // Métodos específicos para pagos
  async getPagosPendientes(): Promise<Pago[]> {
    return this.findByEstado('pendiente');
  }

  async getPagosConfirmados(): Promise<Pago[]> {
    return this.findByEstado('confirmado');
  }

  async getPagosRechazados(): Promise<Pago[]> {
    return this.findByEstado('rechazado');
  }

  async getPagosCancelados(): Promise<Pago[]> {
    return this.findByEstado('cancelado');
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado'): Promise<Pago | null> {
    return this.update(id, { estado });
  }

  async confirmarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    const updateData: any = { estado: 'confirmado' };
    if (procesadoPor !== undefined) {
      updateData.procesadoPor = procesadoPor;
    }
    return this.update(id, updateData);
  }

  async rechazarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    const updateData: any = { estado: 'rechazado' };
    if (procesadoPor !== undefined) {
      updateData.procesadoPor = procesadoPor;
    }
    return this.update(id, updateData);
  }

  async cancelarPago(id: number, procesadoPor?: number): Promise<Pago | null> {
    const updateData: any = { estado: 'cancelado' };
    if (procesadoPor !== undefined) {
      updateData.procesadoPor = procesadoPor;
    }
    return this.update(id, updateData);
  }

  async reactivarPago(id: number): Promise<Pago | null> {
    return this.cambiarEstado(id, 'pendiente');
  }

  async getPagosPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<Pago[]> {
    const pagos = await this.prisma.pago.findMany({
      where: {
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        factura: {
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
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { fechaPago: 'desc' },
    });

    return pagos.map((pago: any) => this.convertPrismaPago(pago));
  }

  async getEstadisticasPorFactura(facturaId: number): Promise<{
    totalPagos: number;
    pendientes: number;
    confirmados: number;
    rechazados: number;
    cancelados: number;
    montoTotal: number;
    montoConfirmado: number;
    montoPendiente: number;
  }> {
    const pagos = await this.findByFactura(facturaId);
    
    const totalPagos = pagos.length;
    const pendientes = pagos.filter(p => p.estado === 'pendiente').length;
    const confirmados = pagos.filter(p => p.estado === 'confirmado').length;
    const rechazados = pagos.filter(p => p.estado === 'rechazado').length;
    const cancelados = pagos.filter(p => p.estado === 'cancelado').length;
    
    const montoTotal = pagos.reduce((sum, p) => sum + p.monto, 0);
    const montoConfirmado = pagos.filter(p => p.estado === 'confirmado').reduce((sum, p) => sum + p.monto, 0);
    const montoPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0);

    return {
      totalPagos,
      pendientes,
      confirmados,
      rechazados,
      cancelados,
      montoTotal,
      montoConfirmado,
      montoPendiente,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalPagos: number;
    pendientes: number;
    confirmados: number;
    rechazados: number;
    cancelados: number;
    montoTotal: number;
    montoConfirmado: number;
    montoPendiente: number;
    promedioPagosPorFactura: number;
    pagosPorMetodo: Record<string, number>;
  }> {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.fechaPago = {};
      if (fechaInicio) where.fechaPago.gte = fechaInicio;
      if (fechaFin) where.fechaPago.lte = fechaFin;
    }

    const [totalPagos, pendientes, confirmados, rechazados, cancelados, totalFacturas] = await Promise.all([
      this.prisma.pago.count({ where }),
      this.prisma.pago.count({ where: { ...where, estado: 'pendiente' } }),
      this.prisma.pago.count({ where: { ...where, estado: 'confirmado' } }),
      this.prisma.pago.count({ where: { ...where, estado: 'rechazado' } }),
      this.prisma.pago.count({ where: { ...where, estado: 'cancelado' } }),
      this.prisma.factura.count(),
    ]);

    // Calcular montos
    const pagos = await this.prisma.pago.findMany({ where });
    const montoTotal = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);
    const montoConfirmado = pagos.filter((p: any) => p.estado === 'confirmado').reduce((sum: number, p: any) => sum + Number(p.monto), 0);
    const montoPendiente = pagos.filter((p: any) => p.estado === 'pendiente').reduce((sum: number, p: any) => sum + Number(p.monto), 0);

    // Calcular pagos por método
    const pagosPorMetodo: Record<string, number> = {};
    const metodos = ['efectivo', 'transferencia', 'cheque', 'tarjeta_credito', 'tarjeta_debito', 'otros'];
    
    for (const metodo of metodos) {
      const count = await this.prisma.pago.count({
        where: { ...where, metodoPago: metodo as any },
      });
      pagosPorMetodo[metodo] = count;
    }

    return {
      totalPagos,
      pendientes,
      confirmados,
      rechazados,
      cancelados,
      montoTotal,
      montoConfirmado,
      montoPendiente,
      promedioPagosPorFactura: totalFacturas > 0 ? totalPagos / totalFacturas : 0,
      pagosPorMetodo,
    };
  }

  async actualizarComprobante(id: number, comprobante: string): Promise<Pago | null> {
    return this.update(id, { comprobante });
  }

  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<Pago | null> {
    const pagoActual = await this.findById(id);
    if (!pagoActual) return null;

    const archivosAdjuntos = pagoActual.archivosAdjuntos || [];
    archivosAdjuntos.push(urlArchivo);

    return this.update(id, { archivosAdjuntos });
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<Pago | null> {
    const pagoActual = await this.findById(id);
    if (!pagoActual) return null;

    const archivosAdjuntos = pagoActual.archivosAdjuntos || [];
    const archivosFiltrados = archivosAdjuntos.filter(url => url !== urlArchivo);

    if (archivosFiltrados.length === archivosAdjuntos.length) {
      throw new Error('El archivo especificado no existe en este pago');
    }

    return this.update(id, { archivosAdjuntos: archivosFiltrados });
  }
} 