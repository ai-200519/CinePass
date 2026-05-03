// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { FilterReservationDto } from '../reservation/dto/filter-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { StatsFilterDto } from './dto/stats-filter.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── GET /admin/stats ──────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({
    summary: '🔒 ADMIN — KPIs globaux',
    description:
      "Retourne les indicateurs clés globaux : CA, billets vendus, taux de remplissage, taux d'annulation.",
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        periode: { debut: '2026-01-01', fin: '2026-12-31' },
        kpis: {
          totalBillets: 150,
          totalReservations: 200,
          chiffreAffaires: 7500.0,
          devise: 'MAD',
          tauxRemplissageMoyen: '72.5%',
          tauxAnnulation: '10.5%',
        },
      },
    },
  })
  getGlobalStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getGlobalStats(filter);
  }

  // ── GET /admin/stats/films ────────────────────────────────────────────────
  @Get('stats/films')
  @ApiOperation({
    summary: '🔒 ADMIN — Films les plus populaires',
    description:
      'Retourne le classement des films par nombre de réservations et CA généré.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        films: [
          {
            rang: 1,
            id_film: 1,
            title: 'Gladiator II',
            genre: 'Action',
            nbReservations: 45,
            chiffreAffaires: 2250.0,
            devise: 'MAD',
          },
        ],
      },
    },
  })
  getFilmsStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getFilmsStats(filter);
  }

  // ── GET /admin/stats/seances ──────────────────────────────────────────────
  @Get('stats/seances')
  @ApiOperation({
    summary: '🔒 ADMIN — Taux de remplissage par séance',
    description:
      'Retourne le taux de remplissage et les places restantes pour chaque séance.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        seances: [
          {
            id_seance: 1,
            film: 'Gladiator II',
            salle: 'Salle 1',
            capacite: 100,
            nbReservations: 72,
            placesRestantes: 28,
            tauxRemplissage: '72.0%',
            statut: 'BIEN_REMPLI',
          },
        ],
      },
    },
  })
  getSeancesStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getSeancesStats(filter);
  }

  // ── GET /admin/stats/revenus ──────────────────────────────────────────────
  @Get('stats/revenus')
  @ApiOperation({
    summary: "🔒 ADMIN — Chiffre d'affaires par période",
    description: 'Retourne le CA par jour et par méthode de paiement.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        periode: { debut: '2026-05-01', fin: '2026-05-31' },
        totalCA: 7500.0,
        devise: 'MAD',
        parJour: [{ jour: '2026-05-01', ca: 500.0, nbPaiements: 10 }],
        parMethode: [
          { methode: 'CMI', ca: 4000.0, count: 80 },
          { methode: 'STRIPE', ca: 2500.0, count: 50 },
          { methode: 'PAYPAL', ca: 1000.0, count: 20 },
        ],
      },
    },
  })
  getRevenusStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getRevenusStats(filter);
  }

  // ── GET /admin/stats/reservations ─────────────────────────────────────────
  @Get('stats/reservations')
  @ApiOperation({
    summary: '🔒 ADMIN — Réservations par statut',
    description:
      'Retourne la distribution des réservations par statut avec pourcentages.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 200,
        parStatut: [
          { statut: 'PAYEE', count: 80, pourcentage: 40.0 },
          { statut: 'UTILISEE', count: 50, pourcentage: 25.0 },
          { statut: 'ANNULEE', count: 20, pourcentage: 10.0 },
          { statut: 'EXPIREE', count: 30, pourcentage: 15.0 },
          { statut: 'EN_COURS', count: 20, pourcentage: 10.0 },
        ],
      },
    },
  })
  getReservationsStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getReservationsStats(filter);
  }

  // ── GET /admin/reservations ───────────────────────────────────────────────
  @Get('reservations')
  @ApiOperation({
    summary: '🔒 ADMIN — Toutes les réservations',
    description: 'Retourne toutes les réservations avec filtres optionnels.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 2,
        reservations: [
          {
            id: 1,
            reference: 'CP-2026-ABCDEF',
            statut: 'PAYEE',
            dateReservation: '2026-05-01T20:00:00.000Z',
            montant: 100,
            client: {
              nom: 'Alami',
              prenom: 'Youssef',
              email: 'youssef@cinepass.ma',
            },
            film: 'Gladiator II',
            dateSeance: '2026-05-03T19:30:00.000Z',
          },
        ],
      },
    },
  })
  getAllReservations(@Query() filter: FilterReservationDto) {
    return this.adminService.getAllReservations(filter);
  }
  // ── GET /admin/reservations/export ───────────────────────────────────────
  @Get('reservations/export')
  @ApiOperation({
    summary: '🔒 ADMIN — Exporter les réservations en CSV',
    description:
      'Génère et télécharge un fichier CSV de toutes les réservations.',
  })
  @ApiResponse({ status: 200, description: 'Fichier CSV téléchargé' })
  async exportCsv(@Query() filter: FilterReservationDto, @Res() res: Response) {
    const csv = await this.adminService.exportCsv(filter);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reservations_${Date.now()}.csv`,
    );
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  }

  // ── GET /admin/reservations/:id ───────────────────────────────────────────
  @Get('reservations/:id')
  @ApiOperation({
    summary: "🔒 ADMIN — Détail d'une réservation",
    description:
      "Retourne le détail complet d'une réservation avec les sièges.",
  })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        reference: 'CP-2026-ABCDEF',
        statut: 'PAYEE',
        montant: 100,
        devise: 'MAD',
        client: {
          nom: 'Alami',
          prenom: 'Youssef',
          email: 'youssef@cinepass.ma',
        },
        seance: {
          dateHeure: '2026-05-03T19:30:00',
          technologie: '2D',
          film: 'Gladiator II',
          salle: 'Salle 1',
        },
        sieges: [
          { rangee: 'A', numero: 1, categorie: 'VIP', prix: 50 },
          { rangee: 'A', numero: 2, categorie: 'VIP', prix: 50 },
        ],
        nbSieges: 2,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  getReservationById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getReservationById(id);
  }

  // ──  stats/cinemas route ───────────────────────────────────────────────
  @Get('stats/cinemas')
  @ApiOperation({
    summary: '🔒 ADMIN — Comparaison des cinémas',
    description: 'Compare les performances de tous les cinémas.',
  })
  getCinemasStats(@Query() filter: StatsFilterDto) {
    return this.adminService.getCinemasStats(filter);
  }
}
