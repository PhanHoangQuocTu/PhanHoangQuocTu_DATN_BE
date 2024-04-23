import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActiveAccountDto {
    @ApiProperty({
        example: '123456',
    })
    @IsNotEmpty({ message: 'Verify Code is required' })
    @IsString({ message: 'Verify Code must be a string' })
    verifyCode: string;
}
