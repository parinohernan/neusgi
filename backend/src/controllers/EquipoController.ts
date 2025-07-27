import { Request, Response } from 'express';
import { EquipoService } from '@/services/EquipoService';
import { CreateEquipoDto, UpdateEquipoDto, ApiResponse, EquipoFilters } from '@/types';

export class EquipoController {
  private equipoService: EquipoService;

  constructor(equipoService: EquipoService) {
    this.equipoService = equipoService;
  }

  // GET /equipos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, estado, modelo } = req.query;
      const filters: EquipoFilters = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      if (estado) filters.estado = estado as 'disponible' | 'mantenimiento' | 'ocupado';
      if (modelo) filters.modelo = modelo as string;

      const equipos = await this.equipoService.getAll(filters);
      
      const response: ApiResponse<typeof equipos> = {
        success: true,
        data: equipos,
        message: 'Equipos obtenidos exitosamente',
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

  // GET /equipos/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const equipo = await this.equipoService.getById(id);
      
      if (!equipo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipo no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof equipo> = {
        success: true,
        data: equipo,
        message: 'Equipo obtenido exitosamente',
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

  // POST /equipos
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreateEquipoDto = req.body;
      
      const equipo = await this.equipoService.create(createData);
      
      const response: ApiResponse<typeof equipo> = {
        success: true,
        data: equipo,
        message: 'Equipo creado exitosamente',
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

  // PUT /equipos/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdateEquipoDto = req.body;
      
      const equipo = await this.equipoService.update(id, updateData);
      
      if (!equipo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipo no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof equipo> = {
        success: true,
        data: equipo,
        message: 'Equipo actualizado exitosamente',
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

  // DELETE /equipos/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.equipoService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipo no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Equipo eliminado exitosamente',
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

  // GET /equipos/disponibles
  async getDisponibles(_req: Request, res: Response): Promise<void> {
    try {
      const equipos = await this.equipoService.findDisponibles();
      
      const response: ApiResponse<typeof equipos> = {
        success: true,
        data: equipos,
        message: 'Equipos disponibles obtenidos exitosamente',
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

  // PUT /equipos/:id/estado
  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { estado } = req.body;
      
      if (!estado || !['disponible', 'mantenimiento', 'ocupado'].includes(estado)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Estado inválido. Debe ser: disponible, mantenimiento u ocupado',
        };
        res.status(400).json(response);
        return;
      }

      const equipo = await this.equipoService.cambiarEstado(id, estado);
      
      if (!equipo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipo no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof equipo> = {
        success: true,
        data: equipo,
        message: 'Estado del equipo actualizado exitosamente',
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

  // POST /equipos/:id/mantenimiento
  async registrarMantenimiento(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de equipo inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { fechaMantenimiento } = req.body;
      
      if (!fechaMantenimiento) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fecha de mantenimiento requerida',
        };
        res.status(400).json(response);
        return;
      }

      const equipo = await this.equipoService.registrarMantenimiento(id, new Date(fechaMantenimiento));
      
      if (!equipo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Equipo no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof equipo> = {
        success: true,
        data: equipo,
        message: 'Mantenimiento registrado exitosamente',
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

  // GET /equipos/estadisticas
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.equipoService.getEstadisticas();
      
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
} 