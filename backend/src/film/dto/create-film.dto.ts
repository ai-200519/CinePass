import { IsString, IsNumber, IsDate, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';


export class CreateFilmDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber()
    duration: number;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    releaseDate: Date;

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
    note: number;

    @ApiProperty()
    @IsBoolean()
    isShowing: boolean;
}
