import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Role } from '@appTypes/Role';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  role: Role;
}
