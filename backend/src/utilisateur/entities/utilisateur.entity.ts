import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { StatutUtilisateur } from '../../common/enums/statut-utilisateur.enum';
import { Notification } from '../../notification/entities/notification.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

@Entity('utilisateur')
export class Utilisateur {

  @PrimaryGeneratedColumn()
  id_utilisateur: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 20 })
  telephone: string;

  @Column({ length: 255 })
  motDePasse: string;

  @Column({ nullable: true, length: 6 })
  otpCode: string;              // the 6-digit code

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date;           // expiry times

  @Column({ default: false, nullable: true })
  otpUsed: boolean;             // prevent reuse

  @Column({ nullable: true })
  otpPurpose: string;   // 'register' | 'reset_password'

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: StatutUtilisateur,
    default: StatutUtilisateur.PENDING,
  })
  statut: StatutUtilisateur;

  @Column({ length: 5, default: 'FR' })
  langue: string;

  @CreateDateColumn()
  dateInscription: Date;

  // Relations
  @OneToMany(() => Reservation, r => r.utilisateur)
  reservations: Reservation[];

  @OneToMany(() => Notification, n => n.utilisateur)
  notifications: Notification[];
}