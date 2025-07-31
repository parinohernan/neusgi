import { CategoriaRepository } from '../repositories/CategoriaRepository';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export class CategoriaService {
  private categoriaRepository: CategoriaRepository;

  constructor(categoriaRepository: CategoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async getAllCategorias(): Promise<Categoria[]> {
    return this.categoriaRepository.findAll();
  }

  async getCategoriaById(id: number): Promise<Categoria | null> {
    return this.categoriaRepository.findById(id);
  }

  async getCategoriaByNombre(nombre: string): Promise<Categoria | null> {
    return this.categoriaRepository.findByNombre(nombre);
  }

  async createCategoria(data: CreateCategoriaDto): Promise<Categoria> {
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategoria = await this.categoriaRepository.findByNombre(data.nombre);
    if (existingCategoria) {
      throw new Error(`Ya existe una categoría con el nombre "${data.nombre}"`);
    }

    return this.categoriaRepository.create(data);
  }

  async updateCategoria(id: number, data: UpdateCategoriaDto): Promise<Categoria | null> {
    // Verificar si la categoría existe
    const existingCategoria = await this.categoriaRepository.findById(id);
    if (!existingCategoria) {
      throw new Error(`No se encontró la categoría con ID ${id}`);
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (data.nombre && data.nombre !== existingCategoria.nombre) {
      const categoriaConMismoNombre = await this.categoriaRepository.findByNombre(data.nombre);
      if (categoriaConMismoNombre) {
        throw new Error(`Ya existe una categoría con el nombre "${data.nombre}"`);
      }
    }

    return this.categoriaRepository.update(id, data);
  }

  async deleteCategoria(id: number): Promise<boolean> {
    // Verificar si la categoría existe
    const existingCategoria = await this.categoriaRepository.findById(id);
    if (!existingCategoria) {
      throw new Error(`No se encontró la categoría con ID ${id}`);
    }

    // Intentar soft delete primero
    const softDeleted = await this.categoriaRepository.softDelete(id);
    if (!softDeleted) {
      // Si falla el soft delete, intentar delete físico
      return this.categoriaRepository.delete(id);
    }

    return true;
  }

  async getCategoriasActivas(): Promise<Categoria[]> {
    return this.categoriaRepository.getCategoriasActivas();
  }

  async getTotalCategorias(): Promise<number> {
    return this.categoriaRepository.count();
  }
} 