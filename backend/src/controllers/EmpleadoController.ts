import { Request, Response } from 'express';
import { EmpleadoService } from '../services/EmpleadoService';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from '../types';

export class EmpleadoController {
  private empleadoService: EmpleadoService;

  constructor(empleadoService: EmpleadoService) {
    this.empleadoService = empleadoService;
  }

  getAllEmpleados = async (_req: Request, res: Response) => {
    try {
      const empleados = await this.empleadoService.getAllEmpleados();
      res.json({
        success: true,
        data: empleados
      });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  getEmpleadosActivos = async (_req: Request, res: Response) => {
    try {
      const empleados = await this.empleadoService.getEmpleadosActivos();
      res.json({
        success: true,
        data: empleados
      });
    } catch (error) {
      console.error('Error al obtener empleados activos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  getConductores = async (_req: Request, res: Response) => {
    try {
      const conductores = await this.empleadoService.getConductores();
      res.json({
        success: true,
        data: conductores
      });
    } catch (error) {
      console.error('Error al obtener conductores:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  getEmpleadoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de empleado inválido'
        });
        return;
      }

      const empleado = await this.empleadoService.getEmpleadoById(id);
      if (!empleado) {
        res.status(404).json({
          success: false,
          error: 'Empleado no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: empleado
      });
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  createEmpleado = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateEmpleadoDto = req.body;

      // Validaciones básicas
      if (!data.nombre || data.nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre del empleado es requerido'
        });
        return;
      }

      if (!data.apellido || data.apellido.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El apellido del empleado es requerido'
        });
        return;
      }

      if (!data.dni || data.dni.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El DNI del empleado es requerido'
        });
        return;
      }

      if (!data.sexo) {
        res.status(400).json({
          success: false,
          error: 'El sexo del empleado es requerido'
        });
        return;
      }

      if (!data.fechaIngreso) {
        res.status(400).json({
          success: false,
          error: 'La fecha de ingreso es requerida'
        });
        return;
      }

      const empleado = await this.empleadoService.createEmpleado(data);
      res.status(201).json({
        success: true,
        data: empleado,
        message: 'Empleado creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error al crear empleado:', error);
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

  updateEmpleado = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de empleado inválido'
        });
        return;
      }

      const data: UpdateEmpleadoDto = req.body;

      // Validaciones básicas
      if (data.nombre && data.nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre del empleado no puede estar vacío'
        });
        return;
      }

      if (data.apellido && data.apellido.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El apellido del empleado no puede estar vacío'
        });
        return;
      }

      if (data.dni && data.dni.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El DNI del empleado no puede estar vacío'
        });
        return;
      }

      const empleado = await this.empleadoService.updateEmpleado(id, data);
      if (!empleado) {
        res.status(404).json({
          success: false,
          error: 'Empleado no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: empleado,
        message: 'Empleado actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error al actualizar empleado:', error);
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

  deleteEmpleado = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] || '0');
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ID de empleado inválido'
        });
        return;
      }

      const deleted = await this.empleadoService.deleteEmpleado(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Empleado no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Empleado eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar empleado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
} 