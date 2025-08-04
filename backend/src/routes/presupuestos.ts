import { Router } from 'express';
import { PresupuestoController } from '@/controllers/PresupuestoController';
import { PresupuestoService } from '@/services/PresupuestoService';
import { EmpresaService } from '@/services/EmpresaService';
import { PresupuestoRepository } from '@/repositories/PresupuestoRepository';
import { EquipoRepository } from '@/repositories/EquipoRepository';
import { EmpresaRepository } from '@/repositories/EmpresaRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// Inicializar dependencias
const presupuestoRepository = new PresupuestoRepository(Database.getInstance());
const equipoRepository = new EquipoRepository(Database.getInstance());
const empresaRepository = new EmpresaRepository(Database.getInstance());
const presupuestoService = new PresupuestoService(presupuestoRepository, equipoRepository);
const empresaService = new EmpresaService(empresaRepository);
const presupuestoController = new PresupuestoController(presupuestoService, empresaService);

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

// Iniciar actividad
router.post('/:id/iniciar-actividad', presupuestoController.iniciarActividad.bind(presupuestoController));

// Rutas especiales
router.get('/vencidos/lista', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getPresupuestosVencidos.bind(presupuestoController));
router.get('/por-vencer/:dias', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getPresupuestosPorVencer.bind(presupuestoController));
router.get('/estadisticas/dashboard', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.getEstadisticas.bind(presupuestoController));

// Ruta para generar PDF
router.get('/:id/pdf', AuthMiddleware.requireRole(['admin', 'logistica']), presupuestoController.generatePdf.bind(presupuestoController));

export default router; 