import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class CreateCartDto {
    @ApiProperty({ type: Number, example: 1 })
    @IsNumber({}, { message: "Quantity must be a number" })
    @Min(1, { message: "Quantity must be greater than or equal to 1" })
    quantity: number;
}
