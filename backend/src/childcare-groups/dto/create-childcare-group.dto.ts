import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChildcareGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
