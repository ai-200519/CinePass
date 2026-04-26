import { Injectable } from '@nestjs/common';
import { CreateSeanceDto } from './dto/create-seance.dto';
import { UpdateSeanceDto } from './dto/update-seance.dto';

@Injectable()
export class SeanceService {
  create(createSeanceDto: CreateSeanceDto) {
    return 'This action adds a new seance';
  }

  findAll() {
    return `This action returns all seance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seance`;
  }

  update(id: number, updateSeanceDto: UpdateSeanceDto) {
    return `This action updates a #${id} seance`;
  }

  remove(id: number) {
    return `This action removes a #${id} seance`;
  }
}
