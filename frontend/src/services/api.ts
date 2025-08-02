// ============================================================================
// SERVICIO DE API BASE - Principio de Responsabilidad Única
// ============================================================================

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '../types';
import { apiConfig } from './config';

// ----------------------------------------------------------------------------
// INTERFACES DE LA API
// ----------------------------------------------------------------------------

export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// ----------------------------------------------------------------------------
// CLASE API CLIENT
// ----------------------------------------------------------------------------

export class ApiClientImpl implements ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create(config);
    this.setupInterceptors();
  }

  // ----------------------------------------------------------------------------
  // CONFIGURACIÓN DE INTERCEPTORS
  // ----------------------------------------------------------------------------

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        console.log('API Request - Token:', token ? 'Presente' : 'Ausente');
        console.log('API Request - URL:', config.url);
        console.log('API Request - Method:', config.method);
        console.log('API Request - Data:', config.data);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // ----------------------------------------------------------------------------
  // MÉTODOS HTTP
  // ----------------------------------------------------------------------------

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ----------------------------------------------------------------------------
  // MÉTODOS DE UTILIDAD
  // ----------------------------------------------------------------------------

  private transformResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    const { data } = response;
    
    // Si la respuesta ya tiene el formato ApiResponse, la devolvemos tal como está
    if (data && typeof data === 'object' && 'success' in data) {
      return data;
    }

    // Si no, la transformamos al formato esperado
    return {
      success: true,
      data: data as T,
      message: 'Operación exitosa',
    };
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      
      return {
        message: data?.message || `Error ${status}: ${this.getStatusText(status)}`,
        code: status.toString(),
        details: data,
      };
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Error de configuración
      return {
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private handleApiError(error: any): void {
    // Aquí puedes implementar logging, notificaciones, etc.
    console.error('API Error:', error);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      400: 'Solicitud incorrecta',
      401: 'No autorizado',
      403: 'Prohibido',
      404: 'No encontrado',
      500: 'Error interno del servidor',
      502: 'Puerta de enlace incorrecta',
      503: 'Servicio no disponible',
    };

    return statusTexts[status] || 'Error desconocido';
  }

  // ----------------------------------------------------------------------------
  // MÉTODOS PÚBLICOS DE UTILIDAD
  // ----------------------------------------------------------------------------

  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  getAuthTokenPublic(): string | null {
    return localStorage.getItem('auth_token');
  }
}

// ----------------------------------------------------------------------------
// INSTANCIA GLOBAL DE LA API
// ----------------------------------------------------------------------------

export const apiClient = new ApiClientImpl(apiConfig);

// ----------------------------------------------------------------------------
// FUNCIONES DE UTILIDAD PARA ENDPOINTS ESPECÍFICOS
// ----------------------------------------------------------------------------

export const api = {
  // Métodos HTTP básicos
  get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),

  // Métodos de autenticación
  setAuthToken: (token: string) => apiClient.setAuthToken(token),
  removeAuthToken: () => apiClient.removeAuthToken(),
  getAuthToken: () => apiClient.getAuthTokenPublic(),
} as const; 