import { Request, Response } from 'express';
import { ParteDiarioService } from '@/services/ParteDiarioService';

export class ParteDiarioController {
  private parteDiarioService: ParteDiarioService;

  constructor(parteDiarioService: ParteDiarioService) {
    this.parteDiarioService = parteDiarioService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, ordenCompraId, fechaDesde, fechaHasta } = req.query;
      
      const filters = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        ordenCompraId: ordenCompraId ? parseInt(ordenCompraId as string) : undefined,
        fechaDesde: fechaDesde as string,
        fechaHasta: fechaHasta as string,
      };

      const result = await this.parteDiarioService.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo partes diario:', error);
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
      const parteDiario = await this.parteDiarioService.getById(id);
      
      if (!parteDiario) {
        res.status(404).json({ 
          success: false, 
          message: 'Parte diario no encontrado' 
        });
        return;
      }

      res.json({ success: true, data: parteDiario });
    } catch (error) {
      console.error('Error obteniendo parte diario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const parteDiario = await this.parteDiarioService.create(req.body);
      res.status(201).json({ 
        success: true, 
        data: parteDiario,
        message: 'Parte diario creado exitosamente'
      });
    } catch (error) {
      console.error('Error creando parte diario:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Error al crear el parte diario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const parteDiario = await this.parteDiarioService.update(id, req.body);
      
      if (!parteDiario) {
        res.status(404).json({ 
          success: false, 
          message: 'Parte diario no encontrado' 
        });
        return;
      }

      res.json({ 
        success: true, 
        data: parteDiario,
        message: 'Parte diario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando parte diario:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Error al actualizar el parte diario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const success = await this.parteDiarioService.delete(id);
      
      if (!success) {
        res.status(404).json({ 
          success: false, 
          message: 'Parte diario no encontrado' 
        });
        return;
      }

      res.json({ 
        success: true, 
        message: 'Parte diario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando parte diario:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async findByOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      
      if (!ordenCompraId || isNaN(ordenCompraId)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID de orden de compra inválido' 
        });
        return;
      }

      const partesDiario = await this.parteDiarioService.findByOrdenCompra(ordenCompraId);
      
      res.json({ 
        success: true, 
        data: partesDiario 
      });
    } catch (error) {
      console.error('Error finding partes diario by orden compra:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al buscar partes diario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 