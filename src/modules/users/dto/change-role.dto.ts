import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from 'src/utils/common/user-roles.enum';

export class ChangeRoleDto {
    @ApiProperty({ type: Roles, enum: Roles, required: true, example: Roles.USER })
    @IsNotEmpty({ message: 'Role is required' })
    @IsEnum(Roles)
    role: Roles
}