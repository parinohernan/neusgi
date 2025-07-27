import { Request, Response } from 'express';
import { UsuarioService } from '@/services/UsuarioService';
import { CreateUsuarioDto, UpdateUsuarioDto, ApiResponse, PaginationQuery } from '@/types';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor(usuarioService: UsuarioService) {
    this.usuarioService = usuarioService;
  }

  // GET /usuarios
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const filters: PaginationQuery = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      const usuarios = await this.usuarioService.getAll(filters);
      
      const response: ApiResponse<typeof usuarios> = {
        success: true,
        data: usuarios,
        message: 'Usuarios obtenidos exitosamente',
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

  // GET /usuarios/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de usuario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const usuario = await this.usuarioService.getById(id);
      
      if (!usuario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof usuario> = {
        success: true,
        data: usuario,
        message: 'Usuario obtenido exitosamente',
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

  // POST /usuarios
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreateUsuarioDto = req.body;
      
      const usuario = await this.usuarioService.create(createData);
      
      const response: ApiResponse<typeof usuario> = {
        success: true,
        data: usuario,
        message: 'Usuario creado exitosamente',
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

  // PUT /usuarios/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de usuario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdateUsuarioDto = req.body;
      
      const usuario = await this.usuarioService.update(id, updateData);
      
      if (!usuario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof usuario> = {
        success: true,
        data: usuario,
        message: 'Usuario actualizado exitosamente',
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

  // DELETE /usuarios/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de usuario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.usuarioService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Usuario eliminado exitosamente',
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

  // POST /usuarios/:id/change-password
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de usuario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Contraseña actual y nueva contraseña son requeridas',
        };
        res.status(400).json(response);
        return;
      }

      await this.usuarioService.changePassword(id, currentPassword, newPassword);
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Contraseña cambiada exitosamente',
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