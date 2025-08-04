import { Router } from 'express';
import { OrdenCompraController } from '@/controllers/OrdenCompraController';
import { OrdenCompraService } from '@/services/OrdenCompraService';
import { OrdenCompraRepository } from '@/repositories/OrdenCompraRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

export function createOrdenCompraRoutes(): Router {
  const router = Router();
  const prisma = Database.getInstance();
  const ordenCompraRepository = new OrdenCompraRepository(prisma);
  const ordenCompraService = new OrdenCompraService(ordenCompraRepository);
  const ordenCompraController = new OrdenCompraController(ordenCompraService);

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas CRUD básicas
  router.get('/', ordenCompraController.getAll.bind(ordenCompraController));
  router.get('/:id', ordenCompraController.getById.bind(ordenCompraController));
  router.post('/', ordenCompraController.create.bind(ordenCompraController));
  router.put('/:id', ordenCompraController.update.bind(ordenCompraController));
  router.delete('/:id', ordenCompraController.delete.bind(ordenCompraController));

  // Rutas específicas
  router.get('/presupuesto/:presupuestoId', ordenCompraController.findByPresupuesto.bind(ordenCompraController));
  router.get('/estado/:estado', ordenCompraController.findByEstado.bind(ordenCompraController));
  router.put('/:id/estado', ordenCompraController.cambiarEstado.bind(ordenCompraController));

  return router;
} 