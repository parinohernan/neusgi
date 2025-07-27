import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { AuthMiddleware } from '@/middleware/auth';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Rutas públicas (no requieren autenticación)
  router.post('/login', authController.login.bind(authController));
  router.post('/register', authController.register.bind(authController));
  router.post('/validate', authController.validateToken.bind(authController));

  // Rutas protegidas (requieren autenticación)
  router.use(AuthMiddleware.verifyToken);
  router.post('/refresh', authController.refreshToken.bind(authController));
  router.get('/me', authController.getCurrentUser.bind(authController));

  return router;
} 