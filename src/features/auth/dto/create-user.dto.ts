import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @IsEmail({}, { message: 'It must be a valid email' })
  @IsOptional()
  email: string;

  @IsString()
  @MaxLength(100, { message: 'It must be a maximum 100 characters' })
  @MinLength(8, { message: 'It must be a minimum 8 characters' })
  password: string;
}
