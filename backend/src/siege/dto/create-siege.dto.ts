import { CategorieSiege } from "../../common/enums/categorie-siege.enum";
import { StatutSiege } from "../../common/enums/statut-siege.enum";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSiegeDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    rangee: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    numero: number;

    @ApiProperty({ example: [CategorieSiege.STANDARD, CategorieSiege.VIP] })
    @IsString()
    @IsNotEmpty()
    categorie: CategorieSiege;

    @ApiProperty({ example: [StatutSiege.DISPONIBLE, StatutSiege.OCCUPE, StatutSiege.BLOQUE] })
    @IsString()
    @IsNotEmpty()
    statut: StatutSiege;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    id_salle: number;
}
