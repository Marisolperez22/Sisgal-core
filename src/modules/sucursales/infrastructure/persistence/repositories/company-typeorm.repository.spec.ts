import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyTypeOrmRepository } from './company-typeorm.repository';
import { Company } from '../../../../../entities/company.model';

describe('CompanyTypeOrmRepository', () => {
  let repository: CompanyTypeOrmRepository;

  const companyRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyTypeOrmRepository,
        {
          provide: getRepositoryToken(Company),
          useValue: companyRepositoryMock,
        },
      ],
    }).compile();

    repository = module.get<CompanyTypeOrmRepository>(
      CompanyTypeOrmRepository,
    );
  });

  describe('findAll', () => {
    it('debe retornar todas las empresas ordenadas por nombre', async () => {
      const empresas = [
        {
          id: 1,
          name: 'Empresa A',
        },
        {
          id: 2,
          name: 'Empresa B',
        },
      ] as Company[];

      companyRepositoryMock.find.mockResolvedValue(empresas);

      const resultado = await repository.findAll();

      expect(resultado).toEqual(empresas);

      expect(companyRepositoryMock.find).toHaveBeenCalledWith({
        order: {
          name: 'ASC',
        },
      });
    });

    it('debe retornar una lista vacía cuando no existen empresas', async () => {
      companyRepositoryMock.find.mockResolvedValue([]);

      const resultado = await repository.findAll();

      expect(resultado).toEqual([]);

      expect(companyRepositoryMock.find).toHaveBeenCalledWith({
        order: {
          name: 'ASC',
        },
      });
    });

    it('debe propagar el error del repositorio', async () => {
      const error = new Error('Error de base de datos');

      companyRepositoryMock.find.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(
        'Error de base de datos',
      );

      expect(companyRepositoryMock.find).toHaveBeenCalledWith({
        order: {
          name: 'ASC',
        },
      });
    });
  });

  describe('findById', () => {
    it('debe retornar la empresa cuando existe', async () => {
      const empresa = {
        id: 1,
        name: 'Empresa A',
      } as Company;

      companyRepositoryMock.findOne.mockResolvedValue(empresa);

      const resultado = await repository.findById(1);

      expect(resultado).toEqual(empresa);

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('debe retornar null cuando la empresa no existe', async () => {
      companyRepositoryMock.findOne.mockResolvedValue(null);

      const resultado = await repository.findById(999);

      expect(resultado).toBeNull();

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
    });

    it('debe propagar el error del repositorio', async () => {
      const error = new Error('Error de base de datos');

      companyRepositoryMock.findOne.mockRejectedValue(error);

      await expect(repository.findById(1)).rejects.toThrow(
        'Error de base de datos',
      );

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });
  });

  describe('findByName', () => {
    it('debe retornar la empresa cuando existe', async () => {
      const empresa = {
        id: 1,
        name: 'Empresa A',
      } as Company;

      companyRepositoryMock.findOne.mockResolvedValue(empresa);

      const resultado = await repository.findByName('Empresa A');

      expect(resultado).toEqual(empresa);

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Empresa A',
        },
      });
    });

    it('debe retornar null cuando la empresa no existe', async () => {
      companyRepositoryMock.findOne.mockResolvedValue(null);

      const resultado = await repository.findByName('Empresa inexistente');

      expect(resultado).toBeNull();

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Empresa inexistente',
        },
      });
    });

    it('debe propagar el error del repositorio', async () => {
      const error = new Error('Error de base de datos');

      companyRepositoryMock.findOne.mockRejectedValue(error);

      await expect(
        repository.findByName('Empresa A'),
      ).rejects.toThrow('Error de base de datos');

      expect(companyRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Empresa A',
        },
      });
    });
  });
});