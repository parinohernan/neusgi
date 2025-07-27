import { Router } from 'express';
import { CuentaCorrienteRepository } from '@/repositories/CuentaCorrienteRepository';
import { CuentaCorrienteService } from '@/services/CuentaCorrienteService';
import { CuentaCorrienteController } from '@/controllers/CuentaCorrienteController';
import { AuthMiddleware } from '@/middleware/auth';
import Database from '@/config/database';

const router = Router();

// Inicializar dependencias
const cuentaCorrienteRepository = new CuentaCorrienteRepository(Database.getInstance());
const cuentaCorrienteService = new CuentaCorrienteService(cuentaCorrienteRepository);
const cuentaCorrienteController = new CuentaCorrienteController(cuentaCorrienteService);

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD básicas
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getAll.bind(cuentaCorrienteController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getById.bind(cuentaCorrienteController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.create.bind(cuentaCorrienteController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.update.bind(cuentaCorrienteController));
router.delete('/:id', AuthMiddleware.requireAdmin, cuentaCorrienteController.delete.bind(cuentaCorrienteController));

// Rutas de búsqueda y filtrado
router.get('/cliente/:clienteId', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.findByCliente.bind(cuentaCorrienteController));
router.get('/tipo/:tipoMovimiento', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.findByTipoMovimiento.bind(cuentaCorrienteController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.findByEstado.bind(cuentaCorrienteController));

// Rutas de saldos y consultas
router.get('/cliente/:clienteId/saldo', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getSaldoCliente.bind(cuentaCorrienteController));
router.get('/cliente/:clienteId/periodo', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getMovimientosPorPeriodo.bind(cuentaCorrienteController));
router.get('/vencidos', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getMovimientosVencidos.bind(cuentaCorrienteController));

// Rutas de estadísticas
router.get('/cliente/:clienteId/estadisticas', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getEstadisticasPorCliente.bind(cuentaCorrienteController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.getEstadisticasGenerales.bind(cuentaCorrienteController));

// Rutas de gestión de estados
router.post('/actualizar-estados-vencidos', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.actualizarEstadosVencidos.bind(cuentaCorrienteController));
router.post('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.cancelarMovimiento.bind(cuentaCorrienteController));
router.post('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.reactivarMovimiento.bind(cuentaCorrienteController));

// Rutas de negocio específicas
router.post('/movimiento-automatico', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.crearMovimientoAutomatico.bind(cuentaCorrienteController));
router.get('/cliente/:clienteId/estado-cuenta', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.generarEstadoCuenta.bind(cuentaCorrienteController));
router.get('/alertas/cobranza', AuthMiddleware.requireRole(['admin', 'logistica']), cuentaCorrienteController.obtenerAlertasCobranza.bind(cuentaCorrienteController));

export default router; 