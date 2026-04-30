import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });  // use email instead of username
  }

  async validate(email: string, motDePasse: string) {
    const user = await this.authService.validateUser(email, motDePasse);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return user;
  }
}