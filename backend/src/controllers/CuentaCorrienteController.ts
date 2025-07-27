import { Request, Response } from 'express';
import { CuentaCorrienteService } from '@/services/CuentaCorrienteService';
import { CuentaCorrienteFilters } from '@/types';

export class CuentaCorrienteController {
  private cuentaCorrienteService: CuentaCorrienteService;

  constructor(cuentaCorrienteService: CuentaCorrienteService) {
    this.cuentaCorrienteService = cuentaCorrienteService;
  }

  // Métodos CRUD básicos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: CuentaCorrienteFilters = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string | undefined,
        sortOrder: req.query['sortOrder'] as 'asc' | 'desc' | undefined,
        clienteId: req.query['clienteId'] ? parseInt(req.query['clienteId'] as string) : undefined,
        tipoMovimiento: req.query['tipoMovimiento'] as 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros' | undefined,
        estado: req.query['estado'] as 'activo' | 'cancelado' | 'vencido' | undefined,
        procesadoPor: req.query['procesadoPor'] ? parseInt(req.query['procesadoPor'] as string) : undefined,
        facturaId: req.query['facturaId'] ? parseInt(req.query['facturaId'] as string) : undefined,
        pagoId: req.query['pagoId'] ? parseInt(req.query['pagoId'] as string) : undefined,
        ordenCompraId: req.query['ordenCompraId'] ? parseInt(req.query['ordenCompraId'] as string) : undefined,
        fechaMovimientoDesde: req.query['fechaMovimientoDesde'] as string | undefined,
        fechaMovimientoHasta: req.query['fechaMovimientoHasta'] as string | undefined,
        fechaVencimientoDesde: req.query['fechaVencimientoDesde'] as string | undefined,
        fechaVencimientoHasta: req.query['fechaVencimientoHasta'] as string | undefined,
        montoMin: req.query['montoMin'] ? parseFloat(req.query['montoMin'] as string) : undefined,
        montoMax: req.query['montoMax'] ? parseFloat(req.query['montoMax'] as string) : undefined,
        saldoMin: req.query['saldoMin'] ? parseFloat(req.query['saldoMin'] as string) : undefined,
        saldoMax: req.query['saldoMax'] ? parseFloat(req.query['saldoMax'] as string) : undefined,
        fechaDesde: req.query['fechaDesde'] as string | undefined,
        fechaHasta: req.query['fechaHasta'] as string | undefined,
      };

      const result = await this.cuentaCorrienteService.getAll(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
        });
        return;
      }

      const cuentaCorriente = await this.cuentaCorrienteService.getById(id);
      if (!cuentaCorriente) {
        res.status(404).json({
          success: false,
          error: 'Movimiento de cuenta corriente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: cuentaCorriente,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const cuentaCorriente = await this.cuentaCorrienteService.create(req.body);
      res.status(201).json({
        success: true,
        data: cuentaCorriente,
        message: 'Movimiento de cuenta corriente creado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
        });
        return;
      }

      const cuentaCorriente = await this.cuentaCorrienteService.update(id, req.body);
      if (!cuentaCorriente) {
        res.status(404).json({
          success: false,
          error: 'Movimiento de cuenta corriente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: cuentaCorriente,
        message: 'Movimiento de cuenta corriente actualizado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
        });
        return;
      }

      const eliminado = await this.cuentaCorrienteService.delete(id);
      if (!eliminado) {
        res.status(404).json({
          success: false,
          error: 'Movimiento de cuenta corriente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Movimiento de cuenta corriente eliminado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  // Métodos específicos para Cuenta Corriente
  async findByCliente(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      if (isNaN(clienteId) || clienteId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de cliente inválido',
        });
        return;
      }

      const movimientos = await this.cuentaCorrienteService.findByCliente(clienteId);
      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByTipoMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const tipoMovimiento = req.params['tipoMovimiento'] as 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros';
      if (!tipoMovimiento || !['factura', 'pago', 'ajuste', 'nota_credito', 'nota_debito', 'otros'].includes(tipoMovimiento)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de movimiento inválido',
        });
        return;
      }

      const movimientos = await this.cuentaCorrienteService.findByTipoMovimiento(tipoMovimiento);
      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params['estado'] as 'activo' | 'cancelado' | 'vencido';
      if (!estado || !['activo', 'cancelado', 'vencido'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
        return;
      }

      const movimientos = await this.cuentaCorrienteService.findByEstado(estado);
      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getSaldoCliente(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      if (isNaN(clienteId) || clienteId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de cliente inválido',
        });
        return;
      }

      const saldo = await this.cuentaCorrienteService.getSaldoCliente(clienteId);
      res.json({
        success: true,
        data: { clienteId, saldo },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getMovimientosVencidos(_req: Request, res: Response): Promise<void> {
    try {
      const movimientos = await this.cuentaCorrienteService.getMovimientosVencidos();
      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getMovimientosPorPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      if (isNaN(clienteId) || clienteId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de cliente inválido',
        });
        return;
      }

      const fechaInicio = new Date(req.query['fechaInicio'] as string);
      const fechaFin = new Date(req.query['fechaFin'] as string);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Fechas inválidas',
        });
        return;
      }

      const movimientos = await this.cuentaCorrienteService.getMovimientosPorPeriodo(clienteId, fechaInicio, fechaFin);
      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getEstadisticasPorCliente(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      if (isNaN(clienteId) || clienteId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de cliente inválido',
        });
        return;
      }

      const estadisticas = await this.cuentaCorrienteService.getEstadisticasPorCliente(clienteId);
      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getEstadisticasGenerales(req: Request, res: Response): Promise<void> {
    try {
      const fechaInicio = req.query['fechaInicio'] ? new Date(req.query['fechaInicio'] as string) : undefined;
      const fechaFin = req.query['fechaFin'] ? new Date(req.query['fechaFin'] as string) : undefined;

      if ((fechaInicio && isNaN(fechaInicio.getTime())) || (fechaFin && isNaN(fechaFin.getTime()))) {
        res.status(400).json({
          success: false,
          error: 'Fechas inválidas',
        });
        return;
      }

      const estadisticas = await this.cuentaCorrienteService.getEstadisticasGenerales(fechaInicio, fechaFin);
      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async actualizarEstadosVencidos(_req: Request, res: Response): Promise<void> {
    try {
      await this.cuentaCorrienteService.actualizarEstadosVencidos();
      res.json({
        success: true,
        message: 'Estados vencidos actualizados exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async cancelarMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
        });
        return;
      }

      const procesadoPor = req.body.procesadoPor ? parseInt(req.body.procesadoPor) : undefined;
      const movimiento = await this.cuentaCorrienteService.cancelarMovimiento(id, procesadoPor);
      
      if (!movimiento) {
        res.status(404).json({
          success: false,
          error: 'Movimiento de cuenta corriente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: movimiento,
        message: 'Movimiento cancelado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async reactivarMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
        });
        return;
      }

      const procesadoPor = req.body.procesadoPor ? parseInt(req.body.procesadoPor) : undefined;
      const movimiento = await this.cuentaCorrienteService.reactivarMovimiento(id, procesadoPor);
      
      if (!movimiento) {
        res.status(404).json({
          success: false,
          error: 'Movimiento de cuenta corriente no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: movimiento,
        message: 'Movimiento reactivado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  // Métodos de negocio específicos
  async crearMovimientoAutomatico(req: Request, res: Response): Promise<void> {
    try {
      const movimiento = await this.cuentaCorrienteService.crearMovimientoAutomatico(req.body);
      res.status(201).json({
        success: true,
        data: movimiento,
        message: 'Movimiento automático creado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async generarEstadoCuenta(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      if (isNaN(clienteId) || clienteId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de cliente inválido',
        });
        return;
      }

      const fechaInicio = new Date(req.query['fechaInicio'] as string);
      const fechaFin = new Date(req.query['fechaFin'] as string);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Fechas inválidas',
        });
        return;
      }

      const estadoCuenta = await this.cuentaCorrienteService.generarEstadoCuenta(clienteId, fechaInicio, fechaFin);
      res.json({
        success: true,
        data: estadoCuenta,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async obtenerAlertasCobranza(_req: Request, res: Response): Promise<void> {
    try {
      const alertas = await this.cuentaCorrienteService.obtenerAlertasCobranza();
      res.json({
        success: true,
        data: alertas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }
} 