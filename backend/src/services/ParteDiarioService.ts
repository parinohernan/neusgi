import Joi from 'joi';
import { ParteDiarioRepository } from '@/repositories/ParteDiarioRepository';
import { ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto, ParteDiarioFilters, PaginatedResponse } from '@/types';
import { IBaseService } from './interfaces/IBaseService';

export class ParteDiarioService implements IBaseService<ParteDiario, CreateParteDiarioDto, UpdateParteDiarioDto> {
  private parteDiarioRepository: ParteDiarioRepository;

  constructor(parteDiarioRepository: ParteDiarioRepository) {
    this.parteDiarioRepository = parteDiarioRepository;
  }

  // Esquemas de validación
  private createSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
      'any.required': 'El ID de la orden de compra es requerido',
    }),
    fecha: Joi.date().max('now').required().messages({
      'date.base': 'La fecha debe ser una fecha válida',
      'date.max': 'La fecha no puede ser futura',
      'any.required': 'La fecha es requerida',
    }),
    kmInicial: Joi.number().min(0).required().messages({
      'number.base': 'Los km iniciales deben ser un número',
      'number.min': 'Los km iniciales no pueden ser negativos',
      'any.required': 'Los km iniciales son requeridos',
    }),
    kmFinal: Joi.number().min(Joi.ref('kmInicial')).required().messages({
      'number.base': 'Los km finales deben ser un número',
      'number.min': 'Los km finales deben ser mayores o iguales a los km iniciales',
      'any.required': 'Los km finales son requeridos',
    }),
    kmRecorridos: Joi.number().min(0).optional().messages({
      'number.base': 'Los km recorridos deben ser un número',
      'number.min': 'Los km recorridos no pueden ser negativos',
    }),
    horasTrabajadas: Joi.number().min(0).max(24).required().messages({
      'number.base': 'Las horas trabajadas deben ser un número',
      'number.min': 'Las horas trabajadas no pueden ser negativas',
      'number.max': 'Las horas trabajadas no pueden exceder 24 horas',
      'any.required': 'Las horas trabajadas son requeridas',
    }),
    combustibleConsumido: Joi.number().min(0).optional().messages({
      'number.base': 'El combustible consumido debe ser un número',
      'number.min': 'El combustible consumido no puede ser negativo',
    }),
    incidencias: Joi.string().max(1000).optional().messages({
      'string.max': 'Las incidencias no pueden exceder 1000 caracteres',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
  });

  private updateSchema = Joi.object({
    ordenCompraId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de la orden de compra debe ser un número',
      'number.integer': 'El ID de la orden de compra debe ser un número entero',
      'number.positive': 'El ID de la orden de compra debe ser positivo',
    }),
    fecha: Joi.date().max('now').optional().messages({
      'date.base': 'La fecha debe ser una fecha válida',
      'date.max': 'La fecha no puede ser futura',
    }),
    kmInicial: Joi.number().min(0).optional().messages({
      'number.base': 'Los km iniciales deben ser un número',
      'number.min': 'Los km iniciales no pueden ser negativos',
    }),
    kmFinal: Joi.number().min(0).optional().messages({
      'number.base': 'Los km finales deben ser un número',
      'number.min': 'Los km finales no pueden ser negativos',
    }),
    kmRecorridos: Joi.number().min(0).optional().messages({
      'number.base': 'Los km recorridos deben ser un número',
      'number.min': 'Los km recorridos no pueden ser negativos',
    }),
    horasTrabajadas: Joi.number().min(0).max(24).optional().messages({
      'number.base': 'Las horas trabajadas deben ser un número',
      'number.min': 'Las horas trabajadas no pueden ser negativas',
      'number.max': 'Las horas trabajadas no pueden exceder 24 horas',
    }),
    combustibleConsumido: Joi.number().min(0).optional().messages({
      'number.base': 'El combustible consumido debe ser un número',
      'number.min': 'El combustible consumido no puede ser negativo',
    }),
    incidencias: Joi.string().max(1000).optional().messages({
      'string.max': 'Las incidencias no pueden exceder 1000 caracteres',
    }),
    observaciones: Joi.string().max(1000).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
    archivosAdjuntos: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Los archivos adjuntos deben ser un array',
      'string.uri': 'Cada archivo adjunto debe ser una URL válida',
    }),
  });

  async getAll(filters?: ParteDiarioFilters): Promise<PaginatedResponse<ParteDiario>> {
    return this.parteDiarioRepository.findAll(filters);
  }

  async getById(id: number): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }
    return this.parteDiarioRepository.findById(id);
  }

  async create(data: CreateParteDiarioDto): Promise<ParteDiario> {
    // Validar datos
    const validation = this.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar que la orden de compra existe y está activa
    // TODO: Implementar verificación cuando se tenga acceso al repositorio de órdenes de compra

    // Verificar que no hay otro parte diario para la misma orden de compra en la misma fecha
    const partesExistentes = await this.parteDiarioRepository.findByOrdenCompra(data.ordenCompraId);
    const parteExistente = partesExistentes.find(p => 
      p.fecha.toDateString() === data.fecha.toDateString()
    );
    if (parteExistente) {
      throw new Error('Ya existe un parte diario para esta orden de compra en la fecha especificada');
    }

    // Validar que los km finales son mayores que los iniciales
    if (data.kmFinal <= data.kmInicial) {
      throw new Error('Los km finales deben ser mayores que los km iniciales');
    }

    return this.parteDiarioRepository.create(data);
  }

  async update(id: number, data: UpdateParteDiarioDto): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }

    // Validar datos
    const validation = this.validateUpdate(data);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Verificar si el parte diario existe
    const parteExistente = await this.parteDiarioRepository.findById(id);
    if (!parteExistente) {
      throw new Error('Parte diario no encontrado');
    }

    // Si se está cambiando la fecha, verificar que no hay conflicto
    if (data.fecha) {
      const ordenCompraId = data.ordenCompraId || parteExistente.ordenCompraId;
      const partesExistentes = await this.parteDiarioRepository.findByOrdenCompra(ordenCompraId);
      const parteConflicto = partesExistentes.find(p => 
        p.id !== id && p.fecha.toDateString() === data.fecha!.toDateString()
      );
      if (parteConflicto) {
        throw new Error('Ya existe un parte diario para esta orden de compra en la fecha especificada');
      }
    }

    // Si se están actualizando km inicial o final, validar que final > inicial
    if (data.kmInicial !== undefined || data.kmFinal !== undefined) {
      const kmInicial = data.kmInicial ?? parteExistente.kmInicial;
      const kmFinal = data.kmFinal ?? parteExistente.kmFinal;
      if (kmFinal <= kmInicial) {
        throw new Error('Los km finales deben ser mayores que los km iniciales');
      }
    }

    return this.parteDiarioRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }

    // Verificar si el parte diario existe
    const parteExistente = await this.parteDiarioRepository.findById(id);
    if (!parteExistente) {
      throw new Error('Parte diario no encontrado');
    }

    return this.parteDiarioRepository.delete(id);
  }

  validateCreate(data: CreateParteDiarioDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const { error } = this.createSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }

    return { isValid: true, errors: [] };
  }

  validateUpdate(data: UpdateParteDiarioDto): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const { error } = this.updateSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }

    return { isValid: true, errors: [] };
  }

  async exists(id: number): Promise<boolean> {
    return this.parteDiarioRepository.exists(id);
  }

  // Métodos específicos para partes diarios
  async findByOrdenCompra(ordenCompraId: number): Promise<ParteDiario[]> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.parteDiarioRepository.findByOrdenCompra(ordenCompraId);
  }

  async findByFecha(fecha: Date): Promise<ParteDiario[]> {
    if (!fecha || isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }
    return this.parteDiarioRepository.findByFecha(fecha);
  }

  async findByRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<ParteDiario[]> {
    if (!fechaInicio || isNaN(fechaInicio.getTime())) {
      throw new Error('Fecha de inicio inválida');
    }
    if (!fechaFin || isNaN(fechaFin.getTime())) {
      throw new Error('Fecha de fin inválida');
    }
    if (fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    return this.parteDiarioRepository.findByRangoFechas(fechaInicio, fechaFin);
  }

  async getPartesDiarioPorMes(anio: number, mes: number): Promise<ParteDiario[]> {
    if (anio < 1900 || anio > 2100) {
      throw new Error('Año inválido');
    }
    if (mes < 1 || mes > 12) {
      throw new Error('Mes inválido');
    }
    return this.parteDiarioRepository.getPartesDiarioPorMes(anio, mes);
  }

  async getPartesDiarioPorSemana(fecha: Date): Promise<ParteDiario[]> {
    if (!fecha || isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }
    return this.parteDiarioRepository.getPartesDiarioPorSemana(fecha);
  }

  async getEstadisticasPorOrdenCompra(ordenCompraId: number): Promise<{
    totalPartes: number;
    totalKmRecorridos: number;
    totalHorasTrabajadas: number;
    totalCombustible: number;
    promedioKmPorDia: number;
    promedioHorasPorDia: number;
  }> {
    if (!ordenCompraId || isNaN(ordenCompraId)) {
      throw new Error('ID de orden de compra inválido');
    }
    return this.parteDiarioRepository.getEstadisticasPorOrdenCompra(ordenCompraId);
  }

  async getEstadisticasGenerales(fechaInicio?: Date, fechaFin?: Date): Promise<{
    totalPartes: number;
    totalKmRecorridos: number;
    totalHorasTrabajadas: number;
    totalCombustible: number;
    promedioKmPorParte: number;
    promedioHorasPorParte: number;
  }> {
    if (fechaInicio && isNaN(fechaInicio.getTime())) {
      throw new Error('Fecha de inicio inválida');
    }
    if (fechaFin && isNaN(fechaFin.getTime())) {
      throw new Error('Fecha de fin inválida');
    }
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    return this.parteDiarioRepository.getEstadisticasGenerales(fechaInicio, fechaFin);
  }

  // Métodos de negocio específicos
  async agregarArchivoAdjunto(id: number, urlArchivo: string): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    // Validar que es una URL válida
    try {
      new URL(urlArchivo);
    } catch {
      throw new Error('URL del archivo inválida');
    }

    const parteExistente = await this.parteDiarioRepository.findById(id);
    if (!parteExistente) {
      throw new Error('Parte diario no encontrado');
    }

    const archivosAdjuntos = parteExistente.archivosAdjuntos || [];
    archivosAdjuntos.push(urlArchivo);

    return this.parteDiarioRepository.update(id, { archivosAdjuntos });
  }

  async removerArchivoAdjunto(id: number, urlArchivo: string): Promise<ParteDiario | null> {
    if (!id || isNaN(id)) {
      throw new Error('ID de parte diario inválido');
    }

    if (!urlArchivo || !urlArchivo.trim()) {
      throw new Error('URL del archivo es requerida');
    }

    const parteExistente = await this.parteDiarioRepository.findById(id);
    if (!parteExistente) {
      throw new Error('Parte diario no encontrado');
    }

    const archivosAdjuntos = parteExistente.archivosAdjuntos || [];
    const archivosFiltrados = archivosAdjuntos.filter(url => url !== urlArchivo);

    if (archivosFiltrados.length === archivosAdjuntos.length) {
      throw new Error('El archivo especificado no existe en este parte diario');
    }

    return this.parteDiarioRepository.update(id, { archivosAdjuntos: archivosFiltrados });
  }

  async calcularKmRecorridos(kmInicial: number, kmFinal: number): Promise<number> {
    if (kmInicial < 0 || kmFinal < 0) {
      throw new Error('Los km no pueden ser negativos');
    }
    if (kmFinal <= kmInicial) {
      throw new Error('Los km finales deben ser mayores que los km iniciales');
    }
    return kmFinal - kmInicial;
  }
} 