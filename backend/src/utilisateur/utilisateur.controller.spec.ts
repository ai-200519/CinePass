import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';
import { Role } from '../common/enums/role.enum';

describe('UtilisateurController', () => {
	let controller: UtilisateurController;

	const mockUtilisateurService = {
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		updateProfil: jest.fn(),
		changePassword: jest.fn(),
		activerCompte: jest.fn(),
		suspendreCompte: jest.fn(),
		changerRole: jest.fn(),
		remove: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UtilisateurController],
			providers: [
				{ provide: UtilisateurService, useValue: mockUtilisateurService },
			],
		}).compile();

		controller = module.get<UtilisateurController>(UtilisateurController);
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return current user profile', async () => {
		const user = { id_utilisateur: 7 } as any;
		const result = { id_utilisateur: 7, email: 'a@test.com' };
		mockUtilisateurService.findOne.mockResolvedValue(result);

		await expect(controller.getProfil(user)).resolves.toEqual(result);
		expect(mockUtilisateurService.findOne).toHaveBeenCalledWith(7);
	});

	it('should update current user profile', async () => {
		const user = { id_utilisateur: 7 } as any;
		const dto = { nom: 'Updated' } as any;
		const result = { id_utilisateur: 7, nom: 'Updated' };
		mockUtilisateurService.updateProfil.mockResolvedValue(result);

		await expect(controller.updateProfil(user, dto)).resolves.toEqual(result);
		expect(mockUtilisateurService.updateProfil).toHaveBeenCalledWith(7, dto);
	});

	it('should change current user password', async () => {
		const user = { id_utilisateur: 7 } as any;
		const dto = { motDePasseActuel: 'old', nouveauMotDePasse: 'new' } as any;
		const result = { message: 'Mot de passe modifie avec succes' };
		mockUtilisateurService.changePassword.mockResolvedValue(result);

		await expect(controller.changePassword(user, dto)).resolves.toEqual(result);
		expect(mockUtilisateurService.changePassword).toHaveBeenCalledWith(7, 'old', 'new');
	});

	it('should return all users with filters', async () => {
		const filter = { search: 'ali', role: Role.CLIENT } as any;
		const result = [{ id_utilisateur: 1 }];
		mockUtilisateurService.findAll.mockResolvedValue(result);

		await expect(controller.findAll(filter)).resolves.toEqual(result);
		expect(mockUtilisateurService.findAll).toHaveBeenCalledWith(filter);
	});

	it('should return one user', async () => {
		const result = { id_utilisateur: 1, email: 'a@test.com' };
		mockUtilisateurService.findOne.mockResolvedValue(result);

		await expect(controller.findOne(1)).resolves.toEqual(result);
		expect(mockUtilisateurService.findOne).toHaveBeenCalledWith(1);
	});

	it('should update a user', async () => {
		const dto = { nom: 'Updated' } as any;
		const result = { id_utilisateur: 1, nom: 'Updated' };
		mockUtilisateurService.update.mockResolvedValue(result);

		await expect(controller.update(1, dto)).resolves.toEqual(result);
		expect(mockUtilisateurService.update).toHaveBeenCalledWith(1, dto);
	});

	it('should activate account', async () => {
		const result = { message: 'activated' };
		mockUtilisateurService.activerCompte.mockResolvedValue(result);

		await expect(controller.activer(1)).resolves.toEqual(result);
		expect(mockUtilisateurService.activerCompte).toHaveBeenCalledWith(1);
	});

	it('should suspend account', async () => {
		const result = { message: 'suspended' };
		mockUtilisateurService.suspendreCompte.mockResolvedValue(result);

		await expect(controller.suspendre(1)).resolves.toEqual(result);
		expect(mockUtilisateurService.suspendreCompte).toHaveBeenCalledWith(1);
	});

	it('should change role', async () => {
		const result = { role: Role.ADMIN };
		mockUtilisateurService.changerRole.mockResolvedValue(result);

		await expect(controller.changerRole(1, Role.ADMIN)).resolves.toEqual(result);
		expect(mockUtilisateurService.changerRole).toHaveBeenCalledWith(1, Role.ADMIN);
	});

	it('should remove a user', async () => {
		const result = { message: 'removed' };
		mockUtilisateurService.remove.mockResolvedValue(result);

		await expect(controller.remove(1)).resolves.toEqual(result);
		expect(mockUtilisateurService.remove).toHaveBeenCalledWith(1);
	});
});
