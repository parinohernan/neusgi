import { EmpresaRepository } from '@/repositories/EmpresaRepository';
import { Empresa } from '@/types';

export class EmpresaService {
  private empresaRepository: EmpresaRepository;

  constructor(empresaRepository: EmpresaRepository) {
    this.empresaRepository = empresaRepository;
  }

  async getEmpresaActiva(): Promise<Empresa | null> {
    return await this.empresaRepository.findActiva();
  }

  async getById(id: number): Promise<Empresa | null> {
    return await this.empresaRepository.findById(id);
  }

  async getAll(): Promise<Empresa[]> {
    return await this.empresaRepository.findAll();
  }
} 