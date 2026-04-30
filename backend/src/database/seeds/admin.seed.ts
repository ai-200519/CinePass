import { DataSource } from 'typeorm';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource): Promise<void> {

  const repo = dataSource.getRepository(Utilisateur);

  // Check if admin already exists
  const exists = await repo.findOne({
    where: { email: 'admin@cinepass.ma' }
  });

  if (exists) {
    console.log('⏭️  Admin already exists — skipping');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = repo.create({
    nom:        'Admin',
    prenom:     'CinePass',
    email:      'admin@cinepass.ma',
    motDePasse: hashedPassword,
    role:       Role.ADMIN,
    statut:     StatutUtilisateur.ACTIF,
    langue:     'FR',
  });

  await repo.save(admin);
  console.log('✅ Admin seeded : admin@cinepass.ma / admin123');
}