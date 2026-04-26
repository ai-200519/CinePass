import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiegeService } from './siege.service';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';

@Controller('siege')
export class SiegeController {
  constructor(private readonly siegeService: SiegeService) {}

  @Post()
  create(@Body() createSiegeDto: CreateSiegeDto) {
    return this.siegeService.create(createSiegeDto);
  }

  @Get()
  findAll() {
    return this.siegeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siegeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiegeDto: UpdateSiegeDto) {
    return this.siegeService.update(+id, updateSiegeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siegeService.remove(+id);
  }
}
