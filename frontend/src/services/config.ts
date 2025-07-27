// ============================================================================
// SERVICIO DE CONFIGURACIÓN - Principio de Inversión de Dependencias
// ============================================================================

import type { AppConfig, FeatureFlags } from '../types';

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE LA APLICACIÓN
// ----------------------------------------------------------------------------

export const appConfig: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  appName: 'NEUSGI',
  version: '1.0.0',
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || 'development',
};

// ----------------------------------------------------------------------------
// FLAGS DE FUNCIONALIDADES
// ----------------------------------------------------------------------------

export const featureFlags: FeatureFlags = {
  enableNotifications: true,
  enableOfflineMode: false,
  enableAdvancedFilters: true,
};

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE API
// ----------------------------------------------------------------------------

export const apiConfig = {
  baseURL: appConfig.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE RUTAS
// ----------------------------------------------------------------------------

export const routes = {
  // Autenticación
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
  },
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Módulos principales
  presupuestos: '/presupuestos',
  ordenesCompra: '/ordenes-compra',
  partesDiario: '/partes-diario',
  remitos: '/remitos',
  facturas: '/facturas',
  pagos: '/pagos',
  
  // Gestión
  clientes: '/clientes',
  equipos: '/equipos',
  usuarios: '/usuarios',
  
  // Reportes
  reportes: '/reportes',
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE PAGINACIÓN
// ----------------------------------------------------------------------------

export const paginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  maxPageSize: 100,
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE NOTIFICACIONES
// ----------------------------------------------------------------------------

export const notificationConfig = {
  defaultDuration: 5000,
  maxNotifications: 5,
  positions: {
    top: 'top',
    bottom: 'bottom',
    topRight: 'top-right',
    topLeft: 'top-left',
    bottomRight: 'bottom-right',
    bottomLeft: 'bottom-left',
  },
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE VALIDACIÓN
// ----------------------------------------------------------------------------

export const validationConfig = {
  // Longitudes mínimas y máximas
  minLength: {
    name: 2,
    email: 5,
    password: 6,
    description: 10,
  },
  maxLength: {
    name: 100,
    email: 255,
    description: 1000,
    address: 500,
  },
  
  // Patrones de validación
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-()]+$/,
    cuit: /^\d{2}-\d{8}-\d$/,
    licensePlate: /^[A-Z]{2}\d{3}[A-Z]{2}$/,
  },
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE FECHAS
// ----------------------------------------------------------------------------

export const dateConfig = {
  format: 'DD/MM/YYYY',
  formatWithTime: 'DD/MM/YYYY HH:mm',
  formatForInput: 'YYYY-MM-DD',
  locale: 'es-AR',
  timezone: 'America/Argentina/Buenos_Aires',
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE ARCHIVOS
// ----------------------------------------------------------------------------

export const fileConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  uploadPath: '/uploads',
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE CACHE
// ----------------------------------------------------------------------------

export const cacheConfig = {
  // Tiempo de vida del cache en milisegundos
  ttl: {
    short: 5 * 60 * 1000, // 5 minutos
    medium: 30 * 60 * 1000, // 30 minutos
    long: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Claves de cache
  keys: {
    user: 'user',
    clients: 'clients',
    equipments: 'equipments',
    presupuestos: 'presupuestos',
    ordenesCompra: 'ordenes-compra',
  },
} as const;

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE TEMA
// ----------------------------------------------------------------------------

export const themeConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// ----------------------------------------------------------------------------
// FUNCIONES DE UTILIDAD
// ----------------------------------------------------------------------------

export const isDevelopment = () => appConfig.environment === 'development';
export const isProduction = () => appConfig.environment === 'production';
export const isStaging = () => appConfig.environment === 'staging';

export const getApiUrl = (endpoint: string) => `${appConfig.apiUrl}${endpoint}`;

export const getFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
}; 