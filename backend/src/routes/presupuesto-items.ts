import { Router } from 'express';
import { PresupuestoItemController } from '@/controllers/PresupuestoItemController';
import { PresupuestoItemService } from '@/services/PresupuestoItemService';
import { PresupuestoItemRepository } from '@/repositories/PresupuestoItemRepository';
import Database from '@/config/database';

export function createPresupuestoItemRoutes(): Router {
  const router = Router();
  
  // Inicializar dependencias
  const presupuestoItemRepository = new PresupuestoItemRepository(Database.getInstance());
  const presupuestoItemService = new PresupuestoItemService(presupuestoItemRepository);
  const presupuestoItemController = new PresupuestoItemController(presupuestoItemService);

  // Rutas para items de presupuesto
  router.get('/', (req, res) => presupuestoItemController.getAll(req, res));
  router.get('/:id', (req, res) => presupuestoItemController.getById(req, res));
  router.get('/presupuesto/:presupuestoId', (req, res) => presupuestoItemController.getByPresupuestoId(req, res));
  router.post('/', (req, res) => presupuestoItemController.create(req, res));
  router.put('/:id', (req, res) => presupuestoItemController.update(req, res));
  router.delete('/:id', (req, res) => presupuestoItemController.delete(req, res));

  return router;
} 