import { Router } from 'express';
import { FacturaRepository } from '@/repositories/FacturaRepository';
import { FacturaService } from '@/services/FacturaService';
import { FacturaController } from '@/controllers/FacturaController';
import { AuthMiddleware } from '@/middleware/auth';
import Database from '@/config/database';

const router = Router();

// Inicializar dependencias
const facturaRepository = new FacturaRepository(Database.getInstance());
const facturaService = new FacturaService(facturaRepository);
const facturaController = new FacturaController(facturaService);

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD básicas
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getAll.bind(facturaController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getById.bind(facturaController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.create.bind(facturaController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.update.bind(facturaController));
router.delete('/:id', AuthMiddleware.requireAdmin, facturaController.delete.bind(facturaController));

// Rutas de búsqueda
router.get('/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.findByOrdenCompra.bind(facturaController));
router.get('/numero/:numeroFactura', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.findByNumeroFactura.bind(facturaController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.findByEstado.bind(facturaController));

// Rutas de listado por estado
router.get('/pendientes/lista', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getFacturasPendientes.bind(facturaController));
router.get('/pagadas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getFacturasPagadas.bind(facturaController));
router.get('/canceladas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getFacturasCanceladas.bind(facturaController));

// Rutas de gestión de estado
router.put('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.cambiarEstado.bind(facturaController));
router.put('/:id/pagar', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.marcarComoPagada.bind(facturaController));
router.put('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.cancelarFactura.bind(facturaController));
router.put('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.reactivarFactura.bind(facturaController));

// Rutas de alertas y seguimiento
router.get('/por-vencer/lista', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getFacturasPorVencer.bind(facturaController));
router.get('/vencidas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getFacturasVencidas.bind(facturaController));

// Rutas de estadísticas
router.get('/estadisticas/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getEstadisticasPorOrdenCompra.bind(facturaController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.getEstadisticasGenerales.bind(facturaController));

// Rutas de utilidades
router.post('/generar-numero', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.generarNumeroFactura.bind(facturaController));

// Rutas de gestión de pagos
router.post('/:id/pago', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.registrarPago.bind(facturaController));

// Rutas de gestión de archivos
router.post('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.agregarArchivoAdjunto.bind(facturaController));
router.delete('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.removerArchivoAdjunto.bind(facturaController));
router.put('/:id/pdf', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.actualizarPdfPath.bind(facturaController));

// Rutas de cálculos
router.get('/:id/saldo-pendiente', AuthMiddleware.requireRole(['admin', 'logistica']), facturaController.calcularSaldoPendiente.bind(facturaController));

export default router; 