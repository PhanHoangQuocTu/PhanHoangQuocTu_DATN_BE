import { IsNotEmpty, IsString } from 'class-validator';
import { SignInDto } from '../../auth/dto/sign-in.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto extends SignInDto {
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
}
