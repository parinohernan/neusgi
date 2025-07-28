import { Router } from 'express';
import { EquipoController } from '@/controllers/EquipoController';
import { AuthMiddleware } from '@/middleware/auth';

export function createEquipoRoutes(equipoController: EquipoController): Router {
  const router = Router();

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas que requieren rol de logística o admin
  router.get('/', AuthMiddleware.requireLogistica, equipoController.getAll.bind(equipoController));
  router.get('/disponibles', AuthMiddleware.requireLogistica, equipoController.getDisponibles.bind(equipoController));
  router.get('/estadisticas', AuthMiddleware.requireLogistica, equipoController.getEstadisticas.bind(equipoController));
  router.get('/:id', AuthMiddleware.requireLogistica, equipoController.getById.bind(equipoController));

  // Rutas que requieren rol de admin
  router.post('/', AuthMiddleware.requireAdmin, equipoController.create.bind(equipoController));
  router.put('/:id', AuthMiddleware.requireAdmin, equipoController.update.bind(equipoController));
  router.delete('/:id', AuthMiddleware.requireAdmin, equipoController.delete.bind(equipoController));
  router.put('/:id/estado', AuthMiddleware.requireAdmin, equipoController.cambiarEstado.bind(equipoController));
  router.post('/:id/mantenimiento', AuthMiddleware.requireAdmin, equipoController.registrarMantenimiento.bind(equipoController));

  return router;
} 