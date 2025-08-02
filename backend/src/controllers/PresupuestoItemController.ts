import { Request, Response } from 'express';
import { PresupuestoItemService } from '@/services/PresupuestoItemService';
import { CreatePresupuestoItemDto, UpdatePresupuestoItemDto, ApiResponse } from '@/types';

export class PresupuestoItemController {
  private presupuestoItemService: PresupuestoItemService;

  constructor(presupuestoItemService: PresupuestoItemService) {
    this.presupuestoItemService = presupuestoItemService;
  }

  // GET /presupuesto-items
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const items = await this.presupuestoItemService.getAll();
      
      const response: ApiResponse<typeof items> = {
        success: true,
        data: items,
        message: 'Items de presupuesto obtenidos exitosamente',
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

  // GET /presupuesto-items/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de item inválido',
        };
        res.status(400).json(response);
        return;
      }

      const item = await this.presupuestoItemService.getById(id);
      
      if (!item) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Item de presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
        message: 'Item de presupuesto obtenido exitosamente',
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

  // GET /presupuesto-items/presupuesto/:presupuestoId
  async getByPresupuestoId(req: Request, res: Response): Promise<void> {
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

      const items = await this.presupuestoItemService.findByPresupuestoId(presupuestoId);
      
      const response: ApiResponse<typeof items> = {
        success: true,
        data: items,
        message: 'Items de presupuesto obtenidos exitosamente',
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

  // POST /presupuesto-items
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreatePresupuestoItemDto = req.body;
      
      const item = await this.presupuestoItemService.create(createData);
      
      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
        message: 'Item de presupuesto creado exitosamente',
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

  // PUT /presupuesto-items/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de item inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdatePresupuestoItemDto = req.body;
      
      const item = await this.presupuestoItemService.update(id, updateData);
      
      if (!item) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Item de presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof item> = {
        success: true,
        data: item,
        message: 'Item de presupuesto actualizado exitosamente',
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

  // DELETE /presupuesto-items/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de item inválido',
        };
        res.status(400).json(response);
        return;
      }

      const success = await this.presupuestoItemService.delete(id);
      
      if (!success) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Item de presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Item de presupuesto eliminado exitosamente',
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
} 