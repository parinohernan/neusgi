import { Router } from 'express';
import { OrdenCompraController } from '@/controllers/OrdenCompraController';
import { OrdenCompraService } from '@/services/OrdenCompraService';
import { OrdenCompraRepository } from '@/repositories/OrdenCompraRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// Inicializar dependencias
const ordenCompraRepository = new OrdenCompraRepository(Database.getInstance());
const ordenCompraService = new OrdenCompraService(ordenCompraRepository);
const ordenCompraController = new OrdenCompraController(ordenCompraService);

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas básicas CRUD
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getAll.bind(ordenCompraController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getById.bind(ordenCompraController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.create.bind(ordenCompraController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.update.bind(ordenCompraController));
router.delete('/:id', AuthMiddleware.requireAdmin, ordenCompraController.delete.bind(ordenCompraController));

// Rutas de búsqueda por entidad
router.get('/presupuesto/:presupuestoId', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.findByPresupuesto.bind(ordenCompraController));
router.get('/equipo/:equipoId', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.findByEquipo.bind(ordenCompraController));
router.get('/cliente/:clienteId', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.findByCliente.bind(ordenCompraController));
router.get('/estado/:estado', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.findByEstado.bind(ordenCompraController));

// Rutas de gestión de estado
router.put('/:id/estado', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.cambiarEstado.bind(ordenCompraController));
router.put('/:id/completar', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.completarOrden.bind(ordenCompraController));
router.put('/:id/cancelar', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.cancelarOrden.bind(ordenCompraController));
router.put('/:id/reactivar', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.reactivarOrden.bind(ordenCompraController));

// Rutas especiales
router.get('/activas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getOrdenesActivas.bind(ordenCompraController));
router.get('/completadas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getOrdenesCompletadas.bind(ordenCompraController));
router.get('/en-curso/lista', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getOrdenesEnCurso.bind(ordenCompraController));
router.get('/vencidas/lista', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getOrdenesVencidas.bind(ordenCompraController));
router.get('/estadisticas/dashboard', AuthMiddleware.requireRole(['admin', 'logistica']), ordenCompraController.getEstadisticas.bind(ordenCompraController));

export default router; 