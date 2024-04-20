import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from "src/utils/common/order-status.enum";

export class UpdateOrderStatusDto {
    @ApiProperty({ example: OrderStatus.SHIPPED, description: 'Order Status', type: "String", enum: OrderStatus })
    @IsNotEmpty()
    @IsString()
    @IsIn([OrderStatus.SHIPPED, OrderStatus.DELIVERED])
    status: OrderStatus;
}