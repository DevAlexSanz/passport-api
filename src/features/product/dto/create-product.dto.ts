import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsOptional()
  activeIngredient?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsNotEmpty({ message: 'Form is required' })
  form: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  requiresPrescription: boolean;

  @Type(() => Number)
  @IsNumber({}, { message: 'Stock must be a number' })
  stock: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
