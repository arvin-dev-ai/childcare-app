import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds: string[];

  @IsOptional()
  @IsUUID()
  childcareGroupId?: string;
}
