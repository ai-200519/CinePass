import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiegeService } from './siege.service';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Siege')
@Controller('siege')
export class SiegeController {
  constructor(private readonly siegeService: SiegeService) { }

  @ApiOperation({
    summary: 'Create a new siege',
    description: 'Create a new siege',
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiBody({
    type: CreateSiegeDto,
  })
  @Post()
  create(@Body() createSiegeDto: CreateSiegeDto) {
    return this.siegeService.create(createSiegeDto);
  }

  @ApiOperation({
    summary: 'Get all sieges',
    description: 'Get all sieges',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'No sieges found',
  })
  @Get()
  findAll() {
    return this.siegeService.findAll();
  }

  @ApiOperation({
    summary: 'Get one siege',
    description: 'Get one siege',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'No siege found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siegeService.findOne(+id);
  }


  @ApiOperation({
    summary: 'Update one siege',
    description: 'Update one siege',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'No siege found',
  })
  @ApiBody({
    type: CreateSiegeDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiegeDto: UpdateSiegeDto) {
    return this.siegeService.update(+id, updateSiegeDto);
  }


  @ApiOperation({
    summary: 'Delete one siege',
    description: 'Delete one siege',
  })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'No siege found',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siegeService.remove(+id);
  }
}
