import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @ApiProperty({
        example: 1
    })
    @IsNotEmpty({ message: "Product id is required" })
    @IsNumber({}, { message: "Product id must be a number" })
    productId: number;

    @ApiProperty({
        example: 5
    })
    @IsNotEmpty({ message: "Ratings is required" })
    @IsNumber({}, { message: "Ratings must be a number" })
    @Min(1, { message: "Ratings must be greater than or equal to 1" })
    @Max(5, { message: "Ratings must be less than or equal to 5" })
    ratings: number;

    @ApiProperty({
        example: "I love this food"
    })
    @IsNotEmpty({ message: "Comment is required" })
    @IsString({ message: "Comment must be a string" })
    comment: string;
}
