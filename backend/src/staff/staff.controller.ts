import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { StaffService } from './staff.service';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STAFF)
@ApiBearerAuth('JWT-auth')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('seances/today')
  @ApiOperation({
    summary: 'STAFF - Seances du jour',
    description:
      'Retourne les seances programmees aujourd hui pour le cinema assigne au staff connecte.',
  })
  @ApiResponse({ status: 200, description: 'Liste des seances staff du jour' })
  findTodaySeances(@CurrentUser() user: any) {
    return this.staffService.findTodaySeances(user);
  }

  @Post('tickets/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'STAFF - Valider une entree',
    description:
      'Valide une reservation PAYEE/VALIDEE par reference ou QR code et la marque UTILISEE.',
  })
  @ApiResponse({ status: 200, description: 'Resultat de validation du billet' })
  validateTicket(@CurrentUser() user: any, @Body() dto: ValidateTicketDto) {
    return this.staffService.validateTicket(user, dto);
  }
}
