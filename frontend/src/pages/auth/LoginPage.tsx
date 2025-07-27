// ============================================================================
// PÁGINA DE LOGIN - Principio de Responsabilidad Única
// ============================================================================

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../stores/authStore';
import { useNotifications } from '../../stores/uiStore';
import { Eye, EyeOff, LogIn, Truck } from 'lucide-react';

// Schema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { success, error } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginSuccess = await login(data);
      if (loginSuccess) {
        success('Inicio de sesión exitoso');
      }
    } catch {
      error('Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="has-text-centered mb-4">
            <div className="icon is-large has-text-primary">
              <Truck size={48} />
            </div>
          </div>
          <h1 className="login-title">NEUSGI</h1>
          <p className="login-subtitle">Sistema de Gestión de Flota</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="field">
            <label className="label">Email</label>
            <div className="control has-icons-left">
              <input
                {...register('email')}
                type="email"
                className={`input ${errors.email ? 'is-danger' : ''}`}
                placeholder="tu@email.com"
              />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
            </div>
            {errors.email && (
              <p className="help is-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="field">
            <label className="label">Contraseña</label>
            <div className="control has-icons-left has-icons-right">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'is-danger' : ''}`}
                placeholder="••••••••"
              />
              <span className="icon is-small is-left">
                <i className="fas fa-lock"></i>
              </span>
              <span className="icon is-small is-right">
                <button
                  type="button"
                  className="button is-small is-text"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </div>
            {errors.password && (
              <p className="help is-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Botón de envío */}
          <div className="field">
            <div className="control">
              <button
                type="submit"
                className={`button is-primary is-fullwidth is-medium ${
                  isLoading ? 'is-loading' : ''
                }`}
                disabled={isLoading}
              >
                <span className="icon">
                  <LogIn size={20} />
                </span>
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </div>
        </form>

        {/* Información adicional */}
        <div className="has-text-centered mt-4">
          <p className="has-text-grey is-size-7">
            Credenciales de prueba: admin@neusgi.com / admin123
          </p>
        </div>

        {/* Footer */}
        <div className="has-text-centered mt-6">
          <p className="has-text-grey-light is-size-7">
            © 2024 NEUSGI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}; 