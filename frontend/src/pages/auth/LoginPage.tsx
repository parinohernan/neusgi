// ============================================================================
// PÁGINA DE LOGIN - Principio de Responsabilidad Única
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Truck } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import { useNotifications } from '../../stores/uiStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// ----------------------------------------------------------------------------
// ESQUEMA DE VALIDACIÓN
// ----------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ----------------------------------------------------------------------------
// COMPONENTE LOGIN PAGE
// ----------------------------------------------------------------------------

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { error, success } = useNotifications();
  const navigate = useNavigate();

  // ----------------------------------------------------------------------------
  // CONFIGURACIÓN DEL FORMULARIO
  // ----------------------------------------------------------------------------

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ----------------------------------------------------------------------------
  // MANEJADOR DE ENVÍO
  // ----------------------------------------------------------------------------

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginSuccess = await login(data);
      
      if (loginSuccess) {
        success('Inicio de sesión exitoso', 'Bienvenido al sistema NEUSGI');
        navigate('/dashboard');
      } else {
        error('Error de autenticación', 'Credenciales inválidas');
      }
    } catch {
      error('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  // ----------------------------------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Truck className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            NEUSGI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión Logística
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input mt-1"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 NEUSGI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}; 