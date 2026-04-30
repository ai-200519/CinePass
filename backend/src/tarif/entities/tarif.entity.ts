import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { Seance } from '../../seance/entities/seance.entity';

export enum TypePublic {
  NORMAL   = 'NORMAL',
  ETUDIANT = 'ETUDIANT',
  ENFANT   = 'ENFANT',
  SENIOR   = 'SENIOR',
  GROUPE   = 'GROUPE',
}

@Entity('tarif')
export class Tarif {

  @PrimaryGeneratedColumn()
  id_tarif: number;

  @Column({ type: 'enum', enum: TypePublic })
  typePublic: TypePublic;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  prix: number;

  // Relations
  @ManyToOne(() => Seance, s => s.tarifs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_seance' })
  seance: Seance;
}