import { IsString, IsNumber, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFilmDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)        // ← convertit string → number
    duration: number;

    @ApiProperty()
    @IsDateString()            // ← accepte "2024-01-15" (string ISO)
    releaseDate: string;       // ← changer le type en string

    @ApiProperty()
    @IsString()
    director: string;

    @ApiProperty()
    @IsArray()
    actors: string[];

    @ApiProperty()
    @IsString()
    genre: string;

    @ApiProperty()
    @IsString()
    poster: string;

    @ApiProperty()
    @IsString()
    trailer: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)        // ← convertit string → number
    note: number;

    @ApiProperty()
    @IsBoolean()
    @Type(() => Boolean)       // ← convertit string → boolean
    isShowing: boolean;
}