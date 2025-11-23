import { IsNotEmpty, IsString } from 'class-validator';
import { Prisma } from '@generated/prisma';

export class CreateProductCategoryDTO
  implements Prisma.ProductCategoryCreateWithoutPharmacyInput
{
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}
