import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateSiegeDto } from './dto/create-siege.dto';
import { UpdateSiegeDto } from './dto/update-siege.dto';
import { SiegeService } from './siege.service';

@ApiBearerAuth('JWT-auth')
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
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.CLIENT, Role.STAFF)
  findAll(@Query('id_salle') idSalle?: string, @Query('id_seance') idSeance?: string) {
    return this.siegeService.findAll(
      idSalle ? +idSalle : undefined,
      idSeance ? +idSeance : undefined,
    );
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
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.CLIENT, Role.STAFF)
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
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siegeService.remove(+id);
  }
}
