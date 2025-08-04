import { Router } from 'express';
import { ParteDiarioController } from '@/controllers/ParteDiarioController';
import { ParteDiarioService } from '@/services/ParteDiarioService';
import { ParteDiarioRepository } from '@/repositories/ParteDiarioRepository';
import Database from '@/config/database';
import { AuthMiddleware } from '@/middleware/auth';

export function createParteDiarioRoutes(): Router {
  const router = Router();
  const prisma = Database.getInstance();
  const parteDiarioRepository = new ParteDiarioRepository(prisma);
  const parteDiarioService = new ParteDiarioService(parteDiarioRepository);
  const parteDiarioController = new ParteDiarioController(parteDiarioService);

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas CRUD básicas
  router.get('/', parteDiarioController.getAll.bind(parteDiarioController));
  router.get('/:id', parteDiarioController.getById.bind(parteDiarioController));
  router.post('/', parteDiarioController.create.bind(parteDiarioController));
  router.put('/:id', parteDiarioController.update.bind(parteDiarioController));
  router.delete('/:id', parteDiarioController.delete.bind(parteDiarioController));

  // Rutas específicas
  router.get('/orden-compra/:ordenCompraId', AuthMiddleware.requireRole(['admin', 'logistica']), parteDiarioController.findByOrdenCompra.bind(parteDiarioController));

  return router;
} 