import { Request, Response } from 'express';
import { ClienteService } from '@/services/ClienteService';
import { CreateClienteDto, UpdateClienteDto, ApiResponse, PaginationQuery } from '@/types';

export class ClienteController {
  private clienteService: ClienteService;

  constructor(clienteService: ClienteService) {
    this.clienteService = clienteService;
  }

  // GET /clientes
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const filters: PaginationQuery = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      const clientes = await this.clienteService.getAll(filters);
      
      const response: ApiResponse<typeof clientes> = {
        success: true,
        data: clientes,
        message: 'Clientes obtenidos exitosamente',
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

  // GET /clientes/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de cliente inválido',
        };
        res.status(400).json(response);
        return;
      }

      const cliente = await this.clienteService.getById(id);
      
      if (!cliente) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cliente no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof cliente> = {
        success: true,
        data: cliente,
        message: 'Cliente obtenido exitosamente',
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

  // POST /clientes
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreateClienteDto = req.body;
      
      const cliente = await this.clienteService.create(createData);
      
      const response: ApiResponse<typeof cliente> = {
        success: true,
        data: cliente,
        message: 'Cliente creado exitosamente',
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

  // PUT /clientes/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de cliente inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdateClienteDto = req.body;
      
      const cliente = await this.clienteService.update(id, updateData);
      
      if (!cliente) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cliente no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof cliente> = {
        success: true,
        data: cliente,
        message: 'Cliente actualizado exitosamente',
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

  // DELETE /clientes/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de cliente inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.clienteService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cliente no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Cliente eliminado exitosamente',
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

  // GET /clientes/buscar/rut/:rutCuit
  async findByRutCuit(req: Request, res: Response): Promise<void> {
    try {
      const { rutCuit } = req.params;
      
      if (!rutCuit) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'RUT/CUIT es requerido',
        };
        res.status(400).json(response);
        return;
      }

      const cliente = await this.clienteService.findByRutCuit(rutCuit);
      
      if (!cliente) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cliente no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof cliente> = {
        success: true,
        data: cliente,
        message: 'Cliente encontrado exitosamente',
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

  // GET /clientes/buscar/email/:email
  async findByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      if (!email) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email es requerido',
        };
        res.status(400).json(response);
        return;
      }

      const cliente = await this.clienteService.findByEmail(email);
      
      if (!cliente) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cliente no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof cliente> = {
        success: true,
        data: cliente,
        message: 'Cliente encontrado exitosamente',
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

  // GET /clientes/buscar/nombre/:nombre
  async buscarPorNombre(req: Request, res: Response): Promise<void> {
    try {
      const { nombre } = req.params;
      
      if (!nombre) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Nombre es requerido',
        };
        res.status(400).json(response);
        return;
      }

      const clientes = await this.clienteService.buscarPorNombre(nombre);
      
      const response: ApiResponse<typeof clientes> = {
        success: true,
        data: clientes,
        message: 'Búsqueda completada exitosamente',
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

  // GET /clientes/activos
  async getClientesActivos(_req: Request, res: Response): Promise<void> {
    try {
      const clientes = await this.clienteService.getClientesActivos();
      
      const response: ApiResponse<typeof clientes> = {
        success: true,
        data: clientes,
        message: 'Clientes activos obtenidos exitosamente',
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

  // GET /clientes/estadisticas
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.clienteService.getEstadisticas();
      
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