import { Type } from 'class-transformer';
import { CreateShippingDto } from './create-shipping.dto';
import { ValidateNested } from 'class-validator';
import { OrderedProductsDto } from './ordered-products.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
        example: {
            phoneNumber: '1234567890',
            name: 'Tu',
            address: '23 Le Duan',
            city: 'Da Nang',
            postCode: '550000',
            state: 'Da Nang',
            country: 'Viet Nam',
        }
    })
    @Type(() => CreateShippingDto)
    @ValidateNested()
    shippingAddress: CreateShippingDto;

    @ApiProperty({
        example: [
            {
                id: 1,
                product_unit_price: 100000,
                product_quanity: 1,
                title: 'Product 1',
                description: 'Description 1',
                discount: 0,
                images: ["image1"]
            },
            {
                id: 2,
                product_unit_price: 200000,
                product_quanity: 2,
                title: 'Product 2',
                description: 'Description 2',
                discount: 0,
                images: ["image2"]
            }
        ]
    })
    @Type(() => OrderedProductsDto)
    @ValidateNested()
    orderedProducts: OrderedProductsDto[];

    @ApiProperty({
        example: 'cash'
    })
    type: string;

    @ApiProperty({
        example: 'false'
    })
    isPaid: string;
}
