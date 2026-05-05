import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UtilisateurService } from './utilisateur.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Utilisateur')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  // ── GET /utilisateur ────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Lister tous les utilisateurs (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  @Get()
  findAll() {
    return this.utilisateurService.findAll();
  }

  // ── GET /utilisateur/:id ────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Introuvable' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.findOne(id);
  }

  // ── PATCH /utilisateur/:id ──────────────────────────────────────────────────
  @ApiOperation({ summary: 'Modifier un utilisateur (role, statut, infos)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtilisateurDto,
  ) {
    return this.utilisateurService.update(id, dto);
  }

  // ── PATCH /utilisateur/:id/activer ──────────────────────────────────────────
  @ApiOperation({ summary: 'Activer le compte d\'un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Compte activé' })
  @Patch(':id/activer')
  activer(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.activerCompte(id);
  }

  // ── PATCH /utilisateur/:id/suspendre ────────────────────────────────────────
  @ApiOperation({ summary: 'Suspendre le compte d\'un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Compte suspendu' })
  @Patch(':id/suspendre')
  suspendre(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.suspendreCompte(id);
  }

  // ── PATCH /utilisateur/:id/role ─────────────────────────────────────────────
  @ApiOperation({ summary: 'Changer le rôle d\'un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  @Patch(':id/role')
  changerRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
  ) {
    return this.utilisateurService.changerRole(id, role);
  }

  // ── DELETE /utilisateur/:id ─────────────────────────────────────────────────
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Introuvable' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.remove(id);
  }
}