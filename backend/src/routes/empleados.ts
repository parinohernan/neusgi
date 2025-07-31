import { Router } from 'express';
import { EmpleadoController } from '../controllers/EmpleadoController';
import { AuthMiddleware } from '../middleware/auth';

export function createEmpleadoRoutes(empleadoController: EmpleadoController): Router {
  const router = Router();

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas para empleados
  router.get('/', empleadoController.getAllEmpleados.bind(empleadoController));
  router.get('/activos', empleadoController.getEmpleadosActivos.bind(empleadoController));
  router.get('/conductores', empleadoController.getConductores.bind(empleadoController));
  router.get('/:id', empleadoController.getEmpleadoById.bind(empleadoController));
  router.post('/', AuthMiddleware.requireRole(['admin']), empleadoController.createEmpleado.bind(empleadoController));
  router.put('/:id', AuthMiddleware.requireRole(['admin']), empleadoController.updateEmpleado.bind(empleadoController));
  router.delete('/:id', AuthMiddleware.requireRole(['admin']), empleadoController.deleteEmpleado.bind(empleadoController));

  return router;
} 