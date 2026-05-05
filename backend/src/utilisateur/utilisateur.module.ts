import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { UtilisateurService } from './utilisateur.service';
import { UtilisateurController } from './utilisateur.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  controllers: [UtilisateurController],   // ← ajout du controller
  providers: [UtilisateurService],
  exports: [UtilisateurService],           // ← AuthModule peut toujours l'utiliser
})
export class UtilisateurModule {}