import { Prisma } from '@generated/prisma';
import EmployeeCreateInput = Prisma.EmployeeCreateInput;
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto
  implements Omit<EmployeeCreateInput, 'user' | 'pharmacy'>
{
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsOptional()
  secondName?: string;

  @IsOptional()
  thirdName?: string;

  @IsNotEmpty({ message: 'First surname is required' })
  firstSurname: string;

  @IsOptional()
  secondSurname?: string;

  @IsNotEmpty({ message: 'DUI is required' })
  dui: string;

  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsEmail({}, { message: 'It must be a valid email' })
  @IsOptional()
  email: string;

  @IsString()
  @MaxLength(100, { message: 'It must be a maximum 100 characters' })
  @MinLength(8, { message: 'It must be a minimum 8 characters' })
  password: string;
}
