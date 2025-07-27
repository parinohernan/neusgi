import { Request, Response } from 'express';
import { FacturaService } from '@/services/FacturaService';
import { FacturaFilters } from '@/types';

export class FacturaController {
  private facturaService: FacturaService;

  constructor(facturaService: FacturaService) {
    this.facturaService = facturaService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: FacturaFilters = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string || undefined,
        sortOrder: (req.query['sortOrder'] as 'asc' | 'desc') || undefined,
        ordenCompraId: req.query['ordenCompraId'] ? parseInt(req.query['ordenCompraId'] as string) : undefined,
        presupuestoId: req.query['presupuestoId'] ? parseInt(req.query['presupuestoId'] as string) : undefined,
        clienteId: req.query['clienteId'] ? parseInt(req.query['clienteId'] as string) : undefined,
        equipoId: req.query['equipoId'] ? parseInt(req.query['equipoId'] as string) : undefined,
        numeroFactura: req.query['numeroFactura'] as string || undefined,
        estado: req.query['estado'] as 'pendiente' | 'pagada' | 'cancelada' || undefined,
        fechaEmisionDesde: req.query['fechaEmisionDesde'] as string || undefined,
        fechaEmisionHasta: req.query['fechaEmisionHasta'] as string || undefined,
        fechaVencimientoDesde: req.query['fechaVencimientoDesde'] as string || undefined,
        fechaVencimientoHasta: req.query['fechaVencimientoHasta'] as string || undefined,
        montoMin: req.query['montoMin'] ? parseFloat(req.query['montoMin'] as string) : undefined,
        montoMax: req.query['montoMax'] ? parseFloat(req.query['montoMax'] as string) : undefined,
        fechaDesde: req.query['fechaDesde'] as string || undefined,
        fechaHasta: req.query['fechaHasta'] as string || undefined,
      };

      const result = await this.facturaService.getAll(filters);
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
      const factura = await this.facturaService.getById(id);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
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
      const factura = await this.facturaService.create(req.body);
      res.status(201).json({
        success: true,
        data: factura,
        message: 'Factura creada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la factura',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const factura = await this.facturaService.update(id, req.body);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Factura actualizada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar la factura',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const deleted = await this.facturaService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Factura eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar la factura',
      });
    }
  }

  // Métodos específicos
  async findByOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const facturas = await this.facturaService.findByOrdenCompra(ordenCompraId);

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByNumeroFactura(req: Request, res: Response): Promise<void> {
    try {
      const numeroFactura = req.params['numeroFactura'];
      if (!numeroFactura) {
        res.status(400).json({
          success: false,
          error: 'Número de factura requerido',
        });
        return;
      }

      const factura = await this.facturaService.findByNumeroFactura(numeroFactura);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
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
      const estado = req.params['estado'] as 'pendiente' | 'pagada' | 'cancelada';
      const facturas = await this.facturaService.findByEstado(estado);

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getFacturasPendientes(_req: Request, res: Response): Promise<void> {
    try {
      const facturas = await this.facturaService.getFacturasPendientes();

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getFacturasPagadas(_req: Request, res: Response): Promise<void> {
    try {
      const facturas = await this.facturaService.getFacturasPagadas();

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getFacturasCanceladas(_req: Request, res: Response): Promise<void> {
    try {
      const facturas = await this.facturaService.getFacturasCanceladas();

      res.json({
        success: true,
        data: facturas,
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
      const { estado } = req.body;

      if (!estado || !['pendiente', 'pagada', 'cancelada'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
        return;
      }

      const factura = await this.facturaService.cambiarEstado(id, estado);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: `Factura marcada como ${estado}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar el estado',
      });
    }
  }

  async marcarComoPagada(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { montoPagado } = req.body;

      const factura = await this.facturaService.marcarComoPagada(id, montoPagado);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Factura marcada como pagada',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar como pagada',
      });
    }
  }

  async cancelarFactura(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const factura = await this.facturaService.cancelarFactura(id);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Factura cancelada',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar la factura',
      });
    }
  }

  async reactivarFactura(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const factura = await this.facturaService.reactivarFactura(id);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Factura reactivada',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al reactivar la factura',
      });
    }
  }

  async getFacturasPorVencer(req: Request, res: Response): Promise<void> {
    try {
      const dias = req.query['dias'] ? parseInt(req.query['dias'] as string) : 30;
      const facturas = await this.facturaService.getFacturasPorVencer(dias);

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getFacturasVencidas(_req: Request, res: Response): Promise<void> {
    try {
      const facturas = await this.facturaService.getFacturasVencidas();

      res.json({
        success: true,
        data: facturas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getEstadisticasPorOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const estadisticas = await this.facturaService.getEstadisticasPorOrdenCompra(ordenCompraId);

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
      
      const estadisticas = await this.facturaService.getEstadisticasGenerales(fechaInicio, fechaFin);

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

  async generarNumeroFactura(_req: Request, res: Response): Promise<void> {
    try {
      const numeroFactura = await this.facturaService.generarNumeroFactura();

      res.json({
        success: true,
        data: { numeroFactura },
        message: 'Número de factura generado',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar número de factura',
      });
    }
  }

  async registrarPago(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { montoPagado } = req.body;

      if (!montoPagado || montoPagado <= 0) {
        res.status(400).json({
          success: false,
          error: 'El monto del pago debe ser mayor a 0',
        });
        return;
      }

      const factura = await this.facturaService.registrarPago(id, montoPagado);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Pago registrado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al registrar el pago',
      });
    }
  }

  async agregarArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const factura = await this.facturaService.agregarArchivoAdjunto(id, urlArchivo);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Archivo adjunto agregado',
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

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const factura = await this.facturaService.removerArchivoAdjunto(id, urlArchivo);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Archivo adjunto removido',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al remover archivo adjunto',
      });
    }
  }

  async actualizarPdfPath(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { pdfPath } = req.body;

      if (!pdfPath) {
        res.status(400).json({
          success: false,
          error: 'Ruta del PDF es requerida',
        });
        return;
      }

      const factura = await this.facturaService.actualizarPdfPath(id, pdfPath);

      if (!factura) {
        res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: factura,
        message: 'Ruta del PDF actualizada',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar ruta del PDF',
      });
    }
  }

  async calcularSaldoPendiente(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const resultado = await this.facturaService.calcularSaldoPendiente(id);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular saldo pendiente',
      });
    }
  }
} 