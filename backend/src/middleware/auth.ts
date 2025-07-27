import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Usuario } from '@/types';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: Omit<Usuario, 'passwordHash'>;
    }
  }
}

export interface JWTPayload {
  id: number;
  email: string;
  rol: string;
}

export class AuthMiddleware {
  private static readonly JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

  // Middleware para verificar token JWT
  static verifyToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, AuthMiddleware.JWT_SECRET) as JWTPayload;
      
      // Agregar información del usuario al request
      req.usuario = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol as 'admin' | 'logistica' | 'cliente_externo',
        nombre: '', // Se puede obtener del token si es necesario
        creadoEn: new Date(), // Se puede obtener del token si es necesario
      };
      
      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    }
  }

  // Middleware para verificar roles específicos
  static requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          error: 'Autenticación requerida',
        });
        return;
      }

      if (!allowedRoles.includes(req.usuario.rol)) {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este recurso',
        });
        return;
      }

      next();
    };
  }

  // Middleware para verificar si es admin
  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['admin'])(req, res, next);
  }

  // Middleware para verificar si es logística o admin
  static requireLogistica(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['admin', 'logistica'])(req, res, next);
  }

  // Middleware para verificar si es cliente externo o admin
  static requireClienteExterno(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['admin', 'cliente_externo'])(req, res, next);
  }

  // Generar token JWT
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, AuthMiddleware.JWT_SECRET, {
      expiresIn: '24h', // Token válido por 24 horas
    });
  }

  // Verificar token sin middleware (para uso en servicios)
  static verifyTokenSync(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, AuthMiddleware.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
} 