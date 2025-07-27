import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createUsuarioRoutes } from '@/routes/usuarios';
import { createAuthRoutes } from '@/routes/auth';
import { createEquipoRoutes } from '@/routes/equipos';
import clientesRoutes from '@/routes/clientes';
import presupuestosRoutes from '@/routes/presupuestos';
import ordenesCompraRoutes from '@/routes/ordenes-compra';
import partesDiarioRoutes from '@/routes/partes-diario';
import remitosRoutes from '@/routes/remitos';
import certificadosRoutes from '@/routes/certificados';
import facturasRoutes from '@/routes/facturas';
import pagosRoutes from '@/routes/pagos';
import cuentaCorrienteRoutes from '@/routes/cuenta-corriente';
import { UsuarioController } from '@/controllers/UsuarioController';
import { AuthController } from '@/controllers/AuthController';
import { EquipoController } from '@/controllers/EquipoController';
import { UsuarioService } from '@/services/UsuarioService';
import { AuthService } from '@/services/AuthService';
import { EquipoService } from '@/services/EquipoService';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { EquipoRepository } from '@/repositories/EquipoRepository';
import Database from '@/config/database';

export class App {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: {
        success: false,
        error: 'Demasiadas requests desde esta IP, intenta de nuevo en 15 minutos',
      },
    });
    this.app.use('/api/', limiter);

    // Compresión
    this.app.use(compression());

    // Logging
    if (process.env['NODE_ENV'] === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Headers adicionales
    this.app.use((_req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  private configureRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
      });
    });

    // API routes
    this.app.use('/api/v1', this.createApiRoutes());
  }

  private createApiRoutes(): express.Router {
    const router = express.Router();

    // Inicializar dependencias (Dependency Injection)
    const prisma = Database.getInstance();
    
    // Repositorios
    const usuarioRepository = new UsuarioRepository(prisma);
    const equipoRepository = new EquipoRepository(prisma);
    
    // Servicios
    const usuarioService = new UsuarioService(usuarioRepository);
    const authService = new AuthService(usuarioService);
    const equipoService = new EquipoService(equipoRepository);
    
    // Controladores
    const usuarioController = new UsuarioController(usuarioService);
    const authController = new AuthController(authService);
    const equipoController = new EquipoController(equipoService);

    // Rutas
    router.use('/auth', createAuthRoutes(authController));
    router.use('/usuarios', createUsuarioRoutes(usuarioController));
    router.use('/equipos', createEquipoRoutes(equipoController));
    router.use('/clientes', clientesRoutes);
    router.use('/presupuestos', presupuestosRoutes);
    router.use('/ordenes-compra', ordenesCompraRoutes);
    router.use('/partes-diario', partesDiarioRoutes);
    router.use('/remitos', remitosRoutes);
    router.use('/certificados', certificadosRoutes);
    router.use('/facturas', facturasRoutes);
    router.use('/pagos', pagosRoutes);
    router.use('/cuenta-corriente', cuentaCorrienteRoutes);

    // Ruta por defecto
    router.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'API de Neusgi - Sistema de Gestión de Flota',
        version: '1.0.0',
        endpoints: {
          auth: '/api/v1/auth',
          usuarios: '/api/v1/usuarios',
          equipos: '/api/v1/equipos',
          clientes: '/api/v1/clientes',
          presupuestos: '/api/v1/presupuestos',
          ordenesCompra: '/api/v1/ordenes-compra',
          partesDiario: '/api/v1/partes-diario',
          remitos: '/api/v1/remitos',
          certificados: '/api/v1/certificados',
          facturas: '/api/v1/facturas',
          pagos: '/api/v1/pagos',
          cuentaCorriente: '/api/v1/cuenta-corriente',
          health: '/health',
        },
      });
    });

    return router;
  }

  private configureErrorHandling(): void {
    // Middleware para manejar rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
      });
    });

    // Middleware para manejar errores globales
    this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error no manejado:', error);

      // Si es un error de validación de Prisma
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un registro con estos datos únicos',
        });
      }

      // Si es un error de validación de Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Registro no encontrado',
        });
      }

      // Error por defecto
      return res.status(500).json({
        success: false,
        error: process.env['NODE_ENV'] === 'development' ? error.message : 'Error interno del servidor',
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos
      await Database.connect();

      // Iniciar servidor
      this.app.listen(this.port, () => {
        console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`🔗 API: http://localhost:${this.port}/api/v1`);
        console.log(`🌍 Ambiente: ${process.env['NODE_ENV'] || 'development'}`);
      });
    } catch (error) {
      console.error('❌ Error iniciando el servidor:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await Database.disconnect();
      console.log('✅ Servidor detenido correctamente');
    } catch (error) {
      console.error('❌ Error deteniendo el servidor:', error);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
} 