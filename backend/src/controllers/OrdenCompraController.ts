import { Request, Response } from 'express';
import { OrdenCompraService } from '@/services/OrdenCompraService';

export class OrdenCompraController {
  private ordenCompraService: OrdenCompraService;

  constructor(ordenCompraService: OrdenCompraService) {
    this.ordenCompraService = ordenCompraService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, estado, presupuestoId, fechaInicioDesde, fechaInicioHasta } = req.query;
      
      const filters = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        estado: estado as string,
        presupuestoId: presupuestoId ? parseInt(presupuestoId as string) : undefined,
        fechaInicioDesde: fechaInicioDesde as string,
        fechaInicioHasta: fechaInicioHasta as string,
      };

      const result = await this.ordenCompraService.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo órdenes de compra:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const ordenCompra = await this.ordenCompraService.getById(id);
      
      if (!ordenCompra) {
        res.status(404).json({ 
          success: false, 
          message: 'Orden de compra no encontrada' 
        });
        return;
      }

      res.json({ success: true, data: ordenCompra });
    } catch (error) {
      console.error('Error obteniendo orden de compra:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompra = await this.ordenCompraService.create(req.body);
      res.status(201).json({ 
        success: true, 
        data: ordenCompra,
        message: 'Orden de compra creada exitosamente'
      });
    } catch (error) {
      console.error('Error creando orden de compra:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Error al crear la orden de compra',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const ordenCompra = await this.ordenCompraService.update(id, req.body);
      
      if (!ordenCompra) {
        res.status(404).json({ 
          success: false, 
          message: 'Orden de compra no encontrada' 
        });
        return;
      }

      res.json({ 
        success: true, 
        data: ordenCompra,
        message: 'Orden de compra actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando orden de compra:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Error al actualizar la orden de compra',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const success = await this.ordenCompraService.delete(id);
      
      if (!success) {
        res.status(404).json({ 
          success: false, 
          message: 'Orden de compra no encontrada' 
        });
        return;
      }

      res.json({ 
        success: true, 
        message: 'Orden de compra eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando orden de compra:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async findByPresupuesto(req: Request, res: Response): Promise<void> {
    try {
      const presupuestoId = parseInt(req.params['presupuestoId'] || '0');
      const ordenesCompra = await this.ordenCompraService.findByPresupuesto(presupuestoId);
      res.json({ success: true, data: ordenesCompra });
    } catch (error) {
      console.error('Error obteniendo órdenes de compra por presupuesto:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params['estado'] as 'activa' | 'completada' | 'cancelada';
      const ordenesCompra = await this.ordenCompraService.findByEstado(estado);
      res.json({ success: true, data: ordenesCompra });
    } catch (error) {
      console.error('Error obteniendo órdenes de compra por estado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { estado } = req.body;
      
      const ordenCompra = await this.ordenCompraService.cambiarEstado(id, estado);
      
      if (!ordenCompra) {
        res.status(404).json({ 
          success: false, 
          message: 'Orden de compra no encontrada' 
        });
        return;
      }

      res.json({ 
        success: true, 
        data: ordenCompra,
        message: 'Estado de orden de compra cambiado exitosamente'
      });
    } catch (error) {
      console.error('Error cambiando estado de orden de compra:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Error al cambiar el estado de la orden de compra',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 