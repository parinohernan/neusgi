import { Router } from 'express';
import { ParteDiarioController } from '@/controllers/ParteDiarioController';
import { ParteDiarioService } from '@/services/ParteDiarioService';
import { ParteDiarioRepository } from '@/repositories/ParteDiarioRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

const router = Router();

// Inicializar dependencias
const parteDiarioRepository = new ParteDiarioRepository(Database.getInstance());
const parteDiarioService = new ParteDiarioService(parteDiarioRepository);
const parteDiarioController = new ParteDiarioController(parteDiarioService);

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas básicas CRUD
router.get('/', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getAll.bind(parteDiarioController));
router.get('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getById.bind(parteDiarioController));
router.post('/', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.create.bind(parteDiarioController));
router.put('/:id', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.update.bind(parteDiarioController));
router.delete('/:id', AuthMiddleware.requireAdmin, parteDiarioController.delete.bind(parteDiarioController));

// Rutas de búsqueda por entidad
router.get('/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.findByOrdenCompra.bind(parteDiarioController));
router.get('/fecha/:fecha', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.findByFecha.bind(parteDiarioController));

// Rutas de búsqueda por rango de fechas
router.get('/rango-fechas', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.findByRangoFechas.bind(parteDiarioController));

// Rutas de búsqueda por período
router.get('/mes/:anio/:mes', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getPartesDiarioPorMes.bind(parteDiarioController));
router.get('/semana/:fecha', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getPartesDiarioPorSemana.bind(parteDiarioController));

// Rutas de estadísticas
router.get('/estadisticas/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getEstadisticasPorOrdenCompra.bind(parteDiarioController));
router.get('/estadisticas/generales', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.getEstadisticasGenerales.bind(parteDiarioController));

// Rutas de gestión de archivos adjuntos
router.post('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.agregarArchivoAdjunto.bind(parteDiarioController));
router.delete('/:id/archivos', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.removerArchivoAdjunto.bind(parteDiarioController));

// Rutas de utilidades
router.post('/calcular-km', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.calcularKmRecorridos.bind(parteDiarioController));

export default router; 