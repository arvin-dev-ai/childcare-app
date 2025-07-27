import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateChildcareCenterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUUID()
  @IsNotEmpty()
  childcareGroupId: string;
}
