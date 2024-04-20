import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignInDto {
    @ApiProperty({
        example: 'tuphan@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email' })
    email: string;

    @ApiProperty({
        example: 'password123@',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;
}
