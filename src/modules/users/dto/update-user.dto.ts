import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends SignUpDto {
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
}