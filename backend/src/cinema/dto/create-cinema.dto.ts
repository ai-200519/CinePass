import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateCinemaDto {

    @ApiProperty()
    @IsString()
    nom: string;

    @ApiProperty()
    @IsString()
    adresse: string;

    @ApiProperty()
    @IsString()
    ville: string;

    @ApiProperty()
    @IsString()
    telephone: string;

    @ApiProperty()
    @IsNumber()
    latitude: number;

    @ApiProperty()
    @IsNumber()
    longitude: number;
}