import { IsString, IsNumber, IsDate, IsArray, IsBoolean } from 'class-validator';


export class CreateFilmDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    duration: number;

    @IsDate()
    releaseDate: Date;

    @IsString()
    director: string;

    @IsArray()
    actors: string[];

    @IsString()
    genre: string;

    @IsString()
    poster: string;

    @IsString()
    trailer: string;

    @IsNumber()
    note: number;

    @IsBoolean()
    isShowing: boolean;
}
