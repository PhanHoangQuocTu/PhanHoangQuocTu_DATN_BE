import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Action',
    })
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title: string;

    @ApiProperty({
        example: 'Action books',
    })
    @IsNotEmpty({ message: 'Description is required' })
    @IsString({ message: 'Description must be a string' })
    description: string;
}
