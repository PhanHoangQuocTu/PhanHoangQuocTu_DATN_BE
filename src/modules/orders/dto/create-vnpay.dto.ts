import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateVnpayDto {
    @ApiProperty({
        example: 10
    })
    @IsNotEmpty({ message: "Price is required" })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: "Price must be a number and max decimal places is 2" })
    @IsPositive({ message: "Price must be a positive number" })
    totalAmount: number;
}
