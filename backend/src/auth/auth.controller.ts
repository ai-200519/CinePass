import {
  Controller, Post, Body, Get,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // ── POST /auth/register ─────────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ── POST /auth/login ────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ── GET /auth/me — get current user ────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async me(@CurrentUser() user: any) {
    return user;
  }
}