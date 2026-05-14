import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';

export async function seedStaff(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(Utilisateur);
  const cinemaRepo = dataSource.getRepository(Cinema);

  const cinema = await cinemaRepo.findOne({ where: { id_cinema: 1 } });
  const exists = await userRepo.findOne({
    where: { email: 'staff@cinepass.com' },
    relations: ['cinema'],
  });

  if (exists) {
    if (!exists.cinema && cinema) {
      exists.role = Role.STAFF;
      exists.statut = StatutUtilisateur.ACTIF;
      exists.cinema = cinema;
      await userRepo.save(exists);
      console.log('Staff exists - assigned to cinema #1');
      return;
    }

    console.log('Staff already exists - skipping');
    return;
  }

  const hashedPassword = await bcrypt.hash('cinepass', 10);

  const staff = userRepo.create({
    nom: 'Staff',
    prenom: 'CinePass',
    email: 'staff@cinepass.com',
    motDePasse: hashedPassword,
    role: Role.STAFF,
    statut: StatutUtilisateur.ACTIF,
    langue: 'FR',
    cinema: cinema ?? undefined,
  });

  await userRepo.save(staff);
  console.log('Staff seeded : staff@cinepass.com / cinepass');
}
