import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('CinePass API')
    .setDescription('API documentation for CinePass')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',   // ← reference name used in controllers
    )
    .addTag('Auth', 'Inscription et connexion')
    .addTag('Utilisateur', 'Gestion du profil client')
    .addTag('Cinema', 'Informations du cinéma')
    .addTag('Salle', 'Gestion des salles')
    .addTag('Siege', 'Gestion des sièges')
    .addTag('Film', 'Catalogue des films')
    .addTag('Seance', 'Programmation des séances')
    .addTag('Tarif', 'Grille tarifaire')
    .addTag('Reservation', 'Réservation des places')
    .addTag('Paiement', 'Paiement en ligne')
    .addTag('Notification', 'Notifications client')
    .addTag('Admin', 'Back office administrateur')
    .addTag('Staff', 'Validation des entrees')
    .build();

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // keeps token after page refresh
    },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
