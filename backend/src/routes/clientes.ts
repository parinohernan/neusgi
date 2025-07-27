import { Router } from 'express';
import { ClienteController } from '@/controllers/ClienteController';
import { ClienteService } from '@/services/ClienteService';
import { ClienteRepository } from '@/repositories/ClienteRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// Inicializar dependencias
const clienteRepository = new ClienteRepository(Database.getInstance());
const clienteService = new ClienteService(clienteRepository);
const clienteController = new ClienteController(clienteService);

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas básicas CRUD
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.getAll.bind(clienteController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.getById.bind(clienteController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.create.bind(clienteController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.update.bind(clienteController));
router.delete('/:id', AuthMiddleware.requireAdmin, clienteController.delete.bind(clienteController));

// Rutas de búsqueda
router.get('/buscar/rut/:rutCuit', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.findByRutCuit.bind(clienteController));
router.get('/buscar/email/:email', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.findByEmail.bind(clienteController));
router.get('/buscar/nombre/:nombre', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.buscarPorNombre.bind(clienteController));

// Rutas especiales
router.get('/activos/lista', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.getClientesActivos.bind(clienteController));
router.get('/estadisticas/dashboard', AuthMiddleware.requireRole(['admin', 'logistica']), clienteController.getEstadisticas.bind(clienteController));

export default router; 