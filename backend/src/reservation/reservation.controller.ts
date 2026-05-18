// src/reservation/reservation.controller.ts
import {
    Body,
    Controller,
    Delete, Get,
    HttpCode, HttpStatus,
    Param, ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationService } from './reservation.service';

@ApiTags('Reservation')
@Controller('reservation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReservationController {

  constructor(private readonly reservationService: ReservationService) {}

  // ── POST /reservation — CLIENT only ──────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT, Role.STAFF)
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Créer une réservation',
    description:
      'Crée une réservation en statut EN_COURS. ' +
      'Vérifie la disponibilité des sièges en temps réel. ' +
      'Le client a 10 minutes pour payer avant expiration.',
  })
  @ApiResponse({
    status: 201,
    description: 'Réservation créée avec succès',
    schema: {
      example: {
        id_reservation: 1,
        reference:      'CP-2026-A3F8K2',
        statut:         'EN_COURS',
        montantTotal:   100,
        devise:         'MAD',
        expiresAt:      '2026-05-04T21:47:00.000Z',
        message:        'Réservation créée. Vous avez 10 minutes pour payer.',
        seance: {
          id:          1,
          dateHeure:   '2026-05-10T19:30:00',
          technologie: '2D',
          salle:       'Salle 1',
        },
        sieges: [
          {
            id_siege:  5,
            rangee:    'B',
            numero:    3,
            categorie: 'STANDARD',
            prix:      50,
            typePublic: 'NORMAL',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Siège indisponible ou séance invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Rôle CLIENT ou STAFF requis' })
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: any,
  ) {
    return this.reservationService.create(dto, user.id_utilisateur);
  }

  // ── GET /reservation/mes-reservations — CLIENT ────────────────────────────
  @Get('mes-reservations')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT, Role.STAFF)
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Historique des réservations',
    description: 'Retourne toutes les réservations personnelles de l utilisateur connecté.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 2,
        reservations: [
          {
            id_reservation:  1,
            reference:       'CP-2026-A3F8K2',
            statut:          'PAYEE',
            dateReservation: '2026-05-04T20:00:00.000Z',
            montant:         100,
            film:            'Gladiator II',
            poster:          'https://...',
            dateSeance:      '2026-05-10T19:30:00',
            technologie:     '2D',
            salle:           'Salle 1',
            nbSieges:        2,
          },
        ],
      },
    },
  })
  findMesReservations(@CurrentUser() user: any) {
    return this.reservationService.findByUser(user.id_utilisateur);
  }

  // ── GET /reservation/:id — CLIENT ────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Détail d\'une réservation',
    description: 'Retourne le détail d\'une réservation appartenant a l utilisateur connecté.',
  })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  @ApiResponse({ status: 403, description: 'Réservation d\'un autre client' })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.reservationService.findOne(id, user.id_utilisateur);
  }

  // ── GET /reservation/by-reference/:reference — CLIENT
  @Get('by-reference/:reference')
  @ApiOperation({ summary: '🔒 CLIENT — Get reservation by reference' })
  @ApiParam({ name: 'reference', description: 'Reservation reference' })
  findByReference(
    @Param('reference') reference: string,
    @CurrentUser() user: any,
  ) {
    return this.reservationService.findByReference(reference, user.id_utilisateur);
  }

  // ── DELETE /reservation/:id — CLIENT ─────────────────────────────────────
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT, Role.STAFF)
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Annuler une réservation',
    description:
      'Annule une réservation EN_COURS uniquement. ' +
      'Impossible après paiement (PAYEE).',
  })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message:   'Réservation annulée avec succès',
        reference: 'CP-2026-A3F8K2',
        statut:    'ANNULEE',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Annulation impossible (statut != EN_COURS)' })
  @ApiResponse({ status: 403, description: 'Réservation d\'un autre client' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.reservationService.cancel(id, user.id_utilisateur);
  }
}
