import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
  @ApiProperty({
    example: "Content"
  })
  @IsNotEmpty({ message: "Content is required" })
  @IsString({ message: "Content must be a string" })
  content: string;

  @ApiProperty({
    example: 1
  })
  @IsNotEmpty({ message: "Post Id is required" })
  @IsNumber({}, { message: "Post Id must be a number and max decimal places is 2" })
  postId: number;
}