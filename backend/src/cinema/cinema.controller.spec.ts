import { Test, TestingModule } from '@nestjs/testing';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';

describe('CinemaController', () => {
    let controller: CinemaController;
    let service: CinemaService;

    const mockCinemaService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CinemaController],
            providers: [
                {
                    provide: CinemaService,
                    useValue: mockCinemaService,
                },
            ],
        }).compile();

        controller = module.get<CinemaController>(CinemaController);
        service = module.get<CinemaService>(CinemaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call cinemaService.create with correct parameters', async () => {
            const createCinemaDto: CreateCinemaDto = {
                name: 'Cinema Test',
                address: '123 Test St',
                email: 'test@cinema.com',
                description: 'Test description',
                tel: '1234567890',
                password: 'password123',
            } as any;
            const result = { id_cinema: 1, ...createCinemaDto };
            mockCinemaService.create.mockResolvedValue(result);

            expect(await controller.create(createCinemaDto)).toEqual(result);
            expect(mockCinemaService.create).toHaveBeenCalledWith(createCinemaDto);
        });
    });

    describe('findAll', () => {
        it('should call cinemaService.findAll and return an array of cinemas', async () => {
            const result = [{ id_cinema: 1, name: 'Cinema 1' }];
            mockCinemaService.findAll.mockResolvedValue(result);

            expect(await controller.findAll()).toEqual(result);
            expect(mockCinemaService.findAll).toHaveBeenCalledWith();
        });
    });

    describe('findOne', () => {
        it('should call cinemaService.findOne with correct parameters', async () => {
            const id = '1';
            const result = { id_cinema: 1, name: 'Cinema 1' };
            mockCinemaService.findOne.mockResolvedValue(result);

            expect(await controller.findOne(id)).toEqual(result);
            expect(mockCinemaService.findOne).toHaveBeenCalledWith(+id);
        });
    });

    describe('update', () => {
        it('should call cinemaService.update with correct parameters', async () => {
            const id = '1';
            const updateCinemaDto: UpdateCinemaDto = { nom: 'Cinema 1 updated' };
            const result = { affected: 1 };
            mockCinemaService.update.mockResolvedValue(result);

            expect(await controller.update(id, updateCinemaDto)).toEqual(result);
            expect(mockCinemaService.update).toHaveBeenCalledWith(+id, updateCinemaDto);
        });
    });

    describe('remove', () => {
        it('should call cinemaService.remove with correct parameters', async () => {
            const id = '1';
            const result = { affected: 1 };
            mockCinemaService.remove.mockResolvedValue(result);

            expect(await controller.remove(id)).toEqual(result);
            expect(mockCinemaService.remove).toHaveBeenCalledWith(+id);
        });
    });
});
