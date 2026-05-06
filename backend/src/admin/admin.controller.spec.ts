import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const mockAdminService = {
  getGlobalStats: jest.fn(),
  getFilmsStats: jest.fn(),
  getSeancesStats: jest.fn(),
  getRevenusStats: jest.fn(),
  getReservationsStats: jest.fn(),
  getAllReservations: jest.fn(),
  getReservationById: jest.fn(),
  getCinemasStats: jest.fn(),
  exportCsv: jest.fn(),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return global stats', async () => {
    const filter = { dateDebut: '2026-01-01', dateFin: '2026-12-31' } as any;
    const result = { kpis: { totalBillets: 1 } } as any;
    mockAdminService.getGlobalStats.mockResolvedValue(result);

    await expect(controller.getGlobalStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getGlobalStats).toHaveBeenCalledWith(filter);
  });

  it('should return films stats', async () => {
    const filter = { limit: 5 } as any;
    const result = { films: [] } as any;
    mockAdminService.getFilmsStats.mockResolvedValue(result);

    await expect(controller.getFilmsStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getFilmsStats).toHaveBeenCalledWith(filter);
  });

  it('should return seances stats', async () => {
    const filter = { limit: 10 } as any;
    const result = { seances: [] } as any;
    mockAdminService.getSeancesStats.mockResolvedValue(result);

    await expect(controller.getSeancesStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getSeancesStats).toHaveBeenCalledWith(filter);
  });

  it('should return revenus stats', async () => {
    const filter = { dateDebut: '2026-05-01', dateFin: '2026-05-31' } as any;
    const result = { totalCA: 0 } as any;
    mockAdminService.getRevenusStats.mockResolvedValue(result);

    await expect(controller.getRevenusStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getRevenusStats).toHaveBeenCalledWith(filter);
  });

  it('should return reservation stats', async () => {
    const filter = {} as any;
    const result = { total: 0 } as any;
    mockAdminService.getReservationsStats.mockResolvedValue(result);

    await expect(controller.getReservationsStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getReservationsStats).toHaveBeenCalledWith(filter);
  });

  it('should return all reservations', async () => {
    const filter = { statut: 'PAYEE' } as any;
    const result = { total: 1, reservations: [] } as any;
    mockAdminService.getAllReservations.mockResolvedValue(result);

    await expect(controller.getAllReservations(filter)).resolves.toEqual(result);
    expect(mockAdminService.getAllReservations).toHaveBeenCalledWith(filter);
  });

  it('should return reservation by id', async () => {
    const result = { id: 1 } as any;
    mockAdminService.getReservationById.mockResolvedValue(result);

    await expect(controller.getReservationById(1)).resolves.toEqual(result);
    expect(mockAdminService.getReservationById).toHaveBeenCalledWith(1);
  });

  it('should return cinemas stats', async () => {
    const filter = {} as any;
    const result = { cinemas: [] } as any;
    mockAdminService.getCinemasStats.mockResolvedValue(result);

    await expect(controller.getCinemasStats(filter)).resolves.toEqual(result);
    expect(mockAdminService.getCinemasStats).toHaveBeenCalledWith(filter);
  });

  it('should export CSV', async () => {
    const filter = { dateDebut: '2026-01-01' } as any;
    const csv = 'ID,Ref\n1,CP-1';
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as any;

    mockAdminService.exportCsv.mockResolvedValue(csv);

    await controller.exportCsv(filter, res);

    expect(mockAdminService.exportCsv).toHaveBeenCalledWith(filter);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('attachment; filename=reservations_'),
    );
    expect(res.send).toHaveBeenCalledWith('\uFEFF' + csv);
  });
});
