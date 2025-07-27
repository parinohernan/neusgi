import { Router } from 'express';
import { PresupuestoController } from '@/controllers/PresupuestoController';
import { PresupuestoService } from '@/services/PresupuestoService';
import { PresupuestoRepository } from '@/repositories/PresupuestoRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// Inicializar dependencias
const presupuestoRepository = new PresupuestoRepository(Database.getInstance());
const presupuestoService = new PresupuestoService(presupuestoRepository);
const presupuestoController = new PresupuestoController(presupuestoService);

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas básicas CRUD
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getAll.bind(presupuestoController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getById.bind(presupuestoController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.create.bind(presupuestoController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.update.bind(presupuestoController));
router.delete('/:id', AuthMiddleware.requireAdmin, presupuestoController.delete.bind(presupuestoController));

// Rutas de búsqueda por entidad
router.get('/cliente/:clienteId', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.findByCliente.bind(presupuestoController));
router.get('/equipo/:equipoId', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.findByEquipo.bind(presupuestoController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.findByEstado.bind(presupuestoController));

// Rutas de gestión de estado
router.put('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.cambiarEstado.bind(presupuestoController));

// Rutas especiales
router.get('/vencidos/lista', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getPresupuestosVencidos.bind(presupuestoController));
router.get('/por-vencer/:dias', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getPresupuestosPorVencer.bind(presupuestoController));
router.get('/estadisticas/dashboard', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getEstadisticas.bind(presupuestoController));

export default router; 