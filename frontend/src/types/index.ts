// ============================================================================
// TIPOS BASE DEL SISTEMA - Principio de Responsabilidad Única
// ============================================================================

// ----------------------------------------------------------------------------
// TIPOS DE ENTIDADES PRINCIPALES
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos para Cliente (coinciden con el backend)
export interface Cliente {
  id: number;
  nombreEmpresa: string;
  rutCuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuarioId?: number;
}

export interface CreateClienteDto {
  nombreEmpresa: string;
  rutCuit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuarioId?: number;
}

export interface UpdateClienteDto {
  nombreEmpresa?: string;
  rutCuit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  usuarioId?: number;
}

// Tipos para imágenes de equipos
export interface EquipoImagen {
  descripcion: string;
  url: string;
  destacada: boolean;
}

// Tipos para Equipo (coinciden con el backend)
export interface Equipo {
  id: number;
  patente: string;
  modelo: string;
  capacidadKg: number;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

export interface CreateEquipoDto {
  patente: string;
  modelo: string;
  capacidadKg: number;
  estado?: 'disponible' | 'ocupado' | 'mantenimiento';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

export interface UpdateEquipoDto {
  patente?: string;
  modelo?: string;
  capacidadKg?: number;
  estado?: 'disponible' | 'ocupado' | 'mantenimiento';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

// Tipos para Presupuesto (coinciden con el backend)
export interface Presupuesto {
  id: number;
  clienteId: number;
  equipoId: number;
  usuarioId: number;
  descripcion: string;
  costo: number;
  validoHasta: Date;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  creadoEn: Date;
  // Relaciones
  cliente?: Cliente;
  equipo?: Equipo;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface CreatePresupuestoDto {
  clienteId: number;
  equipoId: number;
  usuarioId?: number; // Se asigna automáticamente desde el backend
  descripcion: string;
  costo: number;
  validoHasta: Date;
  estado?: 'pendiente' | 'aceptado' | 'rechazado';
}

export interface UpdatePresupuestoDto {
  clienteId?: number;
  equipoId?: number;
  usuarioId?: number;
  descripcion?: string;
  costo?: number;
  validoHasta?: Date;
  estado?: 'pendiente' | 'aceptado' | 'rechazado';
}

// Mantener Client para compatibilidad
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cuit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  capacity: number;
  status: EquipmentStatus;
  licensePlate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface OrdenCompra {
  id: string;
  presupuestoId: string;
  number: string;
  status: OrdenCompraStatus;
  approvedAt: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  presupuesto?: Presupuesto;
}

export interface ParteDiario {
  id: string;
  ordenCompraId: string;
  date: string;
  kilometers: number;
  hours: number;
  description: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  ordenCompra?: OrdenCompra;
}

export interface Remito {
  id: string;
  ordenCompraId: string;
  number: string;
  date: string;
  description: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  ordenCompra?: OrdenCompra;
}

export interface Factura {
  id: string;
  ordenCompraId: string;
  number: string;
  amount: number;
  status: FacturaStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  ordenCompra?: OrdenCompra;
}

export interface Pago {
  id: string;
  facturaId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  factura?: Factura;
}

// ----------------------------------------------------------------------------
// ENUMS Y CONSTANTES
// ----------------------------------------------------------------------------

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  DRIVER: 'DRIVER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const EquipmentType = {
  CAMION: 'CAMION',
  CAMIONETA: 'CAMIONETA',
  TRACTOR: 'TRACTOR',
  EXCAVADORA: 'EXCAVADORA'
} as const;

export type EquipmentType = typeof EquipmentType[keyof typeof EquipmentType];

export const EquipmentStatus = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO: 'OCUPADO',
  MANTENIMIENTO: 'MANTENIMIENTO'
} as const;

export type EquipmentStatus = typeof EquipmentStatus[keyof typeof EquipmentStatus];

export const PresupuestoStatus = {
  PENDIENTE: 'PENDIENTE',
  EN_OBRA: 'EN_OBRA',
  CERRADO: 'CERRADO',
  CANCELADO: 'CANCELADO'
} as const;

export type PresupuestoStatus = typeof PresupuestoStatus[keyof typeof PresupuestoStatus];

export const OrdenCompraStatus = {
  ACTIVA: 'ACTIVA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA'
} as const;

export type OrdenCompraStatus = typeof OrdenCompraStatus[keyof typeof OrdenCompraStatus];

export const FacturaStatus = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
  CANCELADA: 'CANCELADA'
} as const;

export type FacturaStatus = typeof FacturaStatus[keyof typeof FacturaStatus];

export const PaymentMethod = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  TARJETA: 'TARJETA',
  CHEQUE: 'CHEQUE',
  OTRO: 'OTRO'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// ----------------------------------------------------------------------------
// TIPOS DE API Y RESPUESTAS
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de paginación (coinciden con el backend)
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// TIPOS DE FORMULARIOS
// ----------------------------------------------------------------------------

export interface LoginForm {
  email: string;
  password: string;
}

export interface PresupuestoForm {
  clientId: string;
  equipmentId: string;
  description: string;
  totalAmount: number;
  validUntil: string;
}

export interface OrdenCompraForm {
  presupuestoId: string;
  number: string;
  documentUrl?: string;
}

export interface ParteDiarioForm {
  ordenCompraId: string;
  date: string;
  kilometers: number;
  hours: number;
  description: string;
  location?: string;
}

// ----------------------------------------------------------------------------
// TIPOS DE ESTADO GLOBAL
// ----------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// ----------------------------------------------------------------------------
// TIPOS DE UTILIDADES
// ----------------------------------------------------------------------------

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  secondValue?: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// ----------------------------------------------------------------------------
// TIPOS DE CONFIGURACIÓN
// ----------------------------------------------------------------------------

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

export interface FeatureFlags {
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableAdvancedFilters: boolean;
} 