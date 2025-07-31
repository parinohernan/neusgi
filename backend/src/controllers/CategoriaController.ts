import { Request, Response } from 'express';
import { CategoriaService } from '../services/CategoriaService';
import { CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export class CategoriaController {
  private categoriaService: CategoriaService;

  constructor(categoriaService: CategoriaService) {
    this.categoriaService = categoriaService;
  }

  getAllCategorias = async (_req: Request, res: Response) => {
    try {
      const categorias = await this.categoriaService.getAllCategorias();
      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  getCategoriasActivas = async (_req: Request, res: Response) => {
    try {
      const categorias = await this.categoriaService.getCategoriasActivas();
      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías activas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  getCategoriaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de categoría inválido'
        });
        return;
      }

      const categoria = await this.categoriaService.getCategoriaById(id);
      if (!categoria) {
        res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  createCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateCategoriaDto = req.body;

      // Validaciones básicas
      if (!data.nombre || data.nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre de la categoría es requerido'
        });
        return;
      }

      const categoria = await this.categoriaService.createCategoria(data);
      res.status(201).json({
        success: true,
        data: categoria,
        message: 'Categoría creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      if (error.message.includes('Ya existe')) {
        res.status(409).json({
          success: false,
          error: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  updateCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de categoría inválido'
        });
        return;
      }

      const data: UpdateCategoriaDto = req.body;

      // Validaciones básicas
      if (data.nombre && data.nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre de la categoría no puede estar vacío'
        });
        return;
      }

      const categoria = await this.categoriaService.updateCategoria(id, data);
      if (!categoria) {
        res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: categoria,
        message: 'Categoría actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      if (error.message.includes('Ya existe')) {
        res.status(409).json({
          success: false,
          error: error.message
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  deleteCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de categoría inválido'
        });
        return;
      }

      const deleted = await this.categoriaService.deleteCategoria(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
} 