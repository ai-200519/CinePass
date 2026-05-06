import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchFilmDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Search query' })
    @IsOptional()
    @IsString()
    q?: string;
}
