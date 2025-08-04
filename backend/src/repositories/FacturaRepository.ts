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
      archivosAdjuntos: prismaFactura.archivosAdjuntos ? JSON.parse(prismaFactura.archivosAdjuntos) : undefined,
      items: prismaFactura.items ? prismaFactura.items.map((item: any) => ({
        id: item.id,
        facturaId: item.facturaId,
        numero: item.numero,
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        unidad: item.unidad,
        precioUnitario: Number(item.precioUnitario),
        precioTotal: Number(item.precioTotal),
        observaciones: item.observaciones,
        creadoEn: item.creadoEn,
      })) : undefined,
    };
  }

  async findAll(filters?: FacturaFilters): Promise<PaginatedResponse<Factura>> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc', ordenCompraId, presupuestoId, clienteId, equipoId, numeroFactura, estado, fechaEmisionDesde, fechaEmisionHasta, fechaVencimientoDesde, fechaVencimientoHasta, montoMin, montoMax, fechaDesde, fechaHasta } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (numeroFactura) where.numeroFactura = { contains: numeroFactura, mode: 'insensitive' };
    if (estado) where.estado = estado;
    
    // Filtros de monto
    if (montoMin !== undefined || montoMax !== undefined) {
      where.monto = {};
      if (montoMin !== undefined) where.monto.gte = montoMin;
      if (montoMax !== undefined) where.monto.lte = montoMax;
    }

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
      if (equipoId) {
        where.ordenCompra.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
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
                  usuario: {
                    select: {
                      id: true,
                      nombre: true,
                      email: true,
                      rol: true,
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
                  },
                },
              },
            },
          },
        },
        items: {
          orderBy: { numero: 'asc' }
        }
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
                  },
                },
              },
            },
          },
        },
      },
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
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

    if (data.montoPagado !== undefined) {
      createData.montoPagado = data.montoPagado;
    }

    if (data.saldoPendiente !== undefined) {
      createData.saldoPendiente = data.saldoPendiente;
    }

    if (data.pdfPath) {
      createData.pdfPath = data.pdfPath;
    }

    if (data.archivosAdjuntos && data.archivosAdjuntos.length > 0) {
      createData.archivosAdjuntos = JSON.stringify(data.archivosAdjuntos);
    }

    if (data.observaciones) {
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
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
    if (data.montoPagado !== undefined) updateData.montoPagado = data.montoPagado;
    if (data.saldoPendiente !== undefined) updateData.saldoPendiente = data.saldoPendiente;
    if (data.concepto !== undefined) updateData.concepto = data.concepto;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.pdfPath !== undefined) updateData.pdfPath = data.pdfPath;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.archivosAdjuntos !== undefined) {
      updateData.archivosAdjuntos = data.archivosAdjuntos ? JSON.stringify(data.archivosAdjuntos) : null;
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
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
    const { ordenCompraId, presupuestoId, clienteId, equipoId, numeroFactura, estado, fechaEmisionDesde, fechaEmisionHasta, fechaVencimientoDesde, fechaVencimientoHasta, montoMin, montoMax, fechaDesde, fechaHasta } = filters || {};

    const where: any = {};
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (numeroFactura) where.numeroFactura = { contains: numeroFactura, mode: 'insensitive' };
    if (estado) where.estado = estado;
    
    // Filtros de monto
    if (montoMin !== undefined || montoMax !== undefined) {
      where.monto = {};
      if (montoMin !== undefined) where.monto.gte = montoMin;
      if (montoMax !== undefined) where.monto.lte = montoMax;
    }

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
      if (equipoId) {
        where.ordenCompra.presupuesto.equipos = {
          some: {
            equipoId: equipoId
          }
        };
      }
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

  async marcarComoPagada(id: number): Promise<Factura | null> {
    return this.update(id, { estado: 'pagada' });
  }

  async marcarComoPagadaConMonto(id: number, montoPagado?: number): Promise<Factura | null> {
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
    return this.update(id, { estado: 'cancelada' });
  }

  async reactivarFactura(id: number): Promise<Factura | null> {
    return this.update(id, { estado: 'pendiente' });
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
                  },
                },
              },
            },
          },
        },
      },
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
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rol: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return facturas.map((factura: any) => this.convertPrismaFactura(factura));
  }

  async generarNumeroFactura(): Promise<string> {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Contar facturas del día para generar secuencial
    const inicioDia = new Date(anio, fecha.getMonth(), fecha.getDate());
    const finDia = new Date(anio, fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
    
    const facturasDelDia = await this.prisma.factura.count({
      where: {
        creadoEn: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });
    
    const secuencial = String(facturasDelDia + 1).padStart(3, '0');
    return `FAC-${anio}${mes}${dia}-${secuencial}`;
  }
} 