import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BranchController } from './branch.controller';
import { BranchService } from '../../../application/services/branch.service';

import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';

describe('BranchController', () => {
    let controller: BranchController;

    const branchServiceMock = {
        obtenerActivas: jest.fn(),
        obtenerTodas: jest.fn(),
        obtenerPorId: jest.fn(),
        crear: jest.fn(),
        actualizar: jest.fn(),
        eliminar: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule =
            await Test.createTestingModule({
                controllers: [BranchController],
                providers: [
                    {
                        provide: BranchService,
                        useValue: branchServiceMock,
                    },
                ],
            })
                .overrideGuard(JwtAuthGuard)
                .useValue({
                    canActivate: jest.fn().mockReturnValue(true),
                })
                .overrideGuard(RolesGuard)
                .useValue({
                    canActivate: jest.fn().mockReturnValue(true),
                })
                .compile();

        controller = module.get<BranchController>(BranchController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================
    // GET /sucursales/activas
    // =========================================================

    describe('obtenerActivas', () => {
        it('debe retornar las sucursales activas', async () => {
            const sucursales = [
                {
                    id: 1,
                    nombre: 'Sucursal Centro',
                    ciudad: 'Medellín',
                    telefono: '3001234567',
                    direccion: 'Carrera 1 # 10-20',
                    is_active: true,
                },
                {
                    id: 2,
                    nombre: 'Sucursal Norte',
                    ciudad: 'Bello',
                    telefono: '3007654321',
                    direccion: 'Carrera 50 # 20-30',
                    is_active: true,
                },
            ];

            branchServiceMock.obtenerActivas.mockResolvedValue(
                sucursales,
            );

            const resultado = await controller.obtenerActivas();

            expect(resultado).toEqual(sucursales);
            expect(
                branchServiceMock.obtenerActivas,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.obtenerActivas,
            ).toHaveBeenCalledWith();
        });
    });

    // =========================================================
    // GET /sucursales?activas=true|false
    // =========================================================

    describe('obtenerTodas', () => {
        it('debe retornar todas las sucursales cuando no se proporciona el filtro', async () => {
            const sucursales = [
                {
                    id: 1,
                    nombre: 'Sucursal Centro',
                    ciudad: 'Medellín',
                    is_active: true,
                },
                {
                    id: 2,
                    nombre: 'Sucursal Sur',
                    ciudad: 'Envigado',
                    is_active: false,
                },
            ];

            branchServiceMock.obtenerTodas.mockResolvedValue(
                sucursales,
            );

            const resultado = await controller.obtenerTodas();

            expect(resultado).toEqual(sucursales);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledWith(undefined);
        });

        it('debe consultar únicamente las sucursales activas cuando activas=true', async () => {
            const sucursales = [
                {
                    id: 1,
                    nombre: 'Sucursal Centro',
                    ciudad: 'Medellín',
                    is_active: true,
                },
            ];

            branchServiceMock.obtenerTodas.mockResolvedValue(
                sucursales,
            );

            const resultado =
                await controller.obtenerTodas('true');

            expect(resultado).toEqual(sucursales);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledWith(true);
        });

        it('debe consultar únicamente las sucursales inactivas cuando activas=false', async () => {
            const sucursales = [
                {
                    id: 2,
                    nombre: 'Sucursal Sur',
                    ciudad: 'Envigado',
                    is_active: false,
                },
            ];

            branchServiceMock.obtenerTodas.mockResolvedValue(
                sucursales,
            );

            const resultado =
                await controller.obtenerTodas('false');

            expect(resultado).toEqual(sucursales);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.obtenerTodas,
            ).toHaveBeenCalledWith(false);
        });

        it('debe lanzar BadRequestException cuando activas tiene un valor inválido', async () => {
            await expect(
                controller.obtenerTodas('banana'),
            ).rejects.toThrow(BadRequestException);

            expect(
                branchServiceMock.obtenerTodas,
            ).not.toHaveBeenCalled();
        });
    });

    // =========================================================
    // GET /sucursales/:id
    // =========================================================

    describe('obtenerPorId', () => {
        it('debe retornar una sucursal por su identificador', async () => {
            const sucursal = {
                id: 1,
                nombre: 'Sucursal Centro',
                ciudad: 'Medellín',
                telefono: '3001234567',
                direccion: 'Carrera 1 # 10-20',
                is_active: true,
            };

            branchServiceMock.obtenerPorId.mockResolvedValue(
                sucursal,
            );

            const resultado = await controller.obtenerPorId(1);

            expect(resultado).toEqual(sucursal);
            expect(
                branchServiceMock.obtenerPorId,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.obtenerPorId,
            ).toHaveBeenCalledWith(1);
        });
    });

    // =========================================================
    // POST /sucursales
    // =========================================================

    describe('crear', () => {
        it('debe crear una sucursal', async () => {
            const dto = {
                nombre: 'Sucursal Centro',
                ciudad: 'Medellín',
                telefono: '3001234567',
                direccion: 'Carrera 1 # 10-20',
                companyId: 1,
            };

            const sucursalCreada = {
                id: 1,
                nombre: 'Sucursal Centro',
                ciudad: 'Medellín',
                telefono: '3001234567',
                direccion: 'Carrera 1 # 10-20',
                is_active: true,
            };

            branchServiceMock.crear.mockResolvedValue(
                sucursalCreada,
            );

            const resultado = await controller.crear(dto);

            expect(resultado).toEqual(sucursalCreada);
            expect(
                branchServiceMock.crear,
            ).toHaveBeenCalledTimes(1);
            expect(
                branchServiceMock.crear,
            ).toHaveBeenCalledWith(dto);
        });
    });

    // =========================================================
    // PATCH /sucursales/:id
    // =========================================================

    describe('actualizar', () => {
        it('debe actualizar una sucursal', async () => {
            const id = 1;

            const dto = {
                nombre: 'Sucursal Centro Actualizada',
                ciudad: 'Medellín',
                telefono: '3111234567',
                direccion: 'Calle 10 # 20-30',
            };

            const sucursalActualizada = {
                id,
                nombre: 'Sucursal Centro Actualizada',
                ciudad: 'Medellín',
                telefono: '3111234567',
                direccion: 'Calle 10 # 20-30',
                is_active: true,
            };

            branchServiceMock.actualizar.mockResolvedValue(
                sucursalActualizada,
            );

            const resultado = await controller.actualizar(
                id,
                dto,
            );

            expect(resultado).toEqual(
                sucursalActualizada,
            );

            expect(
                branchServiceMock.actualizar,
            ).toHaveBeenCalledTimes(1);

            expect(
                branchServiceMock.actualizar,
            ).toHaveBeenCalledWith(id, dto);
        });
    });

    // =========================================================
    // DELETE /sucursales/:id
    // =========================================================

    describe('eliminar', () => {
        it('debe inactivar una sucursal', async () => {
            const id = 1;

            branchServiceMock.eliminar.mockResolvedValue(
                undefined,
            );

            const resultado =
                await controller.eliminar(id);

            expect(resultado).toBeUndefined();

            expect(
                branchServiceMock.eliminar,
            ).toHaveBeenCalledTimes(1);

            expect(
                branchServiceMock.eliminar,
            ).toHaveBeenCalledWith(id);
        });
    });
});