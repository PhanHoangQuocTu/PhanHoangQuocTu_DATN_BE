import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateShippingDto {
   @ApiProperty({ example: '09123456789', description: 'Phone number' })
   @IsNotEmpty({ message: 'Phone number is required' })
   @IsString({ message: 'Phone number must be a string' })
   phoneNumber: string;

   @ApiProperty({ example: 'Tu', description: 'Name' })
   @IsOptional()
   @IsString({ message: 'Name must be a string' })
   name: string;

   @ApiProperty({ example: '23 Phan Dinh Phung', description: 'Address' })
   @IsNotEmpty({ message: 'Address is required' })
   @IsString({ message: 'Address must be a string' })
   address: string;

   @ApiProperty({ example: 'Da Nang City', description: 'City' })
   @IsNotEmpty({ message: 'City is required' })
   @IsString({ message: 'City must be a string' })
   city: string;

   @ApiProperty({ example: '550000', description: 'Post code' })
   @IsNotEmpty({ message: 'Post code is required' })
   @IsString({ message: 'Post code must be a string' })
   postCode: string;

   @ApiProperty({ example: 'Da Nang', description: 'State' })
   @IsNotEmpty({ message: 'State is required' })
   @IsString({ message: 'State must be a string' })
   state: string;

   @ApiProperty({ example: 'Viet Nam', description: 'Country' })
   @IsNotEmpty({ message: 'Country is required' })
   @IsString({ message: 'Country must be a string' })
   country: string;
}