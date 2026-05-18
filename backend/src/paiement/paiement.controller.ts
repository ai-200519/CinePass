// src/paiement/paiement.controller.ts
import {
  Controller, Post, Get, Body,
  Param, ParseIntPipe, UseGuards,
  Req, Headers, HttpCode, HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request }             from 'express';
import { PaiementService }     from './paiement.service';
import { InitierPaiementDto }  from './dto/initier-paiement.dto';
import { JwtAuthGuard }        from '../common/guards/jwt-auth.guard';
import { RolesGuard }          from '../common/guards/roles.guard';
import { Roles }               from '../common/decorators/roles.decorator';
import { Role }                from '../common/enums/role.enum';
import { CurrentUser }         from '../common/decorators/current-user.decorator';

@ApiTags('Paiement')
@Controller('paiement')
export class PaiementController {

  constructor(private readonly paiementService: PaiementService) {}

  // ── POST /paiement/initier — CLIENT ───────────────────────────────────────
  @Post('initier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.STAFF)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Initier un paiement Stripe',
    description:
      'Crée une session de paiement Stripe. ' +
      'Retourne l\'URL de redirection vers la page de paiement Stripe. ' +
      'Le frontend doit rediriger le client vers cette URL.',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id_paiement:     1,
        stripeSessionId: 'cs_test_xxxxxxxxxxxxx',
        url:             'https://checkout.stripe.com/pay/cs_test_xxx',
        montantTotal:    100,
        devise:          'MAD',
        statut:          'EN_ATTENTE',
        message:         'Redirigez le client vers l\'URL Stripe pour le paiement',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Réservation déjà payée ou expirée' })
  @ApiResponse({ status: 403, description: 'Réservation d\'un autre client' })
  @ApiResponse({ status: 404, description: 'Réservation introuvable' })
  initier(
    @Body() dto: InitierPaiementDto,
    @CurrentUser() user: any,
  ) {
    return this.paiementService.initier(dto, user.id_utilisateur);
  }

  // ── GET /paiement/:id_reservation — CLIENT ────────────────────────────────
  @Get(':id_reservation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:     '🔒 CLIENT/STAFF — Statut du paiement',
    description: 'Retourne le statut actuel du paiement pour une réservation.',
  })
  @ApiParam({ name: 'id_reservation', description: 'ID de la réservation' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id_paiement:          1,
        statut:               'ACCEPTE',
        montantTotal:         100,
        devise:               'MAD',
        methode:              'STRIPE',
        referenceTransaction: 'pi_xxxxxxxxxxxxxxxxxx',
        datePaiement:         '2026-05-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Aucun paiement trouvé' })
  getStatus(
    @Param('id_reservation', ParseIntPipe) id_reservation: number,
    @CurrentUser() user: any,
  ) {
    return this.paiementService.getStatus(id_reservation, user.id_utilisateur);
  }

  // ── POST /paiement/webhook — Stripe calls this ────────────────────────────
  // No JWT — Stripe calls this directly
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()   // hide from Swagger — not for frontend devs
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.paiementService.handleWebhook(
      req.rawBody,   // raw body needed for Stripe signature verification
      signature,
    );
    return { received: true };
  }
}
