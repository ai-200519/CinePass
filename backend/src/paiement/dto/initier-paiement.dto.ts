import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { MethodePaiement } from '../../common/enums/methode-paiement.enum';

export class InitierPaiementDto {
  @ApiProperty({ example: 1, description: 'ID de la reservation' })
  @IsInt()
  @IsPositive()
  id_reservation: number;

  @ApiProperty({
    example: MethodePaiement.STRIPE,
    description: 'Methode de paiement (Stripe uniquement pour maintenant)',
    enum: MethodePaiement,
  })
  @IsEnum(MethodePaiement)
  methode: MethodePaiement;
}
