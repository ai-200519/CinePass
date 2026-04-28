import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FilmService } from './film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';



@ApiTags('films')
@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService) { }


  @ApiOperation({ summary: 'Create a new film' })
  @ApiResponse({ status: 201, description: 'Film created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiBody({ type: CreateFilmDto })
  @Post('create')
  create(@Body() createFilmDto: CreateFilmDto) {

    if (!createFilmDto) {
      throw new BadRequestException('Request body is missing');
    }

    this.filmService.create(createFilmDto);

    return { "message": "Film created successfully" };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all films' })
  @ApiResponse({ status: 200, description: 'Returns all films' })
  findAll() {
    return this.filmService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a film by ID' })
  @ApiParam({ name: 'id', description: 'Film ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the film' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  findOne(@Param('id') id: string) {
    return this.filmService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a film by ID' })
  @ApiParam({ name: 'id', description: 'Film ID', type: Number })
  @ApiBody({ type: UpdateFilmDto })
  @ApiResponse({ status: 200, description: 'Film updated successfully' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return this.filmService.update(+id, updateFilmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a film by ID' })
  @ApiParam({ name: 'id', description: 'Film ID', type: Number })
  @ApiResponse({ status: 200, description: 'Film deleted successfully' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  remove(@Param('id') id: string) {
    return this.filmService.remove(+id);
  }
}
