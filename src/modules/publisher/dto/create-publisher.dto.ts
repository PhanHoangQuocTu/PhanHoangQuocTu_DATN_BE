import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";

export class CreatePublisherDto {
    @ApiProperty({
        example: 'Kim Dong',
    })
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @ApiProperty({
        example: 'Action books',
    })
    @IsNotEmpty({ message: 'Description is required' })
    @IsString({ message: 'Description must be a string' })
    description: string;
}
