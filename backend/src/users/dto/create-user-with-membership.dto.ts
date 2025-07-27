import { IsUUID, IsNotEmpty } from 'class-validator';
import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

class CenterAndRoleDto {
  @IsUUID()
  @IsNotEmpty()
  centerId: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

export class CreateUserWithMembershipDto extends IntersectionType(
  PickType(CreateUserDto, ['email', 'password', 'firstName', 'lastName'] as const),
  CenterAndRoleDto,
) {}
