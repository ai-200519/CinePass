import { Module } from '@nestjs/common';
import { FilmService } from './film.service';
import { FilmController } from './film.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from './entities/film.entity';


@Module({

  imports: [TypeOrmModule.forFeature([Film])], // This creates repository automatically
  controllers: [FilmController],
  providers: [FilmService],
  exports: [FilmService],
})
export class FilmModule { }
