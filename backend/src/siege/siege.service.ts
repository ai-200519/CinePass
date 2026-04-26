import { Injectable } from '@nestjs/common';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';

@Injectable()
export class SiegeService {
  create(createSiegeDto: CreateSiegeDto) {
    return 'This action adds a new siege';
  }

  findAll() {
    return `This action returns all siege`;
  }

  findOne(id: number) {
    return `This action returns a #${id} siege`;
  }

  update(id: number, updateSiegeDto: UpdateSiegeDto) {
    return `This action updates a #${id} siege`;
  }

  remove(id: number) {
    return `This action removes a #${id} siege`;
  }
}
