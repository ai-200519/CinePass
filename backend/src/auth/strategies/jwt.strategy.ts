import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UtilisateurService } from '../../utilisateur/utilisateur.service';

export interface JwtPayload {
  sub:   number;   // id_utilisateur
  email: string;
  role:  string;
  id_cinema?: number; // ← optional cinema ID for STAFF users
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    private readonly configService: ConfigService,
    private readonly utilisateurService: UtilisateurService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.utilisateurService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (user.statut === 'BANNI') {
      throw new UnauthorizedException('Compte banni');
    }

    // This is attached to request.user
    return {
      id_utilisateur: user.id_utilisateur,
      email:          user.email,
      role:           user.role,
      nom:            user.nom,
      prenom:         user.prenom,
      id_cinema:      user.cinema?.id_cinema || null, // ← include cinema in request.user for STAFF
    };
  }
}