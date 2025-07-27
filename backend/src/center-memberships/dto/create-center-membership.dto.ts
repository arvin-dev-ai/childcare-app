import { IsUUID } from 'class-validator';

export class CreateCenterMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  centerId: string;

  @IsUUID()
  roleId: string;
}
