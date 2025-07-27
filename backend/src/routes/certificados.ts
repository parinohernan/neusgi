import { Router } from 'express';
import { CertificadoRepository } from '@/repositories/CertificadoRepository';
import { CertificadoService } from '@/services/CertificadoService';
import { CertificadoController } from '@/controllers/CertificadoController';
import { AuthMiddleware } from '@/middleware/auth';
import Database from '@/config/database';

const router = Router();

// Inicializar dependencias
const certificadoRepository = new CertificadoRepository(Database.getInstance());
const certificadoService = new CertificadoService(certificadoRepository);
const certificadoController = new CertificadoController(certificadoService);

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD básicas
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getAll.bind(certificadoController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getById.bind(certificadoController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.create.bind(certificadoController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.update.bind(certificadoController));
router.delete('/:id', AuthMiddleware.requireAdmin, certificadoController.delete.bind(certificadoController));

// Rutas de búsqueda
router.get('/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.findByOrdenCompra.bind(certificadoController));
router.get('/tipo/:tipo', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.findByTipo.bind(certificadoController));
router.get('/codigo/:codigo', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.findByCodigo.bind(certificadoController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.findByEstado.bind(certificadoController));

// Rutas de listado por estado
router.get('/activos/lista', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getCertificadosActivos.bind(certificadoController));
router.get('/vencidos/lista', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getCertificadosVencidos.bind(certificadoController));
router.get('/cancelados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getCertificadosCancelados.bind(certificadoController));

// Rutas de gestión de estado
router.put('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.cambiarEstado.bind(certificadoController));
router.put('/:id/vencer', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.marcarComoVencido.bind(certificadoController));
router.put('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.cancelarCertificado.bind(certificadoController));
router.put('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.reactivarCertificado.bind(certificadoController));

// Rutas de alertas y seguimiento
router.get('/por-vencer/lista', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getCertificadosPorVencer.bind(certificadoController));
router.get('/vencidos-recientes/lista', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getCertificadosVencidosRecientes.bind(certificadoController));

// Rutas de estadísticas
router.get('/estadisticas/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getEstadisticasPorOrdenCompra.bind(certificadoController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.getEstadisticasGenerales.bind(certificadoController));

// Rutas de utilidades
router.post('/generar-codigo', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.generarCodigoCertificado.bind(certificadoController));

// Rutas de gestión de archivos
router.post('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.agregarArchivoAdjunto.bind(certificadoController));
router.delete('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.removerArchivoAdjunto.bind(certificadoController));
router.put('/:id/pdf', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.actualizarPdfPath.bind(certificadoController));

// Rutas de mantenimiento
router.post('/actualizar-estados', AuthMiddleware.requireAdmin, certificadoController.actualizarEstadosAutomaticamente.bind(certificadoController));
router.get('/:id/verificar-vencimiento', AuthMiddleware.requireRole(['admin', 'logistica']), certificadoController.verificarVencimiento.bind(certificadoController));

export default router; 