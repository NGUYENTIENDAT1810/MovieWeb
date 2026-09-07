import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'admin@movieweb.com' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Admin@123456' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
