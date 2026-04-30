import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { UtilisateurService } from './utilisateur.service';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  providers: [UtilisateurService],
  exports: [UtilisateurService],   // ← exported so AuthModule can use it
})
export class UtilisateurModule {}