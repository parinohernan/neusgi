import { Request, Response } from 'express';
import { ParteDiarioService } from '@/services/ParteDiarioService';
import { CreateParteDiarioDto, UpdateParteDiarioDto, ApiResponse, ParteDiarioFilters } from '@/types';

export class ParteDiarioController {
  private parteDiarioService: ParteDiarioService;

  constructor(parteDiarioService: ParteDiarioService) {
    this.parteDiarioService = parteDiarioService;
  }

  // GET /partes-diario
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, ordenCompraId, presupuestoId, clienteId, equipoId, fechaDesde, fechaHasta, kmRecorridosMin, kmRecorridosMax, horasTrabajadasMin, horasTrabajadasMax } = req.query;
      const filters: ParteDiarioFilters = {};
      
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
      if (ordenCompraId) filters.ordenCompraId = parseInt(ordenCompraId as string);
      if (presupuestoId) filters.presupuestoId = parseInt(presupuestoId as string);
      if (clienteId) filters.clienteId = parseInt(clienteId as string);
      if (equipoId) filters.equipoId = parseInt(equipoId as string);
      if (fechaDesde) filters.fechaDesde = fechaDesde as string;
      if (fechaHasta) filters.fechaHasta = fechaHasta as string;
      if (kmRecorridosMin) filters.kmRecorridosMin = parseInt(kmRecorridosMin as string);
      if (kmRecorridosMax) filters.kmRecorridosMax = parseInt(kmRecorridosMax as string);
      if (horasTrabajadasMin) filters.horasTrabajadasMin = parseInt(horasTrabajadasMin as string);
      if (horasTrabajadasMax) filters.horasTrabajadasMax = parseInt(horasTrabajadasMax as string);

      const partesDiario = await this.parteDiarioService.getAll(filters);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios obtenidos exitosamente',
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

  // GET /partes-diario/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de parte diario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const parteDiario = await this.parteDiarioService.getById(id);
      
      if (!parteDiario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parte diario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof parteDiario> = {
        success: true,
        data: parteDiario,
        message: 'Parte diario obtenido exitosamente',
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

  // POST /partes-diario
  async create(req: Request, res: Response): Promise<void> {
    try {
      const createData: CreateParteDiarioDto = req.body;
      
      const parteDiario = await this.parteDiarioService.create(createData);
      
      const response: ApiResponse<typeof parteDiario> = {
        success: true,
        data: parteDiario,
        message: 'Parte diario creado exitosamente',
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

  // PUT /partes-diario/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de parte diario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const updateData: UpdateParteDiarioDto = req.body;
      
      const parteDiario = await this.parteDiarioService.update(id, updateData);
      
      if (!parteDiario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parte diario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof parteDiario> = {
        success: true,
        data: parteDiario,
        message: 'Parte diario actualizado exitosamente',
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

  // DELETE /partes-diario/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de parte diario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.parteDiarioService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parte diario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Parte diario eliminado exitosamente',
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

  // GET /partes-diario/orden-compra/:ordenCompraId
  async findByOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      
      if (isNaN(ordenCompraId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const partesDiario = await this.parteDiarioService.findByOrdenCompra(ordenCompraId);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios de la orden de compra obtenidos exitosamente',
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

  // GET /partes-diario/fecha/:fecha
  async findByFecha(req: Request, res: Response): Promise<void> {
    try {
      const { fecha } = req.params;
      
      if (!fecha) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fecha requerida',
        };
        res.status(400).json(response);
        return;
      }

      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fecha inválida',
        };
        res.status(400).json(response);
        return;
      }

      const partesDiario = await this.parteDiarioService.findByFecha(fechaObj);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios de la fecha obtenidos exitosamente',
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

  // GET /partes-diario/rango-fechas
  async findByRangoFechas(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fechas de inicio y fin requeridas',
        };
        res.status(400).json(response);
        return;
      }

      const fechaInicioObj = new Date(fechaInicio as string);
      const fechaFinObj = new Date(fechaFin as string);
      
      if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fechas inválidas',
        };
        res.status(400).json(response);
        return;
      }

      const partesDiario = await this.parteDiarioService.findByRangoFechas(fechaInicioObj, fechaFinObj);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios del rango de fechas obtenidos exitosamente',
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

  // GET /partes-diario/mes/:anio/:mes
  async getPartesDiarioPorMes(req: Request, res: Response): Promise<void> {
    try {
      const anio = parseInt(req.params['anio'] || '0');
      const mes = parseInt(req.params['mes'] || '0');
      
      if (isNaN(anio) || isNaN(mes)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Año y mes inválidos',
        };
        res.status(400).json(response);
        return;
      }

      const partesDiario = await this.parteDiarioService.getPartesDiarioPorMes(anio, mes);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios del mes obtenidos exitosamente',
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

  // GET /partes-diario/semana/:fecha
  async getPartesDiarioPorSemana(req: Request, res: Response): Promise<void> {
    try {
      const { fecha } = req.params;
      
      if (!fecha) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fecha requerida',
        };
        res.status(400).json(response);
        return;
      }

      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Fecha inválida',
        };
        res.status(400).json(response);
        return;
      }

      const partesDiario = await this.parteDiarioService.getPartesDiarioPorSemana(fechaObj);
      
      const response: ApiResponse<typeof partesDiario> = {
        success: true,
        data: partesDiario,
        message: 'Partes diarios de la semana obtenidos exitosamente',
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

  // GET /partes-diario/estadisticas/orden-compra/:ordenCompraId
  async getEstadisticasPorOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      
      if (isNaN(ordenCompraId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de orden de compra inválido',
        };
        res.status(400).json(response);
        return;
      }

      const estadisticas = await this.parteDiarioService.getEstadisticasPorOrdenCompra(ordenCompraId);
      
      const response: ApiResponse<typeof estadisticas> = {
        success: true,
        data: estadisticas,
        message: 'Estadísticas de la orden de compra obtenidas exitosamente',
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

  // GET /partes-diario/estadisticas/generales
  async getEstadisticasGenerales(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      let fechaInicioObj: Date | undefined;
      let fechaFinObj: Date | undefined;
      
      if (fechaInicio) {
        fechaInicioObj = new Date(fechaInicio as string);
        if (isNaN(fechaInicioObj.getTime())) {
          const response: ApiResponse<null> = {
            success: false,
            error: 'Fecha de inicio inválida',
          };
          res.status(400).json(response);
          return;
        }
      }
      
      if (fechaFin) {
        fechaFinObj = new Date(fechaFin as string);
        if (isNaN(fechaFinObj.getTime())) {
          const response: ApiResponse<null> = {
            success: false,
            error: 'Fecha de fin inválida',
          };
          res.status(400).json(response);
          return;
        }
      }

      const estadisticas = await this.parteDiarioService.getEstadisticasGenerales(fechaInicioObj, fechaFinObj);
      
      const response: ApiResponse<typeof estadisticas> = {
        success: true,
        data: estadisticas,
        message: 'Estadísticas generales obtenidas exitosamente',
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

  // POST /partes-diario/:id/archivos
  async agregarArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de parte diario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { urlArchivo } = req.body;
      
      if (!urlArchivo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'URL del archivo es requerida',
        };
        res.status(400).json(response);
        return;
      }

      const parteDiario = await this.parteDiarioService.agregarArchivoAdjunto(id, urlArchivo);
      
      if (!parteDiario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parte diario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof parteDiario> = {
        success: true,
        data: parteDiario,
        message: 'Archivo adjunto agregado exitosamente',
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

  // DELETE /partes-diario/:id/archivos
  async removerArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de parte diario inválido',
        };
        res.status(400).json(response);
        return;
      }

      const { urlArchivo } = req.body;
      
      if (!urlArchivo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'URL del archivo es requerida',
        };
        res.status(400).json(response);
        return;
      }

      const parteDiario = await this.parteDiarioService.removerArchivoAdjunto(id, urlArchivo);
      
      if (!parteDiario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parte diario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof parteDiario> = {
        success: true,
        data: parteDiario,
        message: 'Archivo adjunto removido exitosamente',
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

  // POST /partes-diario/calcular-km
  async calcularKmRecorridos(req: Request, res: Response): Promise<void> {
    try {
      const { kmInicial, kmFinal } = req.body;
      
      if (kmInicial === undefined || kmFinal === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Km inicial y km final son requeridos',
        };
        res.status(400).json(response);
        return;
      }

      const kmRecorridos = await this.parteDiarioService.calcularKmRecorridos(kmInicial, kmFinal);
      
      const response: ApiResponse<{ kmRecorridos: number }> = {
        success: true,
        data: { kmRecorridos },
        message: 'Km recorridos calculados exitosamente',
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