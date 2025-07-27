import { Request, Response } from 'express';
import { RemitoService } from '@/services/RemitoService';
import { RemitoFilters } from '@/types';

export class RemitoController {
  private remitoService: RemitoService;

  constructor(remitoService: RemitoService) {
    this.remitoService = remitoService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: RemitoFilters = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string,
        sortOrder: req.query['sortOrder'] as 'asc' | 'desc',
        ordenCompraId: req.query['ordenCompraId'] ? parseInt(req.query['ordenCompraId'] as string) : undefined,
        presupuestoId: req.query['presupuestoId'] ? parseInt(req.query['presupuestoId'] as string) : undefined,
        clienteId: req.query['clienteId'] ? parseInt(req.query['clienteId'] as string) : undefined,
        equipoId: req.query['equipoId'] ? parseInt(req.query['equipoId'] as string) : undefined,
        codigo: req.query['codigo'] as string,
        estado: req.query['estado'] as 'pendiente' | 'entregado' | 'cancelado',
        fechaDesde: req.query['fechaDesde'] as string,
        fechaHasta: req.query['fechaHasta'] as string,
      };

      const remitos = await this.remitoService.getAll(filters);
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const remito = await this.remitoService.getById(id);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito obtenido exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remito',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const remito = await this.remitoService.create(req.body);
      
      res.status(201).json({
        success: true,
        data: remito,
        message: 'Remito creado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al crear remito',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const remito = await this.remitoService.update(id, req.body);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito actualizado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al actualizar remito',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const deleted = await this.remitoService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Remito eliminado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al eliminar remito',
      });
    }
  }

  // Métodos específicos para remitos
  async findByOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const remitos = await this.remitoService.findByOrdenCompra(ordenCompraId);
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos por orden de compra',
      });
    }
  }

  async findByCodigo(req: Request, res: Response): Promise<void> {
    try {
      const codigo = req.params['codigo'];
      if (!codigo) {
        res.status(400).json({
          success: false,
          error: 'Código requerido',
          message: 'El código del remito es requerido',
        });
        return;
      }
      
      const remito = await this.remitoService.findByCodigo(codigo);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito obtenido exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remito por código',
      });
    }
  }

  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params['estado'] as 'pendiente' | 'entregado' | 'cancelado';
      const remitos = await this.remitoService.findByEstado(estado);
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos por estado',
      });
    }
  }

  async getRemitosPendientes(_req: Request, res: Response): Promise<void> {
    try {
      const remitos = await this.remitoService.getRemitosPendientes();
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos pendientes obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos pendientes',
      });
    }
  }

  async getRemitosEntregados(_req: Request, res: Response): Promise<void> {
    try {
      const remitos = await this.remitoService.getRemitosEntregados();
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos entregados obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos entregados',
      });
    }
  }

  async getRemitosCancelados(_req: Request, res: Response): Promise<void> {
    try {
      const remitos = await this.remitoService.getRemitosCancelados();
      
      res.status(200).json({
        success: true,
        data: remitos,
        message: 'Remitos cancelados obtenidos exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener remitos cancelados',
      });
    }
  }

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { estado } = req.body;
      const remito = await this.remitoService.cambiarEstado(id, estado);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Estado del remito cambiado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al cambiar estado del remito',
      });
    }
  }

  async marcarComoEntregado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const remito = await this.remitoService.marcarComoEntregado(id);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito marcado como entregado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al marcar remito como entregado',
      });
    }
  }

  async cancelarRemito(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const remito = await this.remitoService.cancelarRemito(id);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito cancelado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al cancelar remito',
      });
    }
  }

  async reactivarRemito(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const remito = await this.remitoService.reactivarRemito(id);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Remito reactivado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al reactivar remito',
      });
    }
  }

  async getEstadisticasPorOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const estadisticas = await this.remitoService.getEstadisticasPorOrdenCompra(ordenCompraId);
      
      res.status(200).json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener estadísticas por orden de compra',
      });
    }
  }

  async getEstadisticasGenerales(req: Request, res: Response): Promise<void> {
    try {
      const fechaInicio = req.query['fechaInicio'] ? new Date(req.query['fechaInicio'] as string) : undefined;
      const fechaFin = req.query['fechaFin'] ? new Date(req.query['fechaFin'] as string) : undefined;
      
      const estadisticas = await this.remitoService.getEstadisticasGenerales(fechaInicio, fechaFin);
      
      res.status(200).json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas generales obtenidas exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al obtener estadísticas generales',
      });
    }
  }

  async generarCodigoRemito(_req: Request, res: Response): Promise<void> {
    try {
      const codigo = await this.remitoService.generarCodigoRemito();
      
      res.status(200).json({
        success: true,
        data: { codigo },
        message: 'Código de remito generado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al generar código de remito',
      });
    }
  }

  async agregarArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;
      const remito = await this.remitoService.agregarArchivoAdjunto(id, urlArchivo);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Archivo adjunto agregado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al agregar archivo adjunto',
      });
    }
  }

  async removerArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;
      const remito = await this.remitoService.removerArchivoAdjunto(id, urlArchivo);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Archivo adjunto removido exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al remover archivo adjunto',
      });
    }
  }

  async actualizarPdfPath(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { pdfPath } = req.body;
      const remito = await this.remitoService.actualizarPdfPath(id, pdfPath);

      if (!remito) {
        res.status(404).json({
          success: false,
          error: 'Remito no encontrado',
          message: 'El remito especificado no existe',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: remito,
        message: 'Ruta del PDF actualizada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        message: 'Error al actualizar ruta del PDF',
      });
    }
  }
} 