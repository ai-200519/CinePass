import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { StatutSeance } from '../../common/enums/statut-seance.enum';
import { TechnologieSeance } from '../../common/enums/technologie-seance.enum';

class FilmRefDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	id: number;
}

class SalleRefDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	id_salle: number;
}

export class CreateSeanceDto {
	@ApiProperty({ example: '2026-05-04T16:30:00.000Z' })
	@IsDateString()
	dateHeure: string;

	@ApiProperty({ enum: TechnologieSeance, example: TechnologieSeance.DEUX_D })
	@IsEnum(TechnologieSeance)
	technologie: TechnologieSeance;

	@ApiProperty({ enum: StatutSeance, example: StatutSeance.PROGRAMMEE })
	@IsEnum(StatutSeance)
	statut: StatutSeance;

	@ApiProperty({ type: () => FilmRefDto })
	@ValidateNested()
	@Type(() => FilmRefDto)
	film: FilmRefDto;

	@ApiProperty({ type: () => SalleRefDto })
	@ValidateNested()
	@Type(() => SalleRefDto)
	salle: SalleRefDto;
}
