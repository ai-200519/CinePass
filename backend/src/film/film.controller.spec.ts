import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { BadRequestException } from '@nestjs/common';

describe('FilmController', () => {
    let controller: FilmController;
    let service: FilmService;

    const mockFilmService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        search: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FilmController],
            providers: [
                {
                    provide: FilmService,
                    useValue: mockFilmService,
                },
            ],
        }).compile();

        controller = module.get<FilmController>(FilmController);
        service = module.get<FilmService>(FilmService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all films', () => {
        const films = [{ id: 1, title: 'Inception' }];
        const mockPaginationDto = { page: 1, limit: 10 };
        mockFilmService.findAll.mockReturnValue(films);

        expect(controller.findAll(mockPaginationDto)).toEqual(films);
    });

    it('should search for films', () => {
        const films = [{ id: 1, title: 'Inception' }];
        const query = 'Incep';
        mockFilmService.search.mockReturnValue(films);

        expect(controller.search(query)).toEqual(films);
        expect(service.search).toHaveBeenCalledWith(query);
    });

    it('should return one film', () => {
        const film = { id: 1, title: 'Inception' };
        mockFilmService.findOne.mockReturnValue(film);

        expect(controller.findOne('1')).toEqual(film);
        expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should create a film', () => {
        const dto = { title: 'Interstellar' };

        const result = controller.create(dto as any);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
            message: 'Film created successfully',
        });
    });

    it('should throw bad request if body missing', () => {
        expect(() => controller.create(null as any)).toThrow(
            BadRequestException,
        );
    });

    it('should update a film', () => {
        const dto = { title: 'Updated Film' };

        controller.update('1', dto as any);

        expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should delete a film', () => {
        controller.remove('1');

        expect(service.remove).toHaveBeenCalledWith(1);
    });
});