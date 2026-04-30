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
    adresse:   'Hda Fste_yes SIIR',
    ville:     'Errachidia',
    telephone: '+212 5XX-XXXXXX',
    latitude:  31.9329,
    longitude: -4.4231,
  });

  await repo.save(cinema);
  console.log('✅ Cinema seeded : CinePass Errachidia');
}