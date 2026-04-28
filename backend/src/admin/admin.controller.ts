// admin/admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')              // ← all routes need token
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard KPIs',
    description: '🔒 ADMIN only — Retourne les KPIs : CA, billets vendus, taux de remplissage.',
  })
  @ApiResponse({ status: 200, description: 'KPIs retournés avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé — rôle ADMIN requis' })
  getDashboard() {
    return { message: 'Dashboard KPIs' };
  }
}