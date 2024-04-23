import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email of the user',
        example: '2WQpD@example.com'
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail()
    email: string;
}