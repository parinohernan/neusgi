import { Router } from 'express';
import { UsuarioController } from '@/controllers/UsuarioController';
import { AuthMiddleware } from '@/middleware/auth';

export function createUsuarioRoutes(usuarioController: UsuarioController): Router {
  const router = Router();

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas públicas (solo requieren autenticación)
  router.get('/', AuthMiddleware.requireLogistica, usuarioController.getAll.bind(usuarioController));
  router.get('/:id', AuthMiddleware.requireLogistica, usuarioController.getById.bind(usuarioController));
  router.post('/:id/change-password', usuarioController.changePassword.bind(usuarioController));

  // Rutas que requieren rol de admin
  router.post('/', AuthMiddleware.requireAdmin, usuarioController.create.bind(usuarioController));
  router.put('/:id', AuthMiddleware.requireAdmin, usuarioController.update.bind(usuarioController));
  router.delete('/:id', AuthMiddleware.requireAdmin, usuarioController.delete.bind(usuarioController));

  return router;
} 