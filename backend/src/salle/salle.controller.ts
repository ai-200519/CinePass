import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalleService } from './salle.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Salle')
@Controller('salle')
export class SalleController {
  constructor(private readonly salleService: SalleService) {}


  @ApiOperation({ summary: 'Create a new salle' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiBody({ type: CreateSalleDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Salle not found' })
  @Post()
  create(@Body() createSalleDto: CreateSalleDto) {
    return this.salleService.create(createSalleDto);
  }

  @ApiOperation({ summary: 'Get all salles' })
  @ApiResponse({ status: 200, description: 'Returns all salles' })
  @ApiResponse({ status: 404, description: 'Salle not found' })
  @Get()
  findAll() {
    return this.salleService.findAll();
  }

  @ApiOperation({ summary: 'Get a salle by ID' })
  @ApiResponse({ status: 200, description: 'Returns the salle' })
  @ApiResponse({ status: 404, description: 'Salle not found' })
  @ApiParam({ name: 'id', description: 'Salle ID', type: Number })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salleService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a salle by ID' })
  @ApiResponse({ status: 200, description: 'The record has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Salle not found' })
  @ApiParam({ name: 'id', description: 'Salle ID', type: Number })
  @ApiBody({ type: CreateSalleDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalleDto: UpdateSalleDto) {
    return this.salleService.update(+id, updateSalleDto);
  }

  @ApiOperation({ summary: 'Delete a salle by ID' })
  @ApiResponse({ status: 200, description: 'The record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Salle not found' })
  @ApiParam({ name: 'id', description: 'Salle ID', type: Number })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salleService.remove(+id);
  }
}
