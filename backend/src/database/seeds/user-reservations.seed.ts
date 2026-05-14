import { AppDataSource } from '../../../data-source';
import { CategorieSiege } from '../../common/enums/categorie-siege.enum';
import { MethodePaiement } from '../../common/enums/methode-paiement.enum';
import { StatutPaiement } from '../../common/enums/statut-paiement.enum';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';
import { StatutSeance } from '../../common/enums/statut-seance.enum';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { ReservationSiege } from '../../reservation/entities/reservation-siege.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Siege } from '../../siege/entities/siege.entity';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';

const TARGET_EMAIL = 'ddx658142@gmail.com';
const RESERVATION_COUNT = 2;

const priceForCategory: Record<CategorieSiege, number> = {
  [CategorieSiege.STANDARD]: 60,
  [CategorieSiege.VIP]: 90,
};

function makeReference(index: number) {
  const year = new Date().getFullYear();
  return `DDX-${year}-${String(index).padStart(4, '0')}`;
}

async function findAvailableSeats(
  seance: Seance,
  allSeats: Siege[],
  needed: number,
) {
  const occupied = await AppDataSource.getRepository(ReservationSiege)
    .createQueryBuilder('rs')
    .leftJoin('rs.reservation', 'reservation')
    .leftJoin('rs.siege', 'siege')
    .select('siege.id_siege', 'id_siege')
    .where('reservation.seance = :id_seance', {
      id_seance: seance.id_seance,
    })
    .andWhere('reservation.statut IN (:...statuses)', {
      statuses: [
        StatutReservation.EN_COURS,
        StatutReservation.PAYEE,
        StatutReservation.VALIDEE,
        StatutReservation.UTILISEE,
      ],
    })
    .getRawMany<{ id_siege: number }>();

  const occupiedIds = new Set(occupied.map((row) => Number(row.id_siege)));
  return allSeats
    .filter((seat) => !occupiedIds.has(seat.id_siege))
    .slice(0, needed);
}

export async function seedUserReservations() {
  const userRepo = AppDataSource.getRepository(Utilisateur);
  const seanceRepo = AppDataSource.getRepository(Seance);
  const siegeRepo = AppDataSource.getRepository(Siege);
  const reservationRepo = AppDataSource.getRepository(Reservation);
  const paiementRepo = AppDataSource.getRepository(Paiement);

  const user = await userRepo.findOne({ where: { email: TARGET_EMAIL } });
  if (!user) {
    throw new Error(`Utilisateur ${TARGET_EMAIL} introuvable`);
  }

  const existing = await reservationRepo.count({
    where: { utilisateur: { id_utilisateur: user.id_utilisateur } },
  });

  if (existing > 0) {
    console.log(`${TARGET_EMAIL} a deja ${existing} reservation(s), aucune creation.`);
    return;
  }

  const seances = await seanceRepo
    .createQueryBuilder('seance')
    .leftJoinAndSelect('seance.film', 'film')
    .leftJoinAndSelect('seance.salle', 'salle')
    .where('seance.statut = :statut', { statut: StatutSeance.PROGRAMMEE })
    .andWhere('seance.dateHeure > :now', { now: new Date() })
    .orderBy('seance.dateHeure', 'ASC')
    .take(8)
    .getMany();

  if (seances.length === 0) {
    throw new Error('Aucune seance future disponible');
  }

  let created = 0;
  for (const seance of seances) {
    if (created >= RESERVATION_COUNT) break;

    const seats = await siegeRepo.find({
      where: { salle: { id_salle: seance.salle.id_salle } },
      order: { rangee: 'ASC', numero: 'ASC' },
    });
    const selectedSeats = await findAvailableSeats(seance, seats, 2);
    if (selectedSeats.length < 2) continue;

    const reference = makeReference(created + 1);
    const reservation = reservationRepo.create({
      reference,
      statut: StatutReservation.PAYEE,
      qrCode: JSON.stringify({ reference }),
      utilisateur: user,
      seance,
      reservationSieges: selectedSeats.map((seat) =>
        AppDataSource.getRepository(ReservationSiege).create({
          siege: seat,
          categorie: seat.categorie,
          prixUnitaire: priceForCategory[seat.categorie],
        }),
      ),
    });

    const savedReservation = await reservationRepo.save(reservation);
    const montantTotal = selectedSeats.reduce(
      (sum, seat) => sum + priceForCategory[seat.categorie],
      0,
    );

    await paiementRepo.save(
      paiementRepo.create({
        reservation: savedReservation,
        montantTotal,
        devise: 'MAD',
        methode: created % 2 === 0 ? MethodePaiement.STRIPE : MethodePaiement.PAYPAL,
        statut: StatutPaiement.ACCEPTE,
        referenceTransaction: `DDX-TXN-${reference}`,
        datePaiement: new Date(),
      }),
    );

    created += 1;
    console.log(
      `Reservation ${reference} creee pour ${TARGET_EMAIL} - ${seance.film?.title}`,
    );
  }

  if (created === 0) {
    throw new Error('Aucun siege disponible pour creer une reservation');
  }
}

async function run() {
  try {
    await AppDataSource.initialize();
    await seedUserReservations();
  } catch (error) {
    console.error('Seed reservations error:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

if (require.main === module) {
  void run();
}
