import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Prisma } from '@generated/prisma';

export class CreateProductDTO implements Prisma.ProductCreateWithoutPharmacyInput {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'ActiveIngredient is required' })
  activeIngredient: string;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'ManoFacturer is required' })
  manoFacturer: string;

  @IsString()
  @IsNotEmpty({ message: 'Form is required' })
  form: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  requirePrescription: boolean;

  @Type(() => Number)
  @IsNumber({}, { message: 'Stock must be a number' })
  stock: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @Type(() => Number)
  @IsOptional()
  discount?: number;


  image: string;

  @IsDateString()
  @IsNotEmpty({ message: 'ExpirationDate is required' })
  expirationDate: string;

  @IsString()
  @IsNotEmpty({ message: 'BatchNumber is required' })
  batchNumber: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
