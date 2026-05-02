import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class CreateSalleDto {

    @ApiProperty()
    @IsNumber()
    numero: number

    @ApiProperty()
    @IsString()
    nom: string

    @ApiProperty()
    @IsNumber()
    capaciteTotale: number

    @ApiProperty()
    @IsString()
    equipements: string

    @ApiProperty()
    @IsNumber()
    id_cinema: number
}
