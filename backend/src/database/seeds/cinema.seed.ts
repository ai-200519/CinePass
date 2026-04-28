import { DataSource } from 'typeorm';
import { Cinema } from '../../cinema/entities/cinema.entity';

export async function seedCinema(dataSource: DataSource): Promise<void> {

  const repo = dataSource.getRepository(Cinema);

  // Check if cinema already exists
  const exists = await repo.findOne({ where: { id_cinema: 1 } });

  if (exists) {
    console.log('⏭️  Cinema already exists — skipping');
    return;
  }

  const cinema = repo.create({
    nom:       'CinePass',
    adresse:   'Rue Hassan II',
    ville:     'Safi',
    telephone: '+212 5XX-XXXXXX',
    latitude:  32.2994,
    longitude: -9.2372,
  });

  await repo.save(cinema);
  console.log('✅ Cinema seeded : CinePass Safi');
}