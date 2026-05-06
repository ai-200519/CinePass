// src/seance/seance.controller.ts
import {
  Controller, Get, Post, Body,
  Patch, Param, Delete, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiParam, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { SeanceService }      from './seance.service';
import { CreateSeanceDto }    from './dto/create-seance.dto';
import { UpdateSeanceDto }    from './dto/update-seance.dto';
import { JwtAuthGuard }       from '../common/guards/jwt-auth.guard';
import { RolesGuard }         from '../common/guards/roles.guard';
import { Roles }              from '../common/decorators/roles.decorator';
import { Role }               from '../common/enums/role.enum';

@ApiTags('Seance')
@Controller('seance')
export class SeanceController {

  constructor(private readonly seanceService: SeanceService) {}

  // ── POST /seance — ADMIN only ─────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '🔒 ADMIN — Créer une séance' })
  @ApiResponse({ status: 201, description: 'Séance créée' })
  create(@Body() createSeanceDto: CreateSeanceDto) {
    return this.seanceService.create(createSeanceDto);
  }

  // ── GET /seance?id_film= — PUBLIC ─────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary:     'Séances disponibles — public',
    description: 'Retourne les séances PROGRAMMEE. Filtrable par film.',
  })
  @ApiQuery({ name: 'id_film', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: [{
        id_seance:       1,
        dateHeure:       '2026-05-10T19:30:00',
        technologie:     '2D',
        statut:          'PROGRAMMEE',
        film:            { id: 1, title: 'Gladiator II', poster: '...' },
        salle:           { id: 1, nom: 'Salle 1', capaciteTotale: 100 },
        cinema:          { id: 1, nom: 'CinePass Safi' },
        placesRestantes: 72,
      }],
    },
  })
  findAll(@Query('id_film') id_film?: string) {
    return this.seanceService.findAll(id_film ? +id_film : undefined);
  }

  // ── GET /seance/:id — PUBLIC ──────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary:     'Détail d\'une séance — public',
    description: 'Retourne le détail complet d\'une séance.',
  })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  @ApiResponse({ status: 404, description: 'Séance introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seanceService.findOne(id);
  }

  // ── GET /seance/:id/sieges — PUBLIC ──────────────────────────────────────
  @Get(':id/sieges')
  @ApiOperation({
    summary:     'Plan de salle — public',
    description:
      'Retourne tous les sièges de la salle avec leur disponibilité ' +
      'pour cette séance précise. ' +
      'OCCUPE = déjà réservé pour cette séance. ' +
      'DISPONIBLE = libre.',
  })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id_seance:       1,
        salle:           'Salle 1',
        capaciteTotale:  100,
        placesRestantes: 72,
        sieges: [
          {
            id_siege:  1,
            rangee:    'A',
            numero:    1,
            categorie: 'VIP',
            statut:    'DISPONIBLE',
          },
          {
            id_siege:  2,
            rangee:    'A',
            numero:    2,
            categorie: 'VIP',
            statut:    'OCCUPE',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Séance introuvable' })
  getSiegesDisponibles(@Param('id', ParseIntPipe) id: number) {
    return this.seanceService.getSiegesDisponibles(id);
  }

  // ── GET /seance/:id/tarifs — PUBLIC ──────────────────────────────────────
  @Get(':id/tarifs')
  @ApiOperation({
    summary:     'Tarifs d\'une séance — public',
    description: 'Retourne tous les tarifs par type de public pour une séance.',
  })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        { id_tarif: 1, typePublic: 'NORMAL',   prix: 50 },
        { id_tarif: 2, typePublic: 'ETUDIANT', prix: 35 },
        { id_tarif: 3, typePublic: 'ENFANT',   prix: 25 },
        { id_tarif: 4, typePublic: 'SENIOR',   prix: 30 },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Séance introuvable' })
  getTarifs(@Param('id', ParseIntPipe) id: number) {
    return this.seanceService.getTarifs(id);
  }

  // ── PATCH /seance/:id — ADMIN only ────────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '🔒 ADMIN — Modifier une séance' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeanceDto: UpdateSeanceDto,
  ) {
    return this.seanceService.update(id, updateSeanceDto);
  }

  // ── DELETE /seance/:id — ADMIN only ───────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '🔒 ADMIN — Supprimer une séance' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seanceService.remove(id);
  }
}