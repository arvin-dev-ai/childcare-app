import { IsUUID } from 'class-validator';

export class CreateGroupMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  groupId: string;

  @IsUUID()
  roleId: string;
}
