import { Router } from 'express';
import { RemitoRepository } from '@/repositories/RemitoRepository';
import { RemitoService } from '@/services/RemitoService';
import { RemitoController } from '@/controllers/RemitoController';
import { AuthMiddleware } from '@/middleware/auth';
import Database from '@/config/database';

const router = Router();

// Inicializar dependencias
const remitoRepository = new RemitoRepository(Database.getInstance());
const remitoService = new RemitoService(remitoRepository);
const remitoController = new RemitoController(remitoService);

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD básicas
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getAll.bind(remitoController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getById.bind(remitoController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.create.bind(remitoController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.update.bind(remitoController));
router.delete('/:id', AuthMiddleware.requireAdmin, remitoController.delete.bind(remitoController));

// Rutas de búsqueda
router.get('/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.findByOrdenCompra.bind(remitoController));
router.get('/codigo/:codigo', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.findByCodigo.bind(remitoController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.findByEstado.bind(remitoController));

// Rutas de listados por estado
router.get('/pendientes/lista', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getRemitosPendientes.bind(remitoController));
router.get('/entregados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getRemitosEntregados.bind(remitoController));
router.get('/cancelados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getRemitosCancelados.bind(remitoController));

// Rutas de gestión de estado
router.put('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.cambiarEstado.bind(remitoController));
router.put('/:id/entregar', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.marcarComoEntregado.bind(remitoController));
router.put('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.cancelarRemito.bind(remitoController));
router.put('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.reactivarRemito.bind(remitoController));

// Rutas de estadísticas
router.get('/estadisticas/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getEstadisticasPorOrdenCompra.bind(remitoController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.getEstadisticasGenerales.bind(remitoController));

// Rutas de utilidades
router.post('/generar-codigo', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.generarCodigoRemito.bind(remitoController));

// Rutas de gestión de archivos
router.post('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.agregarArchivoAdjunto.bind(remitoController));
router.delete('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.removerArchivoAdjunto.bind(remitoController));
router.put('/:id/pdf', AuthMiddleware.requireRole(['admin', 'logistica']), remitoController.actualizarPdfPath.bind(remitoController));

export default router; 