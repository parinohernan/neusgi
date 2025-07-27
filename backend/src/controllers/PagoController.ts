import { Request, Response } from 'express';
import { PagoService } from '@/services/PagoService';
import { PagoFilters } from '@/types';

export class PagoController {
  private pagoService: PagoService;

  constructor(pagoService: PagoService) {
    this.pagoService = pagoService;
  }

  // Métodos CRUD básicos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: PagoFilters = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string || undefined,
        sortOrder: req.query['sortOrder'] as 'asc' | 'desc' || undefined,
        facturaId: req.query['facturaId'] ? parseInt(req.query['facturaId'] as string) : undefined,
        ordenCompraId: req.query['ordenCompraId'] ? parseInt(req.query['ordenCompraId'] as string) : undefined,
        presupuestoId: req.query['presupuestoId'] ? parseInt(req.query['presupuestoId'] as string) : undefined,
        clienteId: req.query['clienteId'] ? parseInt(req.query['clienteId'] as string) : undefined,
        metodoPago: req.query['metodoPago'] as 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros' || undefined,
        estado: req.query['estado'] as 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado' || undefined,
        procesadoPor: req.query['procesadoPor'] ? parseInt(req.query['procesadoPor'] as string) : undefined,
        fechaPagoDesde: req.query['fechaPagoDesde'] as string || undefined,
        fechaPagoHasta: req.query['fechaPagoHasta'] as string || undefined,
        montoMin: req.query['montoMin'] ? parseFloat(req.query['montoMin'] as string) : undefined,
        montoMax: req.query['montoMax'] ? parseFloat(req.query['montoMax'] as string) : undefined,
        fechaDesde: req.query['fechaDesde'] as string || undefined,
        fechaHasta: req.query['fechaHasta'] as string || undefined,
      };

      const pagos = await this.pagoService.getAll(filters);

      res.json({
        success: true,
        data: pagos,
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
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.getById(id);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
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
      const pago = await this.pagoService.create(req.body);

      res.status(201).json({
        success: true,
        data: pago,
        message: 'Pago creado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el pago',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.update(id, req.body);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Pago actualizado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar el pago',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const eliminado = await this.pagoService.delete(id);

      if (!eliminado) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Pago eliminado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar el pago',
      });
    }
  }

  // Métodos específicos
  async findByFactura(req: Request, res: Response): Promise<void> {
    try {
      const facturaId = parseInt(req.params['facturaId'] || '0');

      if (isNaN(facturaId) || facturaId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de factura inválido',
        });
        return;
      }

      const pagos = await this.pagoService.findByFactura(facturaId);

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByMetodoPago(req: Request, res: Response): Promise<void> {
    try {
      const metodoPago = req.params['metodoPago'] as 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros';

      if (!['efectivo', 'transferencia', 'cheque', 'tarjeta_credito', 'tarjeta_debito', 'otros'].includes(metodoPago)) {
        res.status(400).json({
          success: false,
          error: 'Método de pago inválido',
        });
        return;
      }

      const pagos = await this.pagoService.findByMetodoPago(metodoPago);

      res.json({
        success: true,
        data: pagos,
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
      const estado = req.params['estado'] as 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado';

      if (!['pendiente', 'confirmado', 'rechazado', 'cancelado'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
        return;
      }

      const pagos = await this.pagoService.findByEstado(estado);

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getPagosPendientes(_req: Request, res: Response): Promise<void> {
    try {
      const pagos = await this.pagoService.getPagosPendientes();

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getPagosConfirmados(_req: Request, res: Response): Promise<void> {
    try {
      const pagos = await this.pagoService.getPagosConfirmados();

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getPagosRechazados(_req: Request, res: Response): Promise<void> {
    try {
      const pagos = await this.pagoService.getPagosRechazados();

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getPagosCancelados(_req: Request, res: Response): Promise<void> {
    try {
      const pagos = await this.pagoService.getPagosCancelados();

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { estado, procesadoPor } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      if (!estado || !['pendiente', 'confirmado', 'rechazado', 'cancelado'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
        return;
      }

      const pago = await this.pagoService.cambiarEstado(id, estado, procesadoPor);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: `Pago marcado como ${estado}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar el estado',
      });
    }
  }

  async confirmarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { procesadoPor } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.confirmarPago(id, procesadoPor);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Pago confirmado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al confirmar el pago',
      });
    }
  }

  async rechazarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { procesadoPor } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.rechazarPago(id, procesadoPor);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Pago rechazado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al rechazar el pago',
      });
    }
  }

  async cancelarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { procesadoPor } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.cancelarPago(id, procesadoPor);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Pago cancelado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar el pago',
      });
    }
  }

  async reactivarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      const pago = await this.pagoService.reactivarPago(id);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Pago reactivado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al reactivar el pago',
      });
    }
  }

  async getPagosPorPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const fechaInicio = req.query['fechaInicio'] ? new Date(req.query['fechaInicio'] as string) : undefined;
      const fechaFin = req.query['fechaFin'] ? new Date(req.query['fechaFin'] as string) : undefined;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          error: 'Las fechas de inicio y fin son requeridas',
        });
        return;
      }

      const pagos = await this.pagoService.getPagosPorPeriodo(fechaInicio, fechaFin);

      res.json({
        success: true,
        data: pagos,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener pagos por período',
      });
    }
  }

  async getEstadisticasPorFactura(req: Request, res: Response): Promise<void> {
    try {
      const facturaId = parseInt(req.params['facturaId'] || '0');

      if (isNaN(facturaId) || facturaId <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de factura inválido',
        });
        return;
      }

      const estadisticas = await this.pagoService.getEstadisticasPorFactura(facturaId);

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
      
      const estadisticas = await this.pagoService.getEstadisticasGenerales(fechaInicio, fechaFin);

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

  async actualizarComprobante(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { comprobante } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      if (!comprobante) {
        res.status(400).json({
          success: false,
          error: 'El comprobante es requerido',
        });
        return;
      }

      const pago = await this.pagoService.actualizarComprobante(id, comprobante);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Comprobante actualizado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar el comprobante',
      });
    }
  }

  async agregarArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const pago = await this.pagoService.agregarArchivoAdjunto(id, urlArchivo);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Archivo adjunto agregado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar archivo adjunto',
      });
    }
  }

  async removerArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          error: 'ID de pago inválido',
        });
        return;
      }

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const pago = await this.pagoService.removerArchivoAdjunto(id, urlArchivo);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
        message: 'Archivo adjunto removido exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al remover archivo adjunto',
      });
    }
  }
} 