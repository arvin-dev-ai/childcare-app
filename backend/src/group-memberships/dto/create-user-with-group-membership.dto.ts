import { IsString, IsEmail, IsUUID, MinLength } from 'class-validator';

export class CreateUserWithGroupMembershipDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsUUID()
  groupId: string;
}
