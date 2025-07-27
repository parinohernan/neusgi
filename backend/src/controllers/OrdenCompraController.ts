import { Request, Response } from 'express';
import { OrdenCompraService } from '@/services/OrdenCompraService';
import { CreateOrdenCompraDto, UpdateOrdenCompraDto, ApiResponse, OrdenCompraFilters } from '@/types';

export class OrdenCompraController {
  private ordenCompraService: OrdenCompraService;

  constructor(ordenCompraService: OrdenCompraService) {
    this.ordenCompraService = ordenCompraService;
  }

  // GET /ordenes-compra
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, estado, presupuestoId, clienteId, equipoId, fechaInicioDesde, fechaInicioHasta, fechaFinDesde, fechaFinHasta } = req.query;
      const filters: OrdenCompraFilters = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      if (estado) filters.estado = estado as 'activa' | 'completada' | 'cancelada';
      if (presupuestoId) filters.presupuestoId = parseInt(presupuestoId as string);
      if (clienteId) filters.clienteId = parseInt(clienteId as string);
      if (equipoId) filters.equipoId = parseInt(equipoId as string);
      if (fechaInicioDesde) filters.fechaInicioDesde = fechaInicioDesde as string;
      if (fechaInicioHasta) filters.fechaInicioHasta = fechaInicioHasta as string;
      if (fechaFinDesde) filters.fechaFinDesde = fechaFinDesde as string;
      if (fechaFinHasta) filters.fechaFinHasta = fechaFinHasta as string;

      const ordenesCompra = await this.ordenCompraService.getAll(filters);
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenCompra = await this.ordenCompraService.getById(id);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra obtenida exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // POST /ordenes-compra
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreateOrdenCompraDto = req.body;
      
      const ordenCompra = await this.ordenCompraService.create(createData);
      
      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra creada exitosamente',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // PUT /ordenes-compra/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdateOrdenCompraDto = req.body;
      
      const ordenCompra = await this.ordenCompraService.update(id, updateData);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra actualizada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // DELETE /ordenes-compra/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.ordenCompraService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Orden de compra eliminada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/presupuesto/:presupuestoId
  async findByPresupuesto(req: Request, res: Response): Promise<void> {
    try {
      const presupuestoId = parseInt(req.params['presupuestoId'] || '0');
      
      if (isNaN(presupuestoId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenesCompra = await this.ordenCompraService.findByPresupuesto(presupuestoId);
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra del presupuesto obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/equipo/:equipoId
  async findByEquipo(req: Request, res: Response): Promise<void> {
    try {
      const equipoId = parseInt(req.params['equipoId'] || '0');
      
      if (isNaN(equipoId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenesCompra = await this.ordenCompraService.findByEquipo(equipoId);
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra del equipo obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/cliente/:clienteId
  async findByCliente(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = parseInt(req.params['clienteId'] || '0');
      
      if (isNaN(clienteId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de cliente inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenesCompra = await this.ordenCompraService.findByCliente(clienteId);
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra del cliente obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/estado/:estado
  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const { estado } = req.params;
      
      if (!estado || !['activa', 'completada', 'cancelada'].includes(estado)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Estado inválido. Debe ser: activa, completada o cancelada',
        };
        res.status(400).json(response);
        return;
      }

      const ordenesCompra = await this.ordenCompraService.findByEstado(estado as 'activa' | 'completada' | 'cancelada');
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // PUT /ordenes-compra/:id/estado
  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { estado } = req.body;
      
      if (!estado || !['activa', 'completada', 'cancelada'].includes(estado)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Estado inválido. Debe ser: activa, completada o cancelada',
        };
        res.status(400).json(response);
        return;
      }

      const ordenCompra = await this.ordenCompraService.cambiarEstado(id, estado);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Estado de la orden de compra actualizado exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // GET /ordenes-compra/activas/lista
  async getOrdenesActivas(_req: Request, res: Response): Promise<void> {
    try {
      const ordenesCompra = await this.ordenCompraService.getOrdenesActivas();
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra activas obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/completadas/lista
  async getOrdenesCompletadas(_req: Request, res: Response): Promise<void> {
    try {
      const ordenesCompra = await this.ordenCompraService.getOrdenesCompletadas();
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra completadas obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/en-curso/lista
  async getOrdenesEnCurso(_req: Request, res: Response): Promise<void> {
    try {
      const ordenesCompra = await this.ordenCompraService.getOrdenesEnCurso();
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra en curso obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/vencidas/lista
  async getOrdenesVencidas(_req: Request, res: Response): Promise<void> {
    try {
      const ordenesCompra = await this.ordenCompraService.getOrdenesVencidas();
      
      const response: ApiResponse<typeof ordenesCompra> = {
        success: true,
        data: ordenesCompra,
        message: 'Órdenes de compra vencidas obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // GET /ordenes-compra/estadisticas
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.ordenCompraService.getEstadisticas();
      
      const response: ApiResponse<typeof estadisticas> = {
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  // PUT /ordenes-compra/:id/completar
  async completarOrden(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenCompra = await this.ordenCompraService.completarOrden(id);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra completada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // PUT /ordenes-compra/:id/cancelar
  async cancelarOrden(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenCompra = await this.ordenCompraService.cancelarOrden(id);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra cancelada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // PUT /ordenes-compra/:id/reactivar
  async reactivarOrden(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const ordenCompra = await this.ordenCompraService.reactivarOrden(id);
      
      if (!ordenCompra) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Orden de compra no encontrada',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ordenCompra> = {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra reactivada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }
} 