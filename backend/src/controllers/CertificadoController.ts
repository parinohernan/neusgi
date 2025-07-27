import { Request, Response } from 'express';
import { CertificadoService } from '@/services/CertificadoService';
import { CertificadoFilters } from '@/types';

export class CertificadoController {
  private certificadoService: CertificadoService;

  constructor(certificadoService: CertificadoService) {
    this.certificadoService = certificadoService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: CertificadoFilters = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string || undefined,
        sortOrder: (req.query['sortOrder'] as 'asc' | 'desc') || undefined,
        ordenCompraId: req.query['ordenCompraId'] ? parseInt(req.query['ordenCompraId'] as string) : undefined,
        presupuestoId: req.query['presupuestoId'] ? parseInt(req.query['presupuestoId'] as string) : undefined,
        clienteId: req.query['clienteId'] ? parseInt(req.query['clienteId'] as string) : undefined,
        equipoId: req.query['equipoId'] ? parseInt(req.query['equipoId'] as string) : undefined,
        tipo: req.query['tipo'] as 'seguro' | 'habilitacion' | 'otros' || undefined,
        codigo: req.query['codigo'] as string || undefined,
        estado: req.query['estado'] as 'activo' | 'vencido' | 'cancelado' || undefined,
        fechaVencimientoDesde: req.query['fechaVencimientoDesde'] as string || undefined,
        fechaVencimientoHasta: req.query['fechaVencimientoHasta'] as string || undefined,
        fechaDesde: req.query['fechaDesde'] as string || undefined,
        fechaHasta: req.query['fechaHasta'] as string || undefined,
      };

      const result = await this.certificadoService.getAll(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const certificado = await this.certificadoService.getById(id);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const certificado = await this.certificadoService.create(req.body);
      res.status(201).json({
        success: true,
        data: certificado,
        message: 'Certificado creado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el certificado',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const certificado = await this.certificadoService.update(id, req.body);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Certificado actualizado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar el certificado',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const deleted = await this.certificadoService.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Certificado eliminado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar el certificado',
      });
    }
  }

  // Métodos específicos
  async findByOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const certificados = await this.certificadoService.findByOrdenCompra(ordenCompraId);

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByTipo(req: Request, res: Response): Promise<void> {
    try {
      const tipo = req.params['tipo'] as 'seguro' | 'habilitacion' | 'otros';
      const certificados = await this.certificadoService.findByTipo(tipo);

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByCodigo(req: Request, res: Response): Promise<void> {
    try {
      const codigo = req.params['codigo'];
      if (!codigo) {
        res.status(400).json({
          success: false,
          error: 'Código de certificado requerido',
        });
        return;
      }

      const certificado = await this.certificadoService.findByCodigo(codigo);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async findByEstado(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.params['estado'] as 'activo' | 'vencido' | 'cancelado';
      const certificados = await this.certificadoService.findByEstado(estado);

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getCertificadosActivos(_req: Request, res: Response): Promise<void> {
    try {
      const certificados = await this.certificadoService.getCertificadosActivos();

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getCertificadosVencidos(_req: Request, res: Response): Promise<void> {
    try {
      const certificados = await this.certificadoService.getCertificadosVencidos();

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getCertificadosCancelados(_req: Request, res: Response): Promise<void> {
    try {
      const certificados = await this.certificadoService.getCertificadosCancelados();

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { estado } = req.body;

      if (!estado || !['activo', 'vencido', 'cancelado'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
        return;
      }

      const certificado = await this.certificadoService.cambiarEstado(id, estado);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: `Certificado marcado como ${estado}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar el estado',
      });
    }
  }

  async marcarComoVencido(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const certificado = await this.certificadoService.marcarComoVencido(id);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Certificado marcado como vencido',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar como vencido',
      });
    }
  }

  async cancelarCertificado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const certificado = await this.certificadoService.cancelarCertificado(id);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Certificado cancelado',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar el certificado',
      });
    }
  }

  async reactivarCertificado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const certificado = await this.certificadoService.reactivarCertificado(id);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Certificado reactivado',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al reactivar el certificado',
      });
    }
  }

  async getCertificadosPorVencer(req: Request, res: Response): Promise<void> {
    try {
      const dias = req.query['dias'] ? parseInt(req.query['dias'] as string) : 30;
      const certificados = await this.certificadoService.getCertificadosPorVencer(dias);

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getCertificadosVencidosRecientes(req: Request, res: Response): Promise<void> {
    try {
      const dias = req.query['dias'] ? parseInt(req.query['dias'] as string) : 30;
      const certificados = await this.certificadoService.getCertificadosVencidosRecientes(dias);

      res.json({
        success: true,
        data: certificados,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getEstadisticasPorOrdenCompra(req: Request, res: Response): Promise<void> {
    try {
      const ordenCompraId = parseInt(req.params['ordenCompraId'] || '0');
      const estadisticas = await this.certificadoService.getEstadisticasPorOrdenCompra(ordenCompraId);

      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async getEstadisticasGenerales(req: Request, res: Response): Promise<void> {
    try {
      const fechaInicio = req.query['fechaInicio'] ? new Date(req.query['fechaInicio'] as string) : undefined;
      const fechaFin = req.query['fechaFin'] ? new Date(req.query['fechaFin'] as string) : undefined;
      
      const estadisticas = await this.certificadoService.getEstadisticasGenerales(fechaInicio, fechaFin);

      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      });
    }
  }

  async generarCodigoCertificado(req: Request, res: Response): Promise<void> {
    try {
      const { tipo } = req.body;

      if (!tipo || !['seguro', 'habilitacion', 'otros'].includes(tipo)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de certificado inválido',
        });
        return;
      }

      const codigo = await this.certificadoService.generarCodigoCertificado(tipo);

      res.json({
        success: true,
        data: { codigo },
        message: 'Código de certificado generado',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar código',
      });
    }
  }

  async agregarArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const certificado = await this.certificadoService.agregarArchivoAdjunto(id, urlArchivo);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Archivo adjunto agregado',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar archivo adjunto',
      });
    }
  }

  async removerArchivoAdjunto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { urlArchivo } = req.body;

      if (!urlArchivo) {
        res.status(400).json({
          success: false,
          error: 'URL del archivo es requerida',
        });
        return;
      }

      const certificado = await this.certificadoService.removerArchivoAdjunto(id, urlArchivo);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Archivo adjunto removido',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al remover archivo adjunto',
      });
    }
  }

  async actualizarPdfPath(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const { pdfPath } = req.body;

      if (!pdfPath) {
        res.status(400).json({
          success: false,
          error: 'Ruta del PDF es requerida',
        });
        return;
      }

      const certificado = await this.certificadoService.actualizarPdfPath(id, pdfPath);

      if (!certificado) {
        res.status(404).json({
          success: false,
          error: 'Certificado no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: certificado,
        message: 'Ruta del PDF actualizada',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar ruta del PDF',
      });
    }
  }

  async actualizarEstadosAutomaticamente(_req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.certificadoService.actualizarEstadosAutomaticamente();

      res.json({
        success: true,
        data: resultado,
        message: 'Estados actualizados automáticamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar estados',
      });
    }
  }

  async verificarVencimiento(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params['id'] || '0');
      const resultado = await this.certificadoService.verificarVencimiento(id);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar vencimiento',
      });
    }
  }
} 