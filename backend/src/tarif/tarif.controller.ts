// src/tarif/tarif.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { TarifService }    from './tarif.service';
import { CreateTarifDto }  from './dto/create-tarif.dto';
import { UpdateTarifDto }  from './dto/update-tarif.dto';
import { JwtAuthGuard }    from '../common/guards/jwt-auth.guard';
import { RolesGuard }      from '../common/guards/roles.guard';
import { Roles }           from '../common/decorators/roles.decorator';
import { Role }            from '../common/enums/role.enum';

@ApiTags('Tarif')
@Controller('tarif')
export class TarifController {

  constructor(private readonly tarifService: TarifService) {}

  // ── GET /tarif/seance/:id — PUBLIC ────────────────────────────────────────
  @Get('seance/:id')
  @ApiOperation({
    summary:     'Tarifs d\'une séance — public',
    description: 'Retourne tous les tarifs disponibles pour une séance.',
  })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  @ApiResponse({
    status: 200,
    description: 'Liste des tarifs',
    schema: {
      example: [
        { id_tarif: 1, typePublic: 'NORMAL',   prix: 50 },
        { id_tarif: 2, typePublic: 'ETUDIANT', prix: 35 },
        { id_tarif: 3, typePublic: 'ENFANT',   prix: 25 },
        { id_tarif: 4, typePublic: 'SENIOR',   prix: 30 },
      ],
    },
  })
  findBySeance(@Param('id', ParseIntPipe) id: number) {
    return this.tarifService.findBySeance(id);
  }

  // ── POST /tarif — ADMIN only ──────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:     '🔒 ADMIN — Créer un tarif',
    description: 'Crée un tarif pour un type de public et une séance.',
  })
  @ApiResponse({ status: 201, description: 'Tarif créé' })
  @ApiResponse({ status: 409, description: 'Tarif déjà existant pour ce type' })
  create(@Body() dto: CreateTarifDto) {
    return this.tarifService.create(dto);
  }

  // ── PUT /tarif/:id — ADMIN only ───────────────────────────────────────────
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:     '🔒 ADMIN — Modifier un tarif',
    description: 'Met à jour le prix d\'un tarif existant.',
  })
  @ApiParam({ name: 'id', description: 'ID du tarif' })
  @ApiResponse({ status: 200, description: 'Tarif mis à jour' })
  @ApiResponse({ status: 404, description: 'Tarif introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTarifDto,
  ) {
    return this.tarifService.update(id, dto);
  }

  // ── DELETE /tarif/:id — ADMIN only ────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:     '🔒 ADMIN — Supprimer un tarif',
    description: 'Supprime un tarif définitivement.',
  })
  @ApiParam({ name: 'id', description: 'ID du tarif' })
  @ApiResponse({ status: 200, description: 'Tarif supprimé' })
  @ApiResponse({ status: 404, description: 'Tarif introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tarifService.remove(id);
  }
}