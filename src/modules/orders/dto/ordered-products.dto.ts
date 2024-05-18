import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class OrderedProductsDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty({ message: 'Product id is required' })
    id: number;

    @ApiProperty({ example: 100.00 })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Product price must be a number and max decimal places is 2' })
    @IsPositive({ message: 'Product price must be a positive number' })
    product_unit_price: number;

    @ApiProperty({ example: 1 })
    @IsNumber({}, { message: 'Product quanity must be a number' })
    @IsPositive({ message: 'Product quanity must be a positive number' })
    product_quanity: number;

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
        example: 10
    })
    @IsNotEmpty({ message: "Price is required" })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "Price must be a number and max decimal places is 2" })
    @IsPositive({ message: "Price must be a positive number" })
    discount: number;

    @ApiProperty({
        example: ["image1", "image2"]
    })
    @IsNotEmpty({ message: "Images is required" })
    @IsArray({ message: "Images must be an array" })
    images: string[];
}