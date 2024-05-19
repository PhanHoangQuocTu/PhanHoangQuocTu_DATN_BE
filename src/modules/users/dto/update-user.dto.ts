import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Phan',
  })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @ApiProperty({
    example: 'Tu',
  })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @ApiProperty({
    example: '0905123123',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Date of Birth must be a valid date string' })
  dateOfBirth?: Date;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsEnum(["Male", "Female"], { message: 'Gender must be either Male or Female' })
  gender?: 'Male' | 'Female';

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({
    example: 'tuphan@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  email: string;
}