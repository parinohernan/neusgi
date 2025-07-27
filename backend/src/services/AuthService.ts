import { UsuarioService } from './UsuarioService';
import { LoginDto, AuthResponse, CreateUsuarioDto } from '@/types';
import { AuthMiddleware } from '@/middleware/auth';

export class AuthService {
  private usuarioService: UsuarioService;

  constructor(usuarioService: UsuarioService) {
    this.usuarioService = usuarioService;
  }

  async login(loginData: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Buscar usuario por email
    const usuario = await this.usuarioService.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await this.usuarioService.validatePassword(email, password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = AuthMiddleware.generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    // Retornar respuesta sin passwordHash
    const { passwordHash, ...usuarioSinPassword } = usuario;

    return {
      token,
      usuario: usuarioSinPassword,
    };
  }

  async register(userData: CreateUsuarioDto): Promise<AuthResponse> {
    // Crear usuario
    const usuario = await this.usuarioService.create(userData);

    // Generar token JWT
    const token = AuthMiddleware.generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    // Retornar respuesta sin passwordHash
    const { passwordHash, ...usuarioSinPassword } = usuario;

    return {
      token,
      usuario: usuarioSinPassword,
    };
  }

  async validateToken(token: string): Promise<boolean> {
    const payload = AuthMiddleware.verifyTokenSync(token);
    return payload !== null;
  }

  async refreshToken(userId: number): Promise<string> {
    const usuario = await this.usuarioService.getById(userId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return AuthMiddleware.generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  }
} 