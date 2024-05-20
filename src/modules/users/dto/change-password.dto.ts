import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'Password123@',
    })
    @IsNotEmpty({ message: 'Current Password is required' })
    @MinLength(8, { message: 'Current Password must be at least 8 characters' })
    currentPassword: string;

    @ApiProperty({
        example: 'Password123@',
    })
    @IsNotEmpty({ message: 'New Password is required' })
    @MinLength(8, { message: 'New Password must be at least 8 characters' })
    newPassword: string;
}