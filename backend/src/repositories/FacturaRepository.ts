import { PrismaClient } from '@prisma/client';
import { Factura, CreateFacturaDto, UpdateFacturaDto, PaginatedResponse, FacturaFilters } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class FacturaRepository implements IBaseRepository<Factura, CreateFacturaDto, UpdateFacturaDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Helper para convertir tipos de Prisma a nuestros tipos
  private convertPrismaFactura(prismaFactura: any): Factura {
    return {
      ...prismaFactura,
      monto: Number(prismaFactura.monto),
      montoPagado: prismaFactura.montoPagado ? Number(prismaFactura.montoPagado) : undefined,
      saldoPendiente: prismaFactura.saldoPendiente ? Number(prismaFactura.saldoPendiente) : undefined,
      archivosAdjuntos: prismaFactura.archivosAdjuntos ? (prismaFactura.archivosAdjuntos as string[]) : undefined,
    };
  }

  async findAll(filters?: FacturaFilters): Promise<PaginatedResponse<Factura>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', ordenCompraId, presupuestoId, clienteId, equipoId, numeroFactura, estado, fechaEmisionDesde, fechaEmisionHasta, fechaVencimientoDesde, fechaVencimientoHasta, montoMin, montoMax, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (numeroFactura) where.numeroFactura = { contains: numeroFactura, mode: 'insensitive' };
    if (estado) where.estado = estado;
    
    // Filtros de fecha de emisión
    if (fechaEmisionDesde || fechaEmisionHasta) {
      where.fechaEmision = {};
      if (fechaEmisionDesde) where.fechaEmision.gte = new Date(fechaEmisionDesde);
      if (fechaEmisionHasta) where.fechaEmision.lte = new Date(fechaEmisionHasta);
    }

    // Filtros de fecha de vencimiento
    if (fechaVencimientoDesde || fechaVencimientoHasta) {
      where.fechaVencimiento = {};
      if (fechaVencimientoDesde) where.fechaVencimiento.gte = new Date(fechaVencimientoDesde);
      if (fechaVencimientoHasta) where.fechaVencimiento.lte = new Date(fechaVencimientoHasta);
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
      this.prisma.factura.findMany({
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
      this.prisma.factura.count({ where }),
    ]);

    return {
      data: data.map((factura: any) => this.convertPrismaFactura(factura)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Factura | null> {
    const factura = await this.prisma.factura.findUnique({
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

    return factura ? this.convertPrismaFactura(factura) : null;
  }

  async findByOrdenCompra(ordenCompraId: number): Promise<Factura[]> {
    const facturas = await this.prisma.factura.findMany({
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

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
  }

  async findByNumeroFactura(numeroFactura: string): Promise<Factura | null> {
    const factura = await this.prisma.factura.findUnique({
      where: { numeroFactura },
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

    return factura ? this.convertPrismaFactura(factura) : null;
  }

  async findByEstado(estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura[]> {
    const facturas = await this.prisma.factura.findMany({
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

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
  }

  async create(data: CreateFacturaDto): Promise<Factura> {
    const createData: any = {
      ordenCompraId: data.ordenCompraId,
      numeroFactura: data.numeroFactura,
      fechaEmision: data.fechaEmision,
      fechaVencimiento: data.fechaVencimiento,
      monto: data.monto,
      concepto: data.concepto,
      estado: data.estado || 'pendiente',
    };

    // Campos opcionales
    if (data.montoPagado !== undefined) {
      createData.montoPagado = data.montoPagado;
    }
    if (data.saldoPendiente !== undefined) {
      createData.saldoPendiente = data.saldoPendiente;
    } else {
      // Calcular saldo pendiente automáticamente
      createData.saldoPendiente = data.monto - (data.montoPagado || 0);
    }
    if (data.pdfPath !== undefined) {
      createData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      createData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      createData.observaciones = data.observaciones;
    }

    const factura = await this.prisma.factura.create({
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

    return this.convertPrismaFactura(factura);
  }

  async update(id: number, data: UpdateFacturaDto): Promise<Factura | null> {
    const updateData: any = {};

    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.numeroFactura !== undefined) updateData.numeroFactura = data.numeroFactura;
    if (data.fechaEmision !== undefined) updateData.fechaEmision = data.fechaEmision;
    if (data.fechaVencimiento !== undefined) updateData.fechaVencimiento = data.fechaVencimiento;
    if (data.monto !== undefined) updateData.monto = data.monto;
    if (data.concepto !== undefined) updateData.concepto = data.concepto;
    if (data.estado !== undefined) updateData.estado = data.estado;
    
    // Manejar campos opcionales
    if (data.montoPagado !== undefined) {
      updateData.montoPagado = data.montoPagado;
    }
    if (data.saldoPendiente !== undefined) {
      updateData.saldoPendiente = data.saldoPendiente;
    } else if (data.monto !== undefined || data.montoPagado !== undefined) {
      // Recalcular saldo pendiente si se actualizó monto o monto pagado
      const facturaActual = await this.findById(id);
      if (facturaActual) {
        const nuevoMonto = data.monto !== undefined ? data.monto : facturaActual.monto;
        const nuevoMontoPagado = data.montoPagado !== undefined ? data.montoPagado : (facturaActual.montoPagado || 0);
        updateData.saldoPendiente = nuevoMonto - nuevoMontoPagado;
      }
    }
    if (data.pdfPath !== undefined) {
      updateData.pdfPath = data.pdfPath;
    }
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones;
    }

    const factura = await this.prisma.factura.update({
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

    return this.convertPrismaFactura(factura);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.factura.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.factura.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: FacturaFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.ordenCompraId) where.ordenCompraId = filters.ordenCompraId;
    if (filters?.numeroFactura) where.numeroFactura = { contains: filters.numeroFactura, mode: 'insensitive' };
    if (filters?.estado) where.estado = filters.estado;
    
    if (filters?.fechaEmisionDesde || filters?.fechaEmisionHasta) {
      where.fechaEmision = {};
      if (filters.fechaEmisionDesde) where.fechaEmision.gte = new Date(filters.fechaEmisionDesde);
      if (filters.fechaEmisionHasta) where.fechaEmision.lte = new Date(filters.fechaEmisionHasta);
    }

    if (filters?.fechaVencimientoDesde || filters?.fechaVencimientoHasta) {
      where.fechaVencimiento = {};
      if (filters.fechaVencimientoDesde) where.fechaVencimiento.gte = new Date(filters.fechaVencimientoDesde);
      if (filters.fechaVencimientoHasta) where.fechaVencimiento.lte = new Date(filters.fechaVencimientoHasta);
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

    if (filters?.presupuestoId || filters?.clienteId || filters?.equipoId) {
      where.ordenCompra = {
        presupuesto: {},
      };
      if (filters.presupuestoId) where.ordenCompra.presupuesto.presupuestoId = filters.presupuestoId;
      if (filters.clienteId) where.ordenCompra.presupuesto.clienteId = filters.clienteId;
      if (filters.equipoId) where.ordenCompra.presupuesto.equipoId = filters.equipoId;
    }

    return this.prisma.factura.count({ where });
  }

  // Métodos específicos para facturas
  async getFacturasPendientes(): Promise<Factura[]> {
    return this.findByEstado('pendiente');
  }

  async getFacturasPagadas(): Promise<Factura[]> {
    return this.findByEstado('pagada');
  }

  async getFacturasCanceladas(): Promise<Factura[]> {
    return this.findByEstado('cancelada');
  }

  async cambiarEstado(id: number, estado: 'pendiente' | 'pagada' | 'cancelada'): Promise<Factura | null> {
    return this.update(id, { estado });
  }

  async marcarComoPagada(id: number, montoPagado?: number): Promise<Factura | null> {
    const facturaActual = await this.findById(id);
    if (!facturaActual) return null;

    const nuevoMontoPagado = montoPagado !== undefined ? montoPagado : facturaActual.monto;
    const nuevoSaldoPendiente = facturaActual.monto - nuevoMontoPagado;

    return this.update(id, {
      estado: 'pagada',
      montoPagado: nuevoMontoPagado,
      saldoPendiente: nuevoSaldoPendiente,
    });
  }

  async cancelarFactura(id: number): Promise<Factura | null> {
    return this.cambiarEstado(id, 'cancelada');
  }

  async reactivarFactura(id: number): Promise<Factura | null> {
    return this.cambiarEstado(id, 'pendiente');
  }

  async getFacturasPorVencer(dias: number = 30): Promise<Factura[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const facturas = await this.prisma.factura.findMany({
      where: {
        estado: 'pendiente',
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

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
  }

  async getFacturasVencidas(): Promise<Factura[]> {
    const facturas = await this.prisma.factura.findMany({
      where: {
        estado: 'pendiente',
        fechaVencimiento: {
          lt: new Date(),
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

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalFacturas: number;
    pendientes: number;
    pagadas: number;
    canceladas: number;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
  }> {
    const facturas = await this.findByOrdenCompra(ordenCompraId);
    
    const totalFacturas = facturas.length;
    const pendientes = facturas.filter(f => f.estado === 'pendiente').length;
    const pagadas = facturas.filter(f => f.estado === 'pagada').length;
    const canceladas = facturas.filter(f => f.estado === 'cancelada').length;
    
    const montoTotal = facturas.reduce((sum, f) => sum + f.monto, 0);
    const montoPagado = facturas.reduce((sum, f) => sum + (f.montoPagado || 0), 0);
    const saldoPendiente = facturas.reduce((sum, f) => sum + (f.saldoPendiente || 0), 0);

    return {
      totalFacturas,
      pendientes,
      pagadas,
      canceladas,
      montoTotal,
      montoPagado,
      saldoPendiente,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalFacturas: number;
    pendientes: number;
    pagadas: number;
    canceladas: number;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
    promedioFacturasPorOrden: number;
    facturasVencidas: number;
  }> {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.creadoEn = {};
      if (fechaInicio) where.creadoEn.gte = fechaInicio;
      if (fechaFin) where.creadoEn.lte = fechaFin;
    }

    const ahora = new Date();

    const [totalFacturas, pendientes, pagadas, canceladas, totalOrdenes, facturasVencidas] = await Promise.all([
      this.prisma.factura.count({ where }),
      this.prisma.factura.count({ where: { ...where, estado: 'pendiente' } }),
      this.prisma.factura.count({ where: { ...where, estado: 'pagada' } }),
      this.prisma.factura.count({ where: { ...where, estado: 'cancelada' } }),
      this.prisma.ordenCompra.count(),
      this.prisma.factura.count({
        where: {
          ...where,
          estado: 'pendiente',
          fechaVencimiento: {
            lt: ahora,
          },
        },
      }),
    ]);

    // Calcular montos
    const facturas = await this.prisma.factura.findMany({ where });
    const montoTotal = facturas.reduce((sum: number, f: any) => sum + Number(f.monto), 0);
    const montoPagado = facturas.reduce((sum: number, f: any) => sum + Number(f.montoPagado || 0), 0);
    const saldoPendiente = facturas.reduce((sum: number, f: any) => sum + Number(f.saldoPendiente || 0), 0);

    return {
      totalFacturas,
      pendientes,
      pagadas,
      canceladas,
      montoTotal,
      montoPagado,
      saldoPendiente,
      promedioFacturasPorOrden: totalOrdenes > 0 ? totalFacturas / totalOrdenes : 0,
      facturasVencidas,
    };
  }

  async generarNumeroFactura(): Promise<string> {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    
    // Contar facturas del mes para generar secuencial
    const inicioMes = new Date(anio, fecha.getMonth(), 1);
    const finMes = new Date(anio, fecha.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const facturasDelMes = await this.prisma.factura.count({
      where: {
        creadoEn: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    });

    const secuencial = String(facturasDelMes + 1).padStart(4, '0');
    return `FAC-${anio}${mes}-${secuencial}`;
  }

  async registrarPago(id: number, montoPagado: number): Promise<Factura | null> {
    const facturaActual = await this.findById(id);
    if (!facturaActual) return null;

    if (facturaActual.estado === 'cancelada') {
      throw new Error('No se puede registrar un pago en una factura cancelada');
    }

    const nuevoMontoPagado = (facturaActual.montoPagado || 0) + montoPagado;
    const nuevoSaldoPendiente = facturaActual.monto - nuevoMontoPagado;
    const nuevoEstado = nuevoSaldoPendiente <= 0 ? 'pagada' : 'pendiente';

    return this.update(id, {
      montoPagado: nuevoMontoPagado,
      saldoPendiente: nuevoSaldoPendiente,
      estado: nuevoEstado,
    });
  }

  async actualizarPdfPath(id: number, pdfPath: string): Promise<Factura | null> {
    return this.update(id, { pdfPath });
  }
} 