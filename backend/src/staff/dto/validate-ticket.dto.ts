import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ValidateTicketDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_seance?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
