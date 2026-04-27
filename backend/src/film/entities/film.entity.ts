import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Film {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    releaseDate: Date;

    @Column({ nullable: true })
    director: string;

    @Column("text", { array: true, nullable: true })
    actors: string[];

    @Column({ nullable: true })
    genre: string;

    @Column({ nullable: true })
    poster: string;

    @Column({ nullable: true })
    trailer: string;

    @Column('decimal', { precision: 3, scale: 1, default: 0, nullable: true })
    note: number;
    @Column({ nullable: true })
    isShowing: boolean;
}
