import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";

export class CreateAuthorDto {
    @ApiProperty({
        example: 'Phan Hoang Quoc Tu',
    })
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @ApiProperty({
        example: 'Male',
    })
    @IsNotEmpty({ message: 'Gender is required' })
    @IsString({ message: 'Gender must be a string' })
    gender: string;

    @ApiProperty({
        example: '2000-01-01',
    })
    @IsNotEmpty({ message: 'Date of birth is required' })
    @IsString({ message: 'Date of birth must be a string' })
    dateOfBirth: Date;
}
