import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

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
}