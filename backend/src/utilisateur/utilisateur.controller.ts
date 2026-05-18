import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UtilisateurService } from './utilisateur.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { FilterUtilisateurDto } from './dto/filter-utilisateur.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfilDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Utilisateur')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  // ══════════════════════════════════════════════════════════════════════════
  // CLIENT routes — own profile only
  // ══════════════════════════════════════════════════════════════════════════

  // ── GET /utilisateur/profil — CLIENT ──────────────────────────────────────
  @Get('profil')
  @ApiOperation({
    summary: '🔒 CLIENT — Consulter mon profil',
    description: 'Retourne les informations du client connecté.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id_utilisateur: 1,
        nom: 'Alami',
        prenom: 'Youssef',
        email: 'youssef@cinepass.ma',
        telephone: '+212 6XX-XXXXXX',
        langue: 'FR',
        role: 'CLIENT',
        statut: 'ACTIF',
        dateInscription: '2026-05-01T20:00:00.000Z',
      },
    },
  })
  getProfil(@CurrentUser() user: any) {
    return this.utilisateurService.findOne(user.id_utilisateur);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Utilisateur connecte',
    description: 'Alias de /utilisateur/profil pour compatibilite frontend.',
  })
  getMe(@CurrentUser() user: any) {
    return this.utilisateurService.findOne(user.id_utilisateur);
  }

  // ── PATCH /utilisateur/profil — CLIENT ────────────────────────────────────
  @Patch('profil')
  @ApiOperation({
    summary: '🔒 CLIENT — Modifier mon profil',
    description:
      'Permet au client de modifier son nom, prénom, téléphone et langue.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour',
    schema: {
      example: {
        id_utilisateur: 1,
        nom: 'Alami Updated',
        prenom: 'Youssef',
        email: 'youssef@cinepass.ma',
        telephone: '+212 6XX-XXXXXX',
        langue: 'AR',
      },
    },
  })
  updateProfil(@CurrentUser() user: any, @Body() dto: UpdateProfilDto) {
    return this.utilisateurService.updateProfil(user.id_utilisateur, dto);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Modifier mon profil',
    description: 'Alias de /utilisateur/profil pour compatibilite frontend.',
  })
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfilDto) {
    return this.utilisateurService.updateProfil(user.id_utilisateur, dto);
  }

  // ── PATCH /utilisateur/profil/password — CLIENT ───────────────────────────
  @Patch('profil/password')
  @ApiOperation({
    summary: '🔒 CLIENT — Changer mon mot de passe',
    description:
      'Change le mot de passe du client connecté. ' +
      'Requiert la saisie du mot de passe actuel pour vérification. ' +
      'Différent du reset-password qui utilise un OTP par email.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Mot de passe modifié avec succès',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect' })
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.utilisateurService.changePassword(
      user.id_utilisateur,
      dto.motDePasseActuel,
      dto.nouveauMotDePasse,
    );
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN routes — manage all users
  // ══════════════════════════════════════════════════════════════════════════

  // ── GET /utilisateur — ADMIN ──────────────────────────────────────────────
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '🔒 ADMIN — Lister tous les utilisateurs',
    description: 'Retourne la liste des utilisateurs avec filtres optionnels.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by nom, prenom or email',
  })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'statut', required: false })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  findAll(@Query() filter: FilterUtilisateurDto) {
    return this.utilisateurService.findAll(filter);
  }

  // ── GET /utilisateur/:id — ADMIN ──────────────────────────────────────────
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '🔒 ADMIN — Obtenir un utilisateur par ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.findOne(id);
  }

  // ── PATCH /utilisateur/:id — ADMIN ───────────────────────────────────────
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '🔒 ADMIN — Modifier un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtilisateurDto,
  ) {
    return this.utilisateurService.update(id, dto);
  }

  // ── PATCH /utilisateur/:id/activer — ADMIN ───────────────────────────────
  @Patch(':id/activer')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "🔒 ADMIN — Activer le compte d'un utilisateur" })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Compte activé' })
  activer(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.activerCompte(id);
  }

  // ── PATCH /utilisateur/:id/suspendre — ADMIN ─────────────────────────────
  @Patch(':id/suspendre')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "🔒 ADMIN — Suspendre le compte d'un utilisateur" })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Compte suspendu' })
  suspendre(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.suspendreCompte(id);
  }

  // ── PATCH /utilisateur/:id/role — ADMIN ──────────────────────────────────
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "🔒 ADMIN — Changer le rôle d'un utilisateur" })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  changerRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: Role; id_cinema?: number | null },
  ) {
    return this.utilisateurService.changerRole(id, body.role, body.id_cinema);
  }

  // ── DELETE /utilisateur/:id — ADMIN ──────────────────────────────────────
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🔒 ADMIN — Supprimer un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateurService.remove(id);
  }
}
