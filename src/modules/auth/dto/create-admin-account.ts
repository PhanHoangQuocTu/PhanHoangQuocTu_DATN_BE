import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignUpDto } from './sign-up.dto';

export class CreateAdminAccountDto extends SignUpDto {
    @ApiProperty(
        {
            example: 'datnphqt',
        }
    )
    @IsNotEmpty({ message: 'Verification Code is required' })
    @IsString({ message: 'Verification Code must be a string' })
    verificationCode: string;
}
