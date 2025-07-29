// Tipos base para toda la aplicación
export interface BaseEntity {
  id: number;
}

// Tipos para Usuario
export interface Usuario extends BaseEntity {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'admin' | 'logistica' | 'cliente_externo';
  creadoEn: Date;
}

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'logistica' | 'cliente_externo';
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: 'admin' | 'logistica' | 'cliente_externo';
}

// Tipos para Cliente
export interface Cliente extends BaseEntity {
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

// Tipos para Equipo
export interface Equipo extends BaseEntity {
  patente: string;
  modelo: string;
  capacidadKg: number;
  estado: 'disponible' | 'mantenimiento' | 'ocupado';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

export interface CreateEquipoDto {
  patente: string;
  modelo: string;
  capacidadKg: number;
  estado?: 'disponible' | 'mantenimiento' | 'ocupado';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

export interface UpdateEquipoDto {
  patente?: string;
  modelo?: string;
  capacidadKg?: number;
  estado?: 'disponible' | 'mantenimiento' | 'ocupado';
  fechaUltimoMantenimiento?: Date;
  imagenes?: EquipoImagen[];
}

// Tipos para Presupuesto
export interface Presupuesto extends BaseEntity {
  clienteId: number;
  equipoId: number;
  usuarioId: number;
  descripcion: string;
  costo: number;
  validoHasta: Date;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  creadoEn: Date;
}

// Tipo extendido para Presupuesto con relaciones incluidas
export interface PresupuestoWithRelations extends Presupuesto {
  cliente?: {
    id: number;
    nombreEmpresa: string;
    rutCuit: string;
    email?: string;
  };
  equipo?: {
    id: number;
    patente: string;
    modelo: string;
    capacidadKg: number;
    estado: 'disponible' | 'mantenimiento' | 'ocupado';
  };
  usuario?: {
    id: number;
    nombre: string;
    email: string;
    rol: 'admin' | 'logistica' | 'cliente_externo';
  };
}

export interface CreatePresupuestoDto {
  clienteId: number;
  equipoId: number;
  usuarioId: number;
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

// Tipos para OrdenCompra
export interface OrdenCompra extends BaseEntity {
  presupuestoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  origen: string;
  destino: string;
  observaciones?: string;
  estado: 'activa' | 'completada' | 'cancelada';
}

export interface CreateOrdenCompraDto {
  presupuestoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  origen: string;
  destino: string;
  observaciones?: string;
  estado?: 'activa' | 'completada' | 'cancelada';
}

export interface UpdateOrdenCompraDto {
  presupuestoId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  origen?: string;
  destino?: string;
  observaciones?: string;
  estado?: 'activa' | 'completada' | 'cancelada';
}

// Tipos para ParteDiario
export interface ParteDiario extends BaseEntity {
  ordenCompraId: number;
  fecha: Date;
  kmInicial: number;
  kmFinal: number;
  kmRecorridos: number;
  horasTrabajadas: number;
  combustibleConsumido?: number;
  incidencias?: string;
  observaciones?: string;
  archivosAdjuntos?: string[]; // URLs de archivos (imágenes o PDFs)
  creadoEn: Date;
}

export interface CreateParteDiarioDto {
  ordenCompraId: number;
  fecha: Date;
  kmInicial: number;
  kmFinal: number;
  kmRecorridos?: number; // Se calcula automáticamente si no se proporciona
  horasTrabajadas: number;
  combustibleConsumido?: number;
  incidencias?: string;
  observaciones?: string;
  archivosAdjuntos?: string[]; // URLs de archivos
}

export interface UpdateParteDiarioDto {
  ordenCompraId?: number;
  fecha?: Date;
  kmInicial?: number;
  kmFinal?: number;
  kmRecorridos?: number;
  horasTrabajadas?: number;
  combustibleConsumido?: number;
  incidencias?: string;
  observaciones?: string;
  archivosAdjuntos?: string[]; // URLs de archivos
}

// Tipos para autenticación
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: Omit<Usuario, 'passwordHash'>;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para filtros
export interface PaginationQuery {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface EquipoFilters extends PaginationQuery {
  estado?: 'disponible' | 'mantenimiento' | 'ocupado';
  modelo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PresupuestoFilters extends PaginationQuery {
  estado?: 'pendiente' | 'aceptado' | 'rechazado';
  clienteId?: number;
  equipoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface OrdenCompraFilters extends PaginationQuery {
  estado?: 'activa' | 'completada' | 'cancelada';
  presupuestoId?: number;
  clienteId?: number;
  equipoId?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
}

export interface ParteDiarioFilters extends PaginationQuery {
  ordenCompraId?: number;
  presupuestoId?: number;
  clienteId?: number;
  equipoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  kmRecorridosMin?: number;
  kmRecorridosMax?: number;
  horasTrabajadasMin?: number;
  horasTrabajadasMax?: number;
}

// Tipos para Remito
export interface Remito extends BaseEntity {
  ordenCompraId: number;
  codigo: string;
  contenido: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado: 'pendiente' | 'entregado' | 'cancelado';
  creadoEn: Date;
}

export interface CreateRemitoDto {
  ordenCompraId: number;
  codigo: string;
  contenido: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado?: 'pendiente' | 'entregado' | 'cancelado';
}

export interface UpdateRemitoDto {
  ordenCompraId?: number;
  codigo?: string;
  contenido?: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado?: 'pendiente' | 'entregado' | 'cancelado';
}

export interface RemitoFilters extends PaginationQuery {
  ordenCompraId?: number | undefined;
  presupuestoId?: number | undefined;
  clienteId?: number | undefined;
  equipoId?: number | undefined;
  codigo?: string | undefined;
  estado?: 'pendiente' | 'entregado' | 'cancelado' | undefined;
  fechaDesde?: string | undefined;
  fechaHasta?: string | undefined;
}

// Tipos para Certificado
export interface Certificado extends BaseEntity {
  ordenCompraId: number;
  tipo: 'seguro' | 'habilitacion' | 'otros';
  codigo: string;
  descripcion: string;
  fechaVencimiento: Date;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado: 'activo' | 'vencido' | 'cancelado';
  creadoEn: Date;
}

export interface CreateCertificadoDto {
  ordenCompraId: number;
  tipo: 'seguro' | 'habilitacion' | 'otros';
  codigo: string;
  descripcion: string;
  fechaVencimiento: Date;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado?: 'activo' | 'vencido' | 'cancelado';
}

export interface UpdateCertificadoDto {
  ordenCompraId?: number;
  tipo?: 'seguro' | 'habilitacion' | 'otros';
  codigo?: string;
  descripcion?: string;
  fechaVencimiento?: Date;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  observaciones?: string;
  estado?: 'activo' | 'vencido' | 'cancelado';
}

export interface CertificadoFilters extends PaginationQuery {
  ordenCompraId?: number | undefined;
  presupuestoId?: number | undefined;
  clienteId?: number | undefined;
  equipoId?: number | undefined;
  tipo?: 'seguro' | 'habilitacion' | 'otros' | undefined;
  codigo?: string | undefined;
  estado?: 'activo' | 'vencido' | 'cancelado' | undefined;
  fechaVencimientoDesde?: string | undefined;
  fechaVencimientoHasta?: string | undefined;
  fechaDesde?: string | undefined;
  fechaHasta?: string | undefined;
}

// Tipos para Factura
export interface Factura extends BaseEntity {
  ordenCompraId: number;
  numeroFactura: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  montoPagado?: number;
  saldoPendiente?: number;
  concepto: string;
  observaciones?: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado: 'pendiente' | 'pagada' | 'cancelada';
  creadoEn: Date;
}

export interface CreateFacturaDto {
  ordenCompraId: number;
  numeroFactura: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  montoPagado?: number;
  saldoPendiente?: number;
  concepto: string;
  observaciones?: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado?: 'pendiente' | 'pagada' | 'cancelada';
}

export interface UpdateFacturaDto {
  ordenCompraId?: number;
  numeroFactura?: string;
  fechaEmision?: Date;
  fechaVencimiento?: Date;
  monto?: number;
  montoPagado?: number;
  saldoPendiente?: number;
  concepto?: string;
  observaciones?: string;
  pdfPath?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado?: 'pendiente' | 'pagada' | 'cancelada';
}

export interface FacturaFilters extends PaginationQuery {
  ordenCompraId?: number | undefined;
  presupuestoId?: number | undefined;
  clienteId?: number | undefined;
  equipoId?: number | undefined;
  numeroFactura?: string | undefined;
  estado?: 'pendiente' | 'pagada' | 'cancelada' | undefined;
  fechaEmisionDesde?: string | undefined;
  fechaEmisionHasta?: string | undefined;
  fechaVencimientoDesde?: string | undefined;
  fechaVencimientoHasta?: string | undefined;
  montoMin?: number | undefined;
  montoMax?: number | undefined;
  fechaDesde?: string | undefined;
  fechaHasta?: string | undefined;
}

// Tipos para Pago
export interface Pago extends BaseEntity {
  facturaId: number;
  monto: number;
  fechaPago: Date;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros';
  referencia?: string;
  observaciones?: string;
  comprobante?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado';
  procesadoPor?: number;
  creadoEn: Date;
}

export interface CreatePagoDto {
  facturaId: number;
  monto: number;
  fechaPago: Date;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros';
  referencia?: string;
  observaciones?: string;
  comprobante?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado?: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado';
  procesadoPor?: number;
}

export interface UpdatePagoDto {
  facturaId?: number;
  monto?: number;
  fechaPago?: Date;
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros';
  referencia?: string;
  observaciones?: string;
  comprobante?: string;
  archivosAdjuntos?: string[]; // URLs de archivos adjuntos
  estado?: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado';
  procesadoPor?: number;
}

export interface PagoFilters extends PaginationQuery {
  facturaId?: number | undefined;
  ordenCompraId?: number | undefined;
  presupuestoId?: number | undefined;
  clienteId?: number | undefined;
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta_credito' | 'tarjeta_debito' | 'otros' | undefined;
  estado?: 'pendiente' | 'confirmado' | 'rechazado' | 'cancelado' | undefined;
  procesadoPor?: number | undefined;
  fechaPagoDesde?: string | undefined;
  fechaPagoHasta?: string | undefined;
  montoMin?: number | undefined;
  montoMax?: number | undefined;
  fechaDesde?: string | undefined;
  fechaHasta?: string | undefined;
}

// Tipos para Cuenta Corriente
export interface CuentaCorriente extends BaseEntity {
  clienteId: number;
  tipoMovimiento: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros';
  referencia: string;
  descripcion: string;
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  fechaMovimiento: Date;
  fechaVencimiento?: Date;
  facturaId?: number;
  pagoId?: number;
  ordenCompraId?: number;
  observaciones?: string;
  estado: 'activo' | 'cancelado' | 'vencido';
  procesadoPor?: number;
  creadoEn: Date;
}

export interface CreateCuentaCorrienteDto {
  clienteId: number;
  tipoMovimiento: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros';
  referencia: string;
  descripcion: string;
  monto: number;
  saldoAnterior?: number; // Se calcula automáticamente si no se proporciona
  saldoNuevo?: number; // Se calcula automáticamente si no se proporciona
  fechaMovimiento: Date;
  fechaVencimiento?: Date;
  facturaId?: number;
  pagoId?: number;
  ordenCompraId?: number;
  observaciones?: string;
  estado?: 'activo' | 'cancelado' | 'vencido';
  procesadoPor?: number;
}

export interface UpdateCuentaCorrienteDto {
  clienteId?: number;
  tipoMovimiento?: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros';
  referencia?: string;
  descripcion?: string;
  monto?: number;
  saldoAnterior?: number;
  saldoNuevo?: number;
  fechaMovimiento?: Date;
  fechaVencimiento?: Date;
  facturaId?: number;
  pagoId?: number;
  ordenCompraId?: number;
  observaciones?: string;
  estado?: 'activo' | 'cancelado' | 'vencido';
  procesadoPor?: number;
}

export interface CuentaCorrienteFilters extends PaginationQuery {
  clienteId?: number | undefined;
  tipoMovimiento?: 'factura' | 'pago' | 'ajuste' | 'nota_credito' | 'nota_debito' | 'otros' | undefined;
  estado?: 'activo' | 'cancelado' | 'vencido' | undefined;
  procesadoPor?: number | undefined;
  facturaId?: number | undefined;
  pagoId?: number | undefined;
  ordenCompraId?: number | undefined;
  fechaMovimientoDesde?: string | undefined;
  fechaMovimientoHasta?: string | undefined;
  fechaVencimientoDesde?: string | undefined;
  fechaVencimientoHasta?: string | undefined;
  montoMin?: number | undefined;
  montoMax?: number | undefined;
  saldoMin?: number | undefined;
  saldoMax?: number | undefined;
  fechaDesde?: string | undefined;
  fechaHasta?: string | undefined;
}

// Tipos para PDF
export interface PdfData {
  content: string;
  filename: string;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
} 