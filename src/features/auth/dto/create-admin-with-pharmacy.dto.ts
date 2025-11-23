import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateAdminWithPharmacyDTO {
  @IsString({ message: 'The pharmacy name must be a string' })
  @IsNotEmpty({ message: 'The pharmacy name is required' })
  @MaxLength(100, { message: 'The name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'The description must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'The description must not exceed 255 characters' })
  description?: string;

  @IsString({ message: 'The address must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'The address must not exceed 255 characters' })
  address?: string;

  @IsString({ message: 'The phone must be a string' })
  @IsNotEmpty({ message: 'The phone number is required' })
  @Matches(/^[0-9+\-()\s]{7,20}$/, {
    message:
      'The phone number must contain only digits, spaces, or symbols (+, -, ())',
  })
  phone: string;

  @IsEmail({}, { message: 'The email must be a valid email address' })
  @IsNotEmpty({ message: 'The email is required' })
  @MaxLength(150, { message: 'The email must not exceed 150 characters' })
  email: string;

  @IsString({ message: 'The password must be a string' })
  @IsNotEmpty({ message: 'The password is required' })
  @MinLength(8, { message: 'The password must have at least 8 characters' })
  @MaxLength(100, { message: 'The password must not exceed 100 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'The password must contain at least one letter and one number',
  })
  password: string;
}
