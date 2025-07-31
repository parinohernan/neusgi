import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { AuthMiddleware } from '../middleware/auth';

export function createCategoriaRoutes(categoriaController: CategoriaController): Router {
  const router = Router();

  // Aplicar middleware de autenticación a todas las rutas
  router.use(AuthMiddleware.verifyToken);

  // Rutas para categorías
  router.get('/', categoriaController.getAllCategorias.bind(categoriaController));
  router.get('/activas', categoriaController.getCategoriasActivas.bind(categoriaController));
  router.get('/:id', categoriaController.getCategoriaById.bind(categoriaController));
  router.post('/', AuthMiddleware.requireRole(['admin']), categoriaController.createCategoria.bind(categoriaController));
  router.put('/:id', AuthMiddleware.requireRole(['admin']), categoriaController.updateCategoria.bind(categoriaController));
  router.delete('/:id', AuthMiddleware.requireRole(['admin']), categoriaController.deleteCategoria.bind(categoriaController));

  return router;
} 