import { AttendanceTodayService } from './attendance-today.service';

import { AttendanceRecordRepositoryPort } from '../../domain/ports/attendance-record.repository.port';

import { AuditPort } from 'src/application/ports/audit/audit.port';

import {
  AttendanceRecord,
  Branch,
  Employee,
  EmployeeBranchAssignment,
  Position,
} from 'src/entities';

import { EmployeeRepositoryPort } from 'src/modules/empleados/domain/ports/employee-repository.port';

/**
 * Pruebas de rendimiento básicas de la consulta "Asistencia hoy" (CA09: la
 * vista debe cargar en menos de 2 segundos). Miden el procesamiento del
 * servicio con repositorios en memoria; el tiempo de la base de datos se
 * verifica aparte contra el ambiente real.
 */
describe('AttendanceTodayService – rendimiento', () => {
  // La operación definida es de 50 empleados; se prueba con un volumen 20
  // veces mayor y un margen amplio para que la prueba no sea inestable.
  const EMPLEADOS = 1000;
  const MARCACIONES_POR_EMPLEADO = 3;
  const LIMITE_MS = 200;

  const sucursal = Object.assign(new Branch(), { id: 1, name: 'Centro' });
  const cargo = Object.assign(new Position(), { id: 1, name: 'Mesero' });

  const empleados = Array.from({ length: EMPLEADOS }, (_, indice) =>
    Object.assign(new Employee(), {
      id: indice + 1,
      firstName: `Empleado ${indice + 1}`,
      lastName: 'Prueba',
      position: 'Mesero',
      status: 'ACTIVO',
      jobPosition: cargo,
      employee_branch_assig: [
        Object.assign(new EmployeeBranchAssignment(), {
          is_current: true,
          branch: sucursal,
        }),
      ],
    }),
  );

  // Ordenadas por hora de entrada, como las entrega el repositorio.
  const registros = Array.from(
    { length: MARCACIONES_POR_EMPLEADO },
    (_, turno) =>
      empleados
        // Uno de cada cinco empleados queda ausente.
        .filter((empleado) => empleado.id % 5 !== 0)
        .map((empleado) =>
          Object.assign(new AttendanceRecord(), {
            check_in: new Date(
              Date.UTC(2026, 9, 4, 13 + turno * 3, 0, empleado.id % 60),
            ),
            check_out: null,
            employee: empleado,
            branch: sucursal,
          }),
        ),
  ).flat();

  const service = new AttendanceTodayService(
    {
      findCheckInsBetween: () => Promise.resolve(registros),
    } as unknown as AttendanceRecordRepositoryPort,
    {
      findAll: () => Promise.resolve(empleados),
    } as unknown as EmployeeRepositoryPort,
    { log: jest.fn() } as AuditPort,
  );

  it(`debe procesar ${EMPLEADOS} empleados en menos de ${LIMITE_MS} ms`, async () => {
    // Primera ejecución de calentamiento para no medir la compilación JIT.
    await service.consultarAsistenciaHoy();

    const inicio = performance.now();
    const resultado = await service.consultarAsistenciaHoy();
    const duracion = performance.now() - inicio;

    expect(resultado.totalEmpleados).toBe(EMPLEADOS);
    expect(resultado.presentes).toBe(800);
    expect(resultado.ausentes).toBe(200);
    expect(duracion).toBeLessThan(LIMITE_MS);
  });

  it('debe mantener el tiempo de respuesta en consultas repetidas', async () => {
    const CONSULTAS = 20;

    const inicio = performance.now();
    for (let consulta = 0; consulta < CONSULTAS; consulta++) {
      await service.consultarAsistenciaHoy();
    }
    const promedio = (performance.now() - inicio) / CONSULTAS;

    expect(promedio).toBeLessThan(LIMITE_MS);
  });
});
