import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaiementService } from './paiement.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Paiement')
@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  // ── POST /paiement/initier — CLIENT ─────────────────────────────────────
  @Post('initier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🔒 CLIENT — Initier un paiement Stripe',
    description:
      'Cree une session Stripe Checkout et retourne l URL de paiement.',
  })
  @ApiResponse({ status: 201, description: 'Session Stripe creee' })
  initier(
    @Body() dto: InitierPaiementDto,
    @CurrentUser() user: any,
  ) {
    return this.paiementService.initierPaiement(dto, user);
  }

  // ── GET /paiement/:id_reservation — CLIENT ──────────────────────────────
  @Get(':id_reservation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id_reservation', description: 'ID de la reservation' })
  @ApiOperation({
    summary: '🔒 CLIENT — Statut de paiement',
    description: 'Retourne le statut du paiement pour une reservation.',
  })
  @ApiResponse({ status: 200, description: 'Statut retourne' })
  getStatus(
    @Param('id_reservation', ParseIntPipe) id_reservation: number,
    @CurrentUser() user: any,
  ) {
    return this.paiementService.getStatus(id_reservation, user);
  }

  // ── POST /paiement/webhook — Stripe ─────────────────────────────────────
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook Stripe',
    description: 'Recoil des evenements Stripe (paiement confirme).',
  })
  @ApiResponse({ status: 200, description: 'Webhook traite' })
  webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody) {
      return { received: false, reason: 'Raw body manquant' };
    }

    return this.paiementService.handleWebhook(rawBody, signature);
  }
}
