import { Request, Response } from 'express';
import { PresupuestoService } from '@/services/PresupuestoService';
import { EmpresaService } from '@/services/EmpresaService';
import { PdfService } from '@/services/PdfService';
import { CreatePresupuestoDto, UpdatePresupuestoDto, ApiResponse, PresupuestoFilters } from '@/types';

export class PresupuestoController {
  private presupuestoService: PresupuestoService;
  private empresaService: EmpresaService;

  constructor(presupuestoService: PresupuestoService, empresaService: EmpresaService) {
    this.presupuestoService = presupuestoService;
    this.empresaService = empresaService;
  }

  // GET /presupuestos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, estado, clienteId, equipoId, fechaDesde, fechaHasta } = req.query;
      const filters: PresupuestoFilters = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      if (estado) filters.estado = estado as 'pendiente' | 'aceptado' | 'rechazado';
      if (clienteId) filters.clienteId = parseInt(clienteId as string);
      if (equipoId) filters.equipoId = parseInt(equipoId as string);
      if (fechaDesde) filters.fechaDesde = fechaDesde as string;
      if (fechaHasta) filters.fechaHasta = fechaHasta as string;

      const presupuestos = await this.presupuestoService.getAll(filters);
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos obtenidos exitosamente',
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

  // GET /presupuestos/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const presupuesto = await this.presupuestoService.getById(id);
      
      if (!presupuesto) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof presupuesto> = {
        success: true,
        data: presupuesto,
        message: 'Presupuesto obtenido exitosamente',
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

  // POST /presupuestos
  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== DEBUG CREATE PRESUPUESTO ===');
      console.log('req.usuario:', req.usuario);
      console.log('req.usuario?.id:', req.usuario?.id);
      console.log('req.body:', req.body);
      
      const createData: CreatePresupuestoDto = {
        ...req.body,
        usuarioId: req.usuario?.id || 0
      };
      
      console.log('createData final:', createData);
      
      const presupuesto = await this.presupuestoService.create(createData);
      
      const response: ApiResponse<typeof presupuesto> = {
        success: true,
        data: presupuesto,
        message: 'Presupuesto creado exitosamente',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error en create:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // PUT /presupuestos/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdatePresupuestoDto = req.body;
      
      const presupuesto = await this.presupuestoService.update(id, updateData);
      
      if (!presupuesto) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof presupuesto> = {
        success: true,
        data: presupuesto,
        message: 'Presupuesto actualizado exitosamente',
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

  // DELETE /presupuestos/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.presupuestoService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Presupuesto eliminado exitosamente',
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

  // GET /presupuestos/cliente/:clienteId
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

      const presupuestos = await this.presupuestoService.findByCliente(clienteId);
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos del cliente obtenidos exitosamente',
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

  // GET /presupuestos/equipo/:equipoId
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

      const presupuestos = await this.presupuestoService.findByEquipo(equipoId);
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos del equipo obtenidos exitosamente',
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

  // GET /presupuestos/estado/:estado
  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const { estado } = req.params;
      
      if (!estado || !['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Estado inválido. Debe ser: pendiente, aceptado o rechazado',
        };
        res.status(400).json(response);
        return;
      }

      const presupuestos = await this.presupuestoService.findByEstado(estado as 'pendiente' | 'aceptado' | 'rechazado');
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos obtenidos exitosamente',
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

  // PUT /presupuestos/:id/estado
  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { estado } = req.body;
      
      if (!estado || !['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Estado inválido. Debe ser: pendiente, aceptado o rechazado',
        };
        res.status(400).json(response);
        return;
      }

      const presupuesto = await this.presupuestoService.cambiarEstado(id, estado);
      
      if (!presupuesto) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof presupuesto> = {
        success: true,
        data: presupuesto,
        message: 'Estado del presupuesto actualizado exitosamente',
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

  // GET /presupuestos/vencidos
  async getPresupuestosVencidos(_req: Request, res: Response): Promise<void> {
    try {
      const presupuestos = await this.presupuestoService.getPresupuestosVencidos();
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos vencidos obtenidos exitosamente',
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

  // GET /presupuestos/por-vencer/:dias
  async getPresupuestosPorVencer(req: Request, res: Response): Promise<void> {
    try {
      const dias = parseInt(req.params['dias'] || '7');
      
      if (isNaN(dias) || dias < 1 || dias > 30) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Los días deben estar entre 1 y 30',
        };
        res.status(400).json(response);
        return;
      }

      const presupuestos = await this.presupuestoService.getPresupuestosPorVencer(dias);
      
      const response: ApiResponse<typeof presupuestos> = {
        success: true,
        data: presupuestos,
        message: 'Presupuestos por vencer obtenidos exitosamente',
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

  // GET /presupuestos/estadisticas
  async getEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.presupuestoService.getEstadisticas();
      
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

  // GET /presupuestos/:id/pdf
  async generatePdf(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de presupuesto inválido',
        };
        res.status(400).json(response);
        return;
      }

      const presupuesto = await this.presupuestoService.getById(id);
      
      if (!presupuesto) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Presupuesto no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      // Obtener datos de la empresa
      const empresa = await this.empresaService.getEmpresaActiva();
      
      // Generar PDF
      const pdfBuffer = await PdfService.generatePresupuestoPdf(presupuesto, empresa || undefined);
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Enviar PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error generando PDF',
      };
      res.status(500).json(response);
    }
  }
} 