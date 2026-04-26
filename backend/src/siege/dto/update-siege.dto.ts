import { PartialType } from '@nestjs/mapped-types';
import { CreateSiegeDto } from './create-siege.dto';

export class UpdateSiegeDto extends PartialType(CreateSiegeDto) {}
