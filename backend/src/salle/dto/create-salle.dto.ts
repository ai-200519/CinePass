import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class CreateSalleDto {

    @ApiProperty()
    @IsNumber()
    numero: number

    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsNumber()
    totalCapacity: number

    @ApiProperty()
    @IsString()
    equipments: string

    @ApiProperty()
    @IsNumber()
    id_cinema: number
}
