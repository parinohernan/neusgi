import { Router } from 'express';
import { PagoRepository } from '@/repositories/PagoRepository';
import { PagoService } from '@/services/PagoService';
import { PagoController } from '@/controllers/PagoController';
import { AuthMiddleware } from '@/middleware/auth';
import Database from '@/config/database';

const router = Router();

// Inicializar dependencias
const pagoRepository = new PagoRepository(Database.getInstance());
const pagoService = new PagoService(pagoRepository);
const pagoController = new PagoController(pagoService);

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD básicas
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getAll.bind(pagoController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getById.bind(pagoController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.create.bind(pagoController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.update.bind(pagoController));
router.delete('/:id', AuthMiddleware.requireAdmin, pagoController.delete.bind(pagoController));

// Rutas de búsqueda
router.get('/factura/:facturaId', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.findByFactura.bind(pagoController));
router.get('/metodo/:metodoPago', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.findByMetodoPago.bind(pagoController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.findByEstado.bind(pagoController));

// Rutas de listado por estado
router.get('/pendientes/lista', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getPagosPendientes.bind(pagoController));
router.get('/confirmados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getPagosConfirmados.bind(pagoController));
router.get('/rechazados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getPagosRechazados.bind(pagoController));
router.get('/cancelados/lista', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getPagosCancelados.bind(pagoController));

// Rutas de gestión de estado
router.patch('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.cambiarEstado.bind(pagoController));
router.patch('/:id/confirmar', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.confirmarPago.bind(pagoController));
router.patch('/:id/rechazar', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.rechazarPago.bind(pagoController));
router.patch('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.cancelarPago.bind(pagoController));
router.patch('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.reactivarPago.bind(pagoController));

// Rutas de reportes y estadísticas
router.get('/periodo/lista', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getPagosPorPeriodo.bind(pagoController));
router.get('/factura/:facturaId/estadisticas', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getEstadisticasPorFactura.bind(pagoController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.getEstadisticasGenerales.bind(pagoController));

// Rutas de utilidades
router.patch('/:id/comprobante', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.actualizarComprobante.bind(pagoController));
router.post('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.agregarArchivoAdjunto.bind(pagoController));
router.delete('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), pagoController.removerArchivoAdjunto.bind(pagoController));

export default router; 