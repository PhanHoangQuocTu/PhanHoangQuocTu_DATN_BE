import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
    @ApiProperty({
        example: "Pizza"
    })
    @IsNotEmpty({ message: "Title is required" })
    @IsString({ message: "Title must be a string" })
    title: string;

    @ApiProperty({
        example: "Description"
    })
    @IsNotEmpty({ message: "Description is required" })
    @IsString({ message: "Description must be a string" })
    description: string;

    @ApiProperty({
        example: ["image1", "image2"]
    })
    @IsNotEmpty({ message: "Images is required" })
    @IsArray({ message: "Images must be an array" })
    images: string[];
  }