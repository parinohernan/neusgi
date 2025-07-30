import { PrismaClient } from '@prisma/client';
import { CuentaCorriente, CreateCuentaCorrienteDto, UpdateCuentaCorrienteDto, CuentaCorrienteFilters, PaginatedResponse } from '@/types';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class CuentaCorrienteRepository implements IBaseRepository<CuentaCorriente, CreateCuentaCorrienteDto, UpdateCuentaCorrienteDto> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: CuentaCorrienteFilters): Promise<PaginatedResponse<CuentaCorriente>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.clienteId) {
      where.clienteId = filters.clienteId;
    }

    if (filters?.tipoMovimiento) {
      where.tipoMovimiento = filters.tipoMovimiento;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.procesadoPor) {
      where.procesadoPor = filters.procesadoPor;
    }

    if (filters?.facturaId) {
      where.facturaId = filters.facturaId;
    }

    if (filters?.pagoId) {
      where.pagoId = filters.pagoId;
    }

    if (filters?.ordenCompraId) {
      where.ordenCompraId = filters.ordenCompraId;
    }

    if (filters?.fechaMovimientoDesde || filters?.fechaMovimientoHasta) {
      where.fechaMovimiento = {};
      if (filters.fechaMovimientoDesde) {
        where.fechaMovimiento.gte = new Date(filters.fechaMovimientoDesde);
      }
      if (filters.fechaMovimientoHasta) {
        where.fechaMovimiento.lte = new Date(filters.fechaMovimientoHasta);
      }
    }

    if (filters?.fechaVencimientoDesde || filters?.fechaVencimientoHasta) {
      where.fechaVencimiento = {};
      if (filters.fechaVencimientoDesde) {
        where.fechaVencimiento.gte = new Date(filters.fechaVencimientoDesde);
      }
      if (filters.fechaVencimientoHasta) {
        where.fechaVencimiento.lte = new Date(filters.fechaVencimientoHasta);
      }
    }

    if (filters?.montoMin || filters?.montoMax) {
      where.monto = {};
      if (filters.montoMin) {
        where.monto.gte = filters.montoMin;
      }
      if (filters.montoMax) {
        where.monto.lte = filters.montoMax;
      }
    }

    if (filters?.saldoMin || filters?.saldoMax) {
      where.saldoNuevo = {};
      if (filters.saldoMin) {
        where.saldoNuevo.gte = filters.saldoMin;
      }
      if (filters.saldoMax) {
        where.saldoNuevo.lte = filters.saldoMax;
      }
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.creadoEn = {};
      if (filters.fechaDesde) {
        where.creadoEn.gte = new Date(filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        where.creadoEn.lte = new Date(filters.fechaHasta);
      }
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'asc';
    } else {
      orderBy.fechaMovimiento = 'desc';
    }

    const [cuentasCorriente, total] = await Promise.all([
      this.prisma.cuentaCorriente.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          cliente: {
            include: {
              usuario: true,
            },
          },
          factura: {
            include: {
              ordenCompra: {
                include: {
                  presupuesto: {
                    include: {
                      cliente: true,
                      equipos: {
              include: {
                equipo: true
              }
            },
                    },
                  },
                },
              },
            },
          },
          pago: {
            include: {
              factura: {
                include: {
                  ordenCompra: {
                    include: {
                      presupuesto: {
                        include: {
                          cliente: true,
                          equipos: {
              include: {
                equipo: true
              }
            },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ordenCompra: {
            include: {
              presupuesto: {
                include: {
                  cliente: true,
                  equipos: {
              include: {
                equipo: true
              }
            },
                },
              },
            },
          },
          usuario: true,
        },
      }),
      this.prisma.cuentaCorriente.count({ where }),
    ]);

    return {
      data: cuentasCorriente.map(this.convertPrismaCuentaCorriente),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<CuentaCorriente | null> {
    const cuentaCorriente = await this.prisma.cuentaCorriente.findUnique({
      where: { id },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentaCorriente ? this.convertPrismaCuentaCorriente(cuentaCorriente) : null;
  }

  async create(data: CreateCuentaCorrienteDto): Promise<CuentaCorriente> {
    // Calcular saldos si no se proporcionan
    let saldoAnterior = data.saldoAnterior;
    let saldoNuevo = data.saldoNuevo;

    if (saldoAnterior === undefined || saldoNuevo === undefined) {
      const ultimoMovimiento = await this.prisma.cuentaCorriente.findFirst({
        where: { clienteId: data.clienteId },
        orderBy: { fechaMovimiento: 'desc' },
      });

      saldoAnterior = ultimoMovimiento ? Number(ultimoMovimiento.saldoNuevo) : 0;
      saldoNuevo = saldoAnterior + data.monto;
    }

    const cuentaCorriente = await this.prisma.cuentaCorriente.create({
      data: {
        ...data,
        saldoAnterior,
        saldoNuevo,
        fechaMovimiento: new Date(data.fechaMovimiento),
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return this.convertPrismaCuentaCorriente(cuentaCorriente);
  }

  async update(id: number, data: UpdateCuentaCorrienteDto): Promise<CuentaCorriente | null> {
    const updateData: any = {};
    
    // Solo incluir campos que no sean undefined
    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.tipoMovimiento !== undefined) updateData.tipoMovimiento = data.tipoMovimiento;
    if (data.referencia !== undefined) updateData.referencia = data.referencia;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.monto !== undefined) updateData.monto = data.monto;
    if (data.saldoAnterior !== undefined) updateData.saldoAnterior = data.saldoAnterior;
    if (data.saldoNuevo !== undefined) updateData.saldoNuevo = data.saldoNuevo;
    if (data.fechaMovimiento !== undefined) updateData.fechaMovimiento = new Date(data.fechaMovimiento);
    if (data.fechaVencimiento !== undefined) updateData.fechaVencimiento = data.fechaVencimiento ? new Date(data.fechaVencimiento) : null;
    if (data.facturaId !== undefined) updateData.facturaId = data.facturaId;
    if (data.pagoId !== undefined) updateData.pagoId = data.pagoId;
    if (data.ordenCompraId !== undefined) updateData.ordenCompraId = data.ordenCompraId;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.procesadoPor !== undefined) updateData.procesadoPor = data.procesadoPor;

    const cuentaCorriente = await this.prisma.cuentaCorriente.update({
      where: { id },
      data: updateData,
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return this.convertPrismaCuentaCorriente(cuentaCorriente);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.cuentaCorriente.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.cuentaCorriente.count({
      where: { id },
    });
    return count > 0;
  }

  async count(filters?: CuentaCorrienteFilters): Promise<number> {
    const where: any = {};

    if (filters?.clienteId) {
      where.clienteId = filters.clienteId;
    }

    if (filters?.tipoMovimiento) {
      where.tipoMovimiento = filters.tipoMovimiento;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    return this.prisma.cuentaCorriente.count({ where });
  }

  // Métodos específicos para Cuenta Corriente
  async findByCliente(clienteId: number): Promise<CuentaCorriente[]> {
    const cuentasCorriente = await this.prisma.cuentaCorriente.findMany({
      where: { clienteId },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentasCorriente.map(this.convertPrismaCuentaCorriente);
  }

  async findByTipoMovimiento(tipoMovimiento: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros'): Promise<CuentaCorriente[]> {
    const cuentasCorriente = await this.prisma.cuentaCorriente.findMany({
      where: { tipoMovimiento },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentasCorriente.map(this.convertPrismaCuentaCorriente);
  }

  async findByEstado(estado: 'activo' | 'cancelado' | 'vencido'): Promise<CuentaCorriente[]> {
    const cuentasCorriente = await this.prisma.cuentaCorriente.findMany({
      where: { estado },
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentasCorriente.map(this.convertPrismaCuentaCorriente);
  }

  async getSaldoCliente(clienteId: number): Promise<number> {
    const ultimoMovimiento = await this.prisma.cuentaCorriente.findFirst({
      where: { clienteId },
      orderBy: { fechaMovimiento: 'desc' },
    });

    return ultimoMovimiento ? Number(ultimoMovimiento.saldoNuevo) : 0;
  }

  async getMovimientosVencidos(fechaActual: Date = new Date()): Promise<CuentaCorriente[]> {
    const cuentasCorriente = await this.prisma.cuentaCorriente.findMany({
      where: {
        fechaVencimiento: {
          lt: fechaActual,
        },
        estado: 'activo',
        saldoNuevo: {
          gt: 0,
        },
      },
      orderBy: { fechaVencimiento: 'asc' },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentasCorriente.map(this.convertPrismaCuentaCorriente);
  }

  async getMovimientosPorPeriodo(clienteId: number, fechaInicio: Date, fechaFin: Date): Promise<CuentaCorriente[]> {
    const cuentasCorriente = await this.prisma.cuentaCorriente.findMany({
      where: {
        clienteId,
        fechaMovimiento: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fechaMovimiento: 'asc' },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        factura: {
          include: {
            ordenCompra: {
              include: {
                presupuesto: {
                  include: {
                    cliente: true,
                    equipos: {
              include: {
                equipo: true
              }
            },
                  },
                },
              },
            },
          },
        },
        pago: {
          include: {
            factura: {
              include: {
                ordenCompra: {
                  include: {
                    presupuesto: {
                      include: {
                        cliente: true,
                        equipos: {
              include: {
                equipo: true
              }
            },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ordenCompra: {
          include: {
            presupuesto: {
              include: {
                cliente: true,
                equipos: {
              include: {
                equipo: true
              }
            },
              },
            },
          },
        },
        usuario: true,
      },
    });

    return cuentasCorriente.map(this.convertPrismaCuentaCorriente);
  }

  async getEstadisticasPorCliente(clienteId: number): Promise<{
    saldoActual: number;
    totalFacturas: number;
    totalPagos: number;
    totalAjustes: number;
    montoTotalFacturas: number;
    montoTotalPagos: number;
    montoTotalAjustes: number;
    movimientosVencidos: number;
    montoVencido: number;
  }> {
    const movimientos = await this.prisma.cuentaCorriente.findMany({
      where: { clienteId },
      orderBy: { fechaMovimiento: 'desc' },
    });

    const saldoActual = movimientos.length > 0 ? Number(movimientos[0]?.saldoNuevo) : 0;

    const facturas = movimientos.filter((m: any) => m.tipoMovimiento === 'factura');
    const pagos = movimientos.filter((m: any) => m.tipoMovimiento === 'pago');
    const ajustes = movimientos.filter((m: any) => m.tipoMovimiento === 'ajuste');

    const montoTotalFacturas = facturas.reduce((sum: number, f: any) => sum + Number(f.monto), 0);
    const montoTotalPagos = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);
    const montoTotalAjustes = ajustes.reduce((sum: number, a: any) => sum + Number(a.monto), 0);

    const movimientosVencidos = movimientos.filter((m: any) => 
      m.fechaVencimiento && m.fechaVencimiento < new Date() && m.estado === 'activo' && Number(m.saldoNuevo) > 0
    );

    const montoVencido = movimientosVencidos.reduce((sum: number, m: any) => sum + Number(m.saldoNuevo), 0);

    return {
      saldoActual,
      totalFacturas: facturas.length,
      totalPagos: pagos.length,
      totalAjustes: ajustes.length,
      montoTotalFacturas,
      montoTotalPagos,
      montoTotalAjustes,
      movimientosVencidos: movimientosVencidos.length,
      montoVencido,
    };
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalClientes: number;
    totalMovimientos: number;
    saldoTotal: number;
    montoTotalFacturas: number;
    montoTotalPagos: number;
    montoTotalAjustes: number;
    movimientosVencidos: number;
    montoVencido: number;
    promedioSaldoPorCliente: number;
    clientesConSaldo: number;
  }> {
    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.fechaMovimiento = {};
      if (fechaInicio) {
        where.fechaMovimiento.gte = fechaInicio;
      }
      if (fechaFin) {
        where.fechaMovimiento.lte = fechaFin;
      }
    }

    const movimientos = await this.prisma.cuentaCorriente.findMany({
      where,
      orderBy: { fechaMovimiento: 'desc' },
    });

    const clientes = await this.prisma.cliente.findMany();
    const totalClientes = clientes.length;

    const facturas = movimientos.filter((m: any) => m.tipoMovimiento === 'factura');
    const pagos = movimientos.filter((m: any) => m.tipoMovimiento === 'pago');
    const ajustes = movimientos.filter((m: any) => m.tipoMovimiento === 'ajuste');

    const montoTotalFacturas = facturas.reduce((sum: number, f: any) => sum + Number(f.monto), 0);
    const montoTotalPagos = pagos.reduce((sum: number, p: any) => sum + Number(p.monto), 0);
    const montoTotalAjustes = ajustes.reduce((sum: number, a: any) => sum + Number(a.monto), 0);

    const movimientosVencidos = movimientos.filter((m: any) => 
      m.fechaVencimiento && m.fechaVencimiento < new Date() && m.estado === 'activo' && Number(m.saldoNuevo) > 0
    );

    const montoVencido = movimientosVencidos.reduce((sum: number, m: any) => sum + Number(m.saldoNuevo), 0);

    // Calcular saldos por cliente
    const saldosPorCliente = new Map<number, number>();
    movimientos.forEach((m: any) => {
      const clienteId = m.clienteId;
      const saldoActual = Number(m.saldoNuevo);
      saldosPorCliente.set(clienteId, saldoActual);
    });

    const saldoTotal = Array.from(saldosPorCliente.values()).reduce((sum: number, saldo: number) => sum + saldo, 0);
    const clientesConSaldo = Array.from(saldosPorCliente.values()).filter(saldo => saldo > 0).length;
    const promedioSaldoPorCliente = clientesConSaldo > 0 ? saldoTotal / clientesConSaldo : 0;

    return {
      totalClientes,
      totalMovimientos: movimientos.length,
      saldoTotal,
      montoTotalFacturas,
      montoTotalPagos,
      montoTotalAjustes,
      movimientosVencidos: movimientosVencidos.length,
      montoVencido,
      promedioSaldoPorCliente,
      clientesConSaldo,
    };
  }

  async actualizarEstadosVencidos(): Promise<void> {
    await this.prisma.cuentaCorriente.updateMany({
      where: {
        fechaVencimiento: {
          lt: new Date(),
        },
        estado: 'activo',
      },
      data: {
        estado: 'vencido',
      },
    });
  }

  async cancelarMovimiento(id: number, procesadoPor?: number): Promise<CuentaCorriente | null> {
    const updateData: any = { estado: 'cancelado' };
    if (procesadoPor !== undefined) {
      updateData.procesadoPor = procesadoPor;
    }

    return this.update(id, updateData);
  }

  async reactivarMovimiento(id: number, procesadoPor?: number): Promise<CuentaCorriente | null> {
    const updateData: any = { estado: 'activo' };
    if (procesadoPor !== undefined) {
      updateData.procesadoPor = procesadoPor;
    }

    return this.update(id, updateData);
  }

  private convertPrismaCuentaCorriente(prismaCuentaCorriente: any): CuentaCorriente {
    return {
      id: prismaCuentaCorriente.id,
      clienteId: prismaCuentaCorriente.clienteId,
      tipoMovimiento: prismaCuentaCorriente.tipoMovimiento,
      referencia: prismaCuentaCorriente.referencia,
      descripcion: prismaCuentaCorriente.descripcion,
      monto: Number(prismaCuentaCorriente.monto),
      saldoAnterior: Number(prismaCuentaCorriente.saldoAnterior),
      saldoNuevo: Number(prismaCuentaCorriente.saldoNuevo),
      fechaMovimiento: prismaCuentaCorriente.fechaMovimiento,
      fechaVencimiento: prismaCuentaCorriente.fechaVencimiento,
      facturaId: prismaCuentaCorriente.facturaId,
      pagoId: prismaCuentaCorriente.pagoId,
      ordenCompraId: prismaCuentaCorriente.ordenCompraId,
      observaciones: prismaCuentaCorriente.observaciones,
      estado: prismaCuentaCorriente.estado,
      procesadoPor: prismaCuentaCorriente.procesadoPor,
      creadoEn: prismaCuentaCorriente.creadoEn,
    };
  }
} 