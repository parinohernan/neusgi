import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { LoginDto, CreateUsuarioDto, ApiResponse } from '@/types';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // POST /auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginDto = req.body;
      
      if (!loginData.email || !loginData.password) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email y contraseña son requeridos',
        };
        res.status(400).json(response);
        return;
      }

      const authResponse = await this.authService.login(loginData);
      
      const response: ApiResponse<typeof authResponse> = {
        success: true,
        data: authResponse,
        message: 'Inicio de sesión exitoso',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(401).json(response);
    }
  }

  // POST /auth/register
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUsuarioDto = req.body;
      
      const authResponse = await this.authService.register(userData);
      
      const response: ApiResponse<typeof authResponse> = {
        success: true,
        data: authResponse,
        message: 'Usuario registrado exitosamente',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // POST /auth/refresh
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.usuario?.id;
      
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Usuario no autenticado',
        };
        res.status(401).json(response);
        return;
      }

      const newToken = await this.authService.refreshToken(userId);
      
      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token: newToken },
        message: 'Token renovado exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // POST /auth/validate
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Token requerido',
        };
        res.status(400).json(response);
        return;
      }

      const isValid = await this.authService.validateToken(token);
      
      const response: ApiResponse<{ valid: boolean }> = {
        success: true,
        data: { valid: isValid },
        message: isValid ? 'Token válido' : 'Token inválido',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(400).json(response);
    }
  }

  // GET /auth/me
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Usuario no autenticado',
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse<typeof usuario> = {
        success: true,
        data: usuario,
        message: 'Usuario obtenido exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }
} 